import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content-page";
import { getPage, plainText } from "@/lib/content";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.excerpt || plainText(page.bodyHtml),
    alternates: { canonical: `/page/${page.slug}` },
  };
}

/** Întrebările din FAQ ca date structurate, din <details><summary>. */
function faqJsonLd(html: string) {
  const items = [...html.matchAll(/<details><summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)];
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([, q, a]) => ({
      "@type": "Question",
      name: plainText(q, 300),
      acceptedAnswer: { "@type": "Answer", text: plainText(a, 2000) },
    })),
  };
}

export default async function Page({ params }: Props) {
  const page = await getPage((await params).slug);
  if (!page) notFound();
  const faq = faqJsonLd(page.bodyHtml);

  return (
    <>
      {faq && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      )}
      <ContentPage item={page} kicker={<p className="mb-3 font-semibold text-lentila">{site.name}</p>} />
    </>
  );
}
