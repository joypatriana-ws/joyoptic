"use client";

import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { sectionClasses, sectionTitle } from "@/lib/theme-classes.mjs";
import { sectionId } from "@/lib/slugs.mjs";

export type Offer = { media: string; title: string; html: string };

/**
 * <section id="special-offers" class="special-offers section light-background"> (blocul Croogo „special-offers").
 * Se afișează doar când blocul e activ (vezi isBlockActive).
 */
export function SpecialOffers({ offers }: { offers: Offer[] }) {
  return (
    <section id={sectionId("special-offers")} className={`${sectionClasses({ light: true })} py-14! lg:py-20!`}>
      <div
        className={`container-bs ${sectionTitle} [&_h2]:mb-2! [&_h2]:text-[32px] [&_p]:mb-7 [&_p]:text-default/70`}
        data-aos="fade-up"
      >
        <h2>Oferte Speciale</h2>
        <p>Beneficiază de cele mai bune oferte la rame și lentile de ochelari.</p>
      </div>

      <div className="container-bs" data-aos="fade-up" data-aos-delay="100">
        <Swiper
          modules={[Autoplay, Pagination]}
          loop
          speed={600}
          autoplay={{ delay: 4000 }}
          slidesPerView={1}
          breakpoints={{ 640: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 992: { slidesPerView: 3 } }}
          pagination={{ clickable: true }}
          className="py-3! [&_.swiper-pagination]:relative [&_.swiper-pagination]:mt-2 [&_.swiper-pagination-bullet-active]:bg-accent!"
        >
          {offers.map((o) => (
            <SwiperSlide key={o.title} className="flex! h-auto! items-stretch justify-center px-2 py-3 lg:p-7">
              {/* .card.shadow-sm.text-center.offers-card */}
              <div className="flex h-full w-full max-w-[480px] flex-col overflow-hidden rounded-xl border border-accent/20 bg-[color-mix(in_srgb,var(--color-accent),#ffffff_88%)] text-center shadow-[0_8px_20px_rgba(16,24,32,0.06)] lg:max-w-[520px]">
                <div
                  className="h-40 w-full flex-[0_0_160px] bg-size-[56%_auto] bg-position-[center_18px] bg-no-repeat"
                  style={{ backgroundImage: `url('${o.media}')` }}
                />
                <div className="flex flex-auto flex-col justify-center px-[22px] pt-3 pb-[22px]">
                  <h5 className="mb-2 text-[18px] font-bold text-heading">{o.title}</h5>
                  <p className="mb-0 text-[1.25rem] font-light text-default/70" dangerouslySetInnerHTML={{ __html: o.html }} />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
