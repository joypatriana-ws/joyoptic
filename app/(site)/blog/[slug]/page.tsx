import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NodeBody } from "@/components/theme/node-body";
import { getPost } from "@/lib/content";
import { sectionClasses } from "@/lib/theme-classes.mjs";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, alternates: { canonical: `/blog/${post.slug}` } } : {};
}

// .blog-details .content … din main.css
const content = [
  "mt-5",
  "[&_h3]:mt-[30px] [&_h3]:text-[22px] [&_h3]:font-bold",
  "[&_blockquote]:relative [&_blockquote]:my-5 [&_blockquote]:overflow-hidden [&_blockquote]:bg-default/5 [&_blockquote]:p-[60px] [&_blockquote]:text-center",
  "[&_blockquote_p]:mb-0 [&_blockquote_p]:text-[22px] [&_blockquote_p]:leading-[1.6] [&_blockquote_p]:font-medium [&_blockquote_p]:italic [&_blockquote_p]:text-default",
  "[&_blockquote]:after:absolute [&_blockquote]:after:top-0 [&_blockquote]:after:bottom-0 [&_blockquote]:after:left-0 [&_blockquote]:after:my-5 [&_blockquote]:after:w-[3px] [&_blockquote]:after:bg-accent [&_blockquote]:after:content-['']",
].join(" ");

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Nodes/view_blog.ctp */
export default async function BlogPost({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  // date('d M Y') din PHP, pe ora României
  const created = post.createdAt ? new Date(post.createdAt) : null;
  const parts = created
    ? Object.fromEntries(
        new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Bucharest", day: "2-digit", month: "numeric", year: "numeric" })
          .formatToParts(created)
          .map((p) => [p.type, p.value]),
      )
    : null;

  // În view_blog.ctp wrapper-ul e `<div class="container>">` (ghilimea în plus), deci fără .container:
  // conținutul pornește de la marginea stângă. Păstrat ca pe site-ul vechi.
  return (
    <div>
      <div className="flex flex-wrap -mx-3 *:px-3 *:shrink-0 *:w-full *:max-w-full">
        <div className="lg:w-2/3">
          <section id="blog-details" className={`${sectionClasses()} pb-[30px]!`}>
            <article className="bg-surface p-[30px] shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
              <h2 className="my-[30px] p-0 text-[28px] font-bold text-heading">{post.title}</h2>

              <div className="mt-5 text-default/60">
                <ul className="m-0 flex list-none flex-wrap items-center p-0 [&_li+li]:pl-5">
                  <li className="flex items-center">
                    <i className="bi bi-person mr-2 text-[16px] leading-0 text-default/60" /> Joy Optic
                  </li>
                  {created && parts && (
                    <li className="flex items-center">
                      <i className="bi bi-clock mr-2 text-[16px] leading-0 text-default/60" />{" "}
                      <time dateTime={created.toISOString().slice(0, 10)}>
                        {parts.day} {months[Number(parts.month) - 1]} {parts.year}
                      </time>
                    </li>
                  )}
                </ul>
              </div>

              <div className={content}>
                <NodeBody html={post.bodyHtml} />
              </div>

              <div className="border-t border-default/10 pt-2.5">
                <i className="bi bi-folder inline text-default/60" />
                <ul className="inline list-none p-0 pr-5 text-[14px]">
                  <li className="inline-block">
                    <a href="#" className="text-default/60 transition hover:text-accent">
                      Uncategorized
                    </a>
                  </li>
                </ul>
                <i className="bi bi-tags inline text-default/60" />
                <ul className="inline list-none p-0 text-[14px]" />
              </div>
            </article>
          </section>
        </div>
      </div>
    </div>
  );
}
