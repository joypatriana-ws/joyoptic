import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content-page";
import { getPost, plainText } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || plainText(post.bodyHtml),
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article" },
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const date = post.createdAt
    ? new Intl.DateTimeFormat("ro-RO", { dateStyle: "long", timeZone: "Europe/Bucharest" }).format(new Date(post.createdAt))
    : null;

  return (
    <ContentPage
      item={post}
      kicker={
        <p className="mb-3 text-cerneala-2">
          <Link href="/blog" className="font-semibold text-lentila hover:underline">
            Articole
          </Link>
          {date && <>, publicat pe {date}</>}
        </p>
      }
    />
  );
}
