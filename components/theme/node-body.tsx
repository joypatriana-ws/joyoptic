/** Corpul unei pagini din DB (HTML-ul temei, convertit la Tailwind la import), randat ca atare. */
export function NodeBody({ html }: { html: string }) {
  if (!html) return null;
  return <div className="contents" dangerouslySetInnerHTML={{ __html: html }} />;
}
