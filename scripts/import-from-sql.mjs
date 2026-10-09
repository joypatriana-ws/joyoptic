// Importă datele din dump-ul Croogo (joyoptic_ws.sql) în MongoDB.
//
//   node --env-file=.env.local scripts/import-from-sql.mjs --dry-run   # scrie doar output/import-preview.json
//   node --env-file=.env.local scripts/import-from-sql.mjs             # scrie în MONGODB_URI
//
// Tabelele Croogo de infrastructură (acos, aros, settings, taxonomies demo etc.) sunt ignorate.

import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

const SQL_PATH =
  process.env.SQL_DUMP ??
  "migrare/joyoptic.dev/app/Config/Schema/sql/joyoptic_ws.sql";
const DRY_RUN = process.argv.includes("--dry-run");

// ---------- parser pentru INSERT-urile din phpMyAdmin ----------

function parseInserts(sql) {
  const tables = {};
  const re = /INSERT INTO `(\w+)` \(([^)]*)\) VALUES\s*/g;
  let m;
  while ((m = re.exec(sql))) {
    const table = m[1];
    const cols = m[2].split(",").map((c) => c.trim().replace(/`/g, ""));
    const { rows, end } = parseValues(sql, re.lastIndex);
    re.lastIndex = end;
    tables[table] = (tables[table] ?? []).concat(
      rows.map((r) => Object.fromEntries(cols.map((c, i) => [c, r[i]]))),
    );
  }
  return tables;
}

function parseValues(sql, pos) {
  const rows = [];
  let row = null;
  let i = pos;
  while (i < sql.length) {
    const ch = sql[i];
    if (row === null) {
      if (ch === "(") row = [];
      else if (ch === ";") return { rows, end: i + 1 };
      i++;
      continue;
    }
    if (ch === "'") {
      let s = "";
      i++;
      while (sql[i] !== "'" || sql[i + 1] === "'") {
        if (sql[i] === "\\") {
          const n = sql[i + 1];
          s += { n: "\n", r: "\r", t: "\t", 0: "\0" }[n] ?? n;
          i += 2;
        } else if (sql[i] === "'") {
          s += "'";
          i += 2;
        } else s += sql[i++];
      }
      row.push(s);
      i++;
    } else if (ch === ")") {
      rows.push(row);
      row = null;
      i++;
    } else if (ch === "," || /\s/.test(ch)) {
      i++;
    } else {
      let tok = "";
      while (!/[,)]/.test(sql[i])) tok += sql[i++];
      tok = tok.trim();
      row.push(tok === "NULL" ? null : Number(tok));
    }
  }
  throw new Error("INSERT neterminat");
}

// ---------- transformări ----------

// Croogo salva orele ca oră locală România (cu ora de vară), fără fus orar.
function date(s) {
  if (!s) return null;
  const asUtc = new Date(s.replace(" ", "T") + "Z");
  const local = new Date(
    asUtc.toLocaleString("en-US", { timeZone: "Europe/Bucharest" }),
  );
  const utcView = new Date(asUtc.toLocaleString("en-US", { timeZone: "UTC" }));
  return new Date(asUtc.getTime() - (local - utcView));
}

function slugFromLink(link) {
  const m = /slug:([\w-]+)/.exec(link);
  if (m) return `/page/${m[1]}`;
  if (link.includes("action:promoted")) return "/";
  if (link.includes("controller:contacts")) return "/contact";
  return link;
}

// HTML-ul din Croogo e markup Bootstrap al temei vechi. Păstrăm doar structura de text,
// stilul îl dă site-ul nou (.continut).
function cleanHtml(html) {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/​/g, "")
    .replace(/<i\b[^>]*>\s*<\/i>/g, "")
    // FAQ: item Bootstrap → <details>
    .replace(
      /<div class="faq-item">\s*<h3[^>]*>([\s\S]*?)<\/h3>\s*<div class="faq-content">([\s\S]*?)<\/div>/g,
      "<details><summary>$1</summary>$2</details>",
    )
    .replace(/\/theme\/(?:joy_optic|JoyOptic)\/assets\/img\//g, "/img/")
    // date de contact vechi rămase în texte
    .replace(/0722 509 424/g, "0787 698 398")
    .replace(/joypatriana8@gmail\.com/g, "contact@joyoptic.ro");

  // scoatem toate atributele, în afară de href / src / alt
  s = s.replace(/<(\w+)((?:\s+[\w-]+(?:="[^"]*")?)*)\s*(\/?)>/g, (_, tag, attrs, self) => {
    const keep = [...attrs.matchAll(/\s+(href|src|alt)="([^"]*)"/g)]
      .map((m) => ` ${m[1]}="${m[2]}"`)
      .join("");
    return `<${tag}${keep}${self ? " /" : ""}>`;
  });

  s = s
    .replace(/<\/?(div|section)>/g, "\n")
    // titlul paginii îl afișează layout-ul; scoatem primul h1/h2 de la început
    .replace(/^\s*<h[12]>[\s\S]*?<\/h[12]>/, "")
    .replace(/<p>\s*<\/p>/g, "")
    .replace(/<(h\d|p|li|summary)>\s+/g, "<$1>")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
  return s;
}

// Titluri rămase în engleză din instalarea Croogo.
const titleRo = { "Frequently Asked Questions": "Întrebări frecvente" };

function transform(t) {
  const imagesByNode = {};
  for (const i of t.images ?? []) (imagesByNode[i.node_id] ??= []).push(i);

  const pages = t.nodes
    .filter((n) => n.type === "page")
    .map((n) => ({
      legacyId: n.id,
      slug: n.slug,
      title: titleRo[n.title] ?? n.title,
      bodyHtml: cleanHtml(n.body),
      legacyBodyHtml: n.body,
      excerpt: n.excerpt || "",
      published: n.status === 1,
      promoted: n.promote === 1,
      images: (imagesByNode[n.id] ?? []).map((i) => ({
        title: i.title,
        src: `/img/pages/${i.file}`,
        weight: i.weight,
      })),
      createdAt: date(n.created),
      updatedAt: date(n.updated),
    }));

  const posts = t.nodes
    .filter((n) => n.type === "blog")
    .map((n) => ({
      legacyId: n.id,
      slug: n.slug,
      title: n.title,
      bodyHtml: cleanHtml(n.body),
      legacyBodyHtml: n.body,
      excerpt: n.excerpt || "",
      published: n.status === 1,
      createdAt: date(n.created),
      updatedAt: date(n.updated),
    }));

  const menus = t.menus
    .filter((m) => ["main", "footer", "services"].includes(m.alias))
    .map((m) => ({
      alias: m.alias,
      title: m.title,
      links: t.links
        .filter((l) => l.menu_id === m.id && l.status === 1)
        .sort((a, b) => a.lft - b.lft)
        .map((l) => ({ title: l.title, href: slugFromLink(l.link) })),
    }));

  const c = t.contacts.find((c) => c.alias === "contact");
  const contact = {
    name: c.name,
    address: c.address,
    city: c.state,
    postcode: c.postcode,
    phone: "0787 698 398", // în DB era greșit „0729 698 398"
    email: c.email,
  };

  const bookingTypes = t.booking_types.map((b) => ({
    legacyId: b.id,
    title: b.title,
  }));

  const detailsById = Object.fromEntries(
    t.booking_details.map((d) => [d.id, d]),
  );
  const bookings = t.bookings.map((b) => {
    const d = detailsById[b.booking_detail_id] ?? {};
    let extra = {};
    try {
      extra = JSON.parse(d.data ?? "{}");
    } catch {}
    return {
      legacyId: b.id,
      bookingTypeLegacyId: b.booking_type_id,
      start: date(b.start),
      end: date(b.end),
      confirmed: b.user_confirmed === 1,
      name: (d.name ?? "").trim(),
      phone: d.phone ?? "",
      email: d.email ?? "",
      doctor: extra.doctor || "",
      createdAt: date(b.created),
      updatedAt: date(b.updated),
    };
  });

  const messages = t.messages.map((m) => ({
    legacyId: m.id,
    name: m.name.trim(),
    email: m.email,
    phone: m.phone ?? "",
    subject: m.title ?? "",
    body: m.body ?? "",
    read: m.status === 1,
    createdAt: date(m.created),
  }));

  return { pages, posts, menus, contact, bookingTypes, bookings, messages };
}

// ---------- rulare ----------

const sql = fs.readFileSync(SQL_PATH, "utf8");
const data = transform(parseInserts(sql));

console.log(
  Object.entries(data)
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.length : 1}`)
    .join(", "),
);

if (DRY_RUN) {
  fs.mkdirSync("output", { recursive: true });
  const out = path.join("output", "import-preview.json");
  fs.writeFileSync(out, JSON.stringify(data, null, 2));
  console.log(`dry-run: am scris ${out}`);
  process.exit(0);
}

if (!process.env.MONGODB_URI) throw new Error("Lipsește MONGODB_URI");
await mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.MONGODB_DB ?? "joyoptic",
});
const db = mongoose.connection.db;

const typeTitles = Object.fromEntries(data.bookingTypes.map((t) => [t.legacyId, t.title]));

const upsertAll = async (coll, docs, key = "legacyId") => {
  for (const d of docs)
    await db.collection(coll).updateOne({ [key]: d[key] }, { $set: d }, { upsert: true });
  console.log(`${coll}: ${docs.length}`);
};

await upsertAll("pages", data.pages);
await upsertAll("posts", data.posts);
await upsertAll("menus", data.menus, "alias");
await db
  .collection("settings")
  .updateOne({ key: "contact" }, { $set: { key: "contact", value: data.contact } }, { upsert: true });
await upsertAll(
  "bookings",
  data.bookings.map(({ bookingTypeLegacyId, ...b }) => ({
    ...b,
    bookingTypeId: bookingTypeLegacyId,
    bookingTypeTitle: typeTitles[bookingTypeLegacyId] ?? "",
  })),
);
await upsertAll("messages", data.messages);

await mongoose.disconnect();
console.log("gata");
