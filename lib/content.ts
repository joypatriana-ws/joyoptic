import { connectDb } from "./db";
import { Page, Post } from "./models";

export type ContentItem = {
  slug: string;
  title: string;
  bodyHtml: string;
  excerpt: string;
  images?: { title?: string | null; src?: string | null }[];
  updatedAt?: Date | string;
  createdAt?: Date | string;
};

// Fără MONGODB_URI (local, înainte de import) citim previzualizarea importului: output/import-preview.json.
async function preview(): Promise<{ pages: (ContentItem & { published: boolean })[]; posts: (ContentItem & { published: boolean })[] } | null> {
  if (process.env.MONGODB_URI) return null;
  try {
    const fs = await import("node:fs/promises");
    return JSON.parse(await fs.readFile("output/import-preview.json", "utf8"));
  } catch {
    return null;
  }
}

export async function getPage(slug: string): Promise<ContentItem | null> {
  const p = await preview();
  if (p) return p.pages.find((x) => x.slug === slug && x.published) ?? null;
  await connectDb();
  return Page.findOne({ slug, published: true }).lean<ContentItem>();
}

export async function getPost(slug: string): Promise<ContentItem | null> {
  const p = await preview();
  if (p) return p.posts.find((x) => x.slug === slug && x.published) ?? null;
  await connectDb();
  return Post.findOne({ slug, published: true }).lean<ContentItem>();
}

export async function listPosts(): Promise<ContentItem[]> {
  const p = await preview();
  if (p) return p.posts.filter((x) => x.published);
  await connectDb();
  return Post.find({ published: true }).sort({ createdAt: -1 }).lean<ContentItem[]>();
}


/** Textul simplu dintr-un fragment HTML, pentru descrieri meta. */
export function plainText(html: string, max = 160) {
  const t = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&([a-z]+);/gi, (m, e) => ({ icirc: "î", Icirc: "Î", acirc: "â", Acirc: "Â", bdquo: "„", rdquo: "”", nbsp: " ", amp: "&" })[e as string] ?? m)
    .replace(/\s+/g, " ")
    .trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}
