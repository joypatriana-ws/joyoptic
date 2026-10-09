import { sectionTitle } from "@/lib/theme-classes.mjs";

/** <div class="container section-title" data-aos="fade-up"> din temă */
export function SectionTitle({ title, text }: { title: string; text: string }) {
  return (
    <div className={`container-bs ${sectionTitle}`} data-aos="fade-up">
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
