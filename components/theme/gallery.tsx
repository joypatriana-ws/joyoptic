import { rowClasses, sectionClasses } from "@/lib/theme-classes.mjs";
import { gallery } from "@/lib/site";
import { SectionTitle } from "./section-title";

/** <section id="gallery" class="gallery section"> din Elements/home_gallery.ctp */
export function Gallery() {
  return (
    <section id="gallery" className={sectionClasses()}>
      <SectionTitle
        title="Galerie"
        text="Descoperiți imagini din cabinetul nostru și gama variată de produse disponibile."
      />

      <div className="w-full px-3 mx-auto" data-aos="fade-up" data-aos-delay="100">
        <div className={rowClasses(0, 0)}>
          {gallery.map((img) => (
            <div key={img.src} className="md:w-1/3 lg:w-1/4">
              <div className="overflow-hidden border-r-[3px] border-b-[3px] border-white">
                <a href={img.src} className="glightbox" data-gallery="gallery">
                  {/* eslint-disable-next-line @next/next/no-img-element -- markup-ul temei, imagini statice */}
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-auto max-w-full transition-all duration-400 ease-in-out hover:scale-110"
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
