import type { ReactNode } from "react";
import { sectionClasses } from "@/lib/theme-classes.mjs";
import { SectionTitle } from "./section-title";

/** Pagină de text (politici) în stilul temei: titlu de secțiune + conținut aerisit. */
export function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <section className={sectionClasses()}>
      <SectionTitle title={title} text={intro} />
      <div
        className={[
          "container-bs max-w-[860px]!",
          "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-[22px] [&_h2]:font-bold",
          "[&_p]:leading-relaxed [&_li]:mb-1.5 [&_li]:leading-relaxed",
        ].join(" ")}
      >
        {children}
      </div>
    </section>
  );
}
