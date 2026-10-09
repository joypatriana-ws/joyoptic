import { connectDb } from "./db";
import { Block, Page, Post } from "./models";

export type ContentItem = {
  legacyId?: number;
  slug: string;
  /** slug-ul din Croogo (about-us, gallery…), după care se recunosc secțiunile speciale */
  legacySlug?: string;
  title: string;
  bodyHtml: string;
  excerpt: string;
  published?: boolean;
  promoted?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type Preview = { pages: ContentItem[]; posts: ContentItem[]; blocks?: { alias: string; active: boolean }[] };

// Fără MONGODB_URI (local, înainte de import) citim previzualizarea importului: output/import-preview.json.
async function preview(): Promise<Preview | null> {
  if (process.env.MONGODB_URI) return null;
  try {
    const fs = await import("node:fs/promises");
    return JSON.parse(await fs.readFile("output/import-preview.json", "utf8"));
  } catch {
    return null;
  }
}

/**
 * Paginile promovate, în ordinea din Croogo: ele compun prima pagină (Nodes/promoted.ctp).
 * Ca în Croogo, statusul nu contează aici (hero-ul e nepublicat ca pagină, dar apare pe prima pagină).
 */
export async function listPromotedPages(): Promise<ContentItem[]> {
  const p = await preview();
  if (p) return p.pages.filter((x) => x.promoted).sort((a, b) => (a.legacyId ?? 0) - (b.legacyId ?? 0));
  await connectDb();
  return Page.find({ promoted: true }).sort({ legacyId: 1 }).lean<ContentItem[]>();
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

/** Un bloc Croogo e activ? (ex. „special-offers": secțiunea de oferte și linkul ei din meniu) */
export async function isBlockActive(alias: string): Promise<boolean> {
  const p = await preview();
  if (p) return p.blocks?.find((b) => b.alias === alias)?.active ?? false;
  await connectDb();
  const block = await Block.findOne({ alias }).lean<{ active: boolean }>();
  return block?.active ?? false;
}

/** Textul simplu dintr-un fragment HTML, pentru descrieri meta. */
export function plainText(html: string, max = 160) {
  const t = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}
