import type { Metadata } from "next";
import Link from "next/link";
import { listPosts, plainText } from "@/lib/content";

export const metadata: Metadata = {
  title: "Articole despre sănătatea ochilor",
  alternates: { canonical: "/blog" },
};

export const revalidate = 300;

export default async function Blog() {
  const posts = await listPosts();
  return (
    <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6 md:pt-20">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Articole</h1>
      <ul className="mt-10 max-w-[68ch] divide-y divide-linie">
        {posts.map((p) => (
          <li key={p.slug} className="py-6">
            <h2 className="text-2xl font-bold">
              <Link href={`/blog/${p.slug}`} className="hover:text-lentila">
                {p.title}
              </Link>
            </h2>
            <p className="mt-2 text-cerneala-2">{p.excerpt || plainText(p.bodyHtml, 220)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
