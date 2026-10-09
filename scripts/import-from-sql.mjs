// Importă datele din dump-ul Croogo (joyoptic_ws.sql) în MongoDB.
//
//   node --env-file=.env.local scripts/import-from-sql.mjs --dry-run   # scrie doar output/import-preview.json
//   node --env-file=.env.local scripts/import-from-sql.mjs             # scrie în MONGODB_URI
//
// Tabelele Croogo de infrastructură (acos, aros, settings, taxonomies demo etc.) sunt ignorate.

import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import { convertThemeHtml } from "./convert-theme-html.mjs";
import { pagePath, pageSlugs } from "../lib/slugs.mjs";
import { defaultOffers } from "../lib/offers.mjs";

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
  if (m) return pagePath(m[1]);
  if (link.includes("action:promoted")) return "/";
  if (link.includes("controller:contacts")) return "/contact";
  return link;
}

const unknownClasses = new Set();
function cleanHtml(html) {
  const r = convertThemeHtml(html);
  r.unknown.forEach((c) => unknownClasses.add(c));
  return r.html;
}

function transform(t) {
  const imagesByNode = {};
  for (const i of t.images ?? []) (imagesByNode[i.node_id] ??= []).push(i);

  const pages = t.nodes
    .filter((n) => n.type === "page")
    .map((n) => ({
      legacyId: n.id,
      slug: pageSlugs[n.slug] ?? n.slug,
      legacySlug: n.slug,
      title: n.title,
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

  // Blocurile Croogo: contează doar dacă sunt active (ex. special-offers → secțiunea „Oferte Speciale").
  const blocks = t.blocks
    .filter((b) => b.alias === "special-offers")
    .map((b) => ({ alias: b.alias, title: b.title, active: b.status === 1 }));

  // Administratorii din Croogo. Parolele nu se pot muta (sha1 cu sarea vechii instalări):
  // fiecare cont își setează parola dintr-un link (vezi scripts/admin-user.mjs).
  const users = t.users.map((u) => ({
    legacyId: u.id,
    email: u.email.toLowerCase(),
    name: u.name === "admin" ? "Admin" : u.name,
    active: u.status === 1,
  }));

  return { pages, posts, menus, contact, bookingTypes, bookings, messages, blocks, users };
}

// ---------- rulare ----------

const sql = fs.readFileSync(SQL_PATH, "utf8");
const data = transform(parseInserts(sql));

if (unknownClasses.size) console.warn("Clase fără echivalent Tailwind:", [...unknownClasses].join(", "));
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
// textele blocului se pun doar la prima creare, ca să nu suprascriem ce s-a editat în admin
for (const b of data.blocks) {
  await db.collection("blocks").updateOne({ alias: b.alias }, { $set: b }, { upsert: true });
  await db
    .collection("blocks")
    .updateOne(
      { alias: b.alias, items: { $exists: false } },
      { $set: { items: b.alias === "special-offers" ? defaultOffers : [] } },
    );
}
console.log(`blocks: ${data.blocks.length}`);
// conturile: parola și starea de logare nu se ating la reimport
for (const u of data.users) {
  await db.collection("users").updateOne(
    { email: u.email },
    { $set: u, $setOnInsert: { passwordHash: null, createdAt: new Date() } },
    { upsert: true },
  );
}
console.log(`users: ${data.users.length}`);
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
