"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { FaQuoteLeft } from "react-icons/fa6";
import "swiper/css";
import "swiper/css/pagination";
import { TESTIMONIALS } from "@/data/seed";
import { Avatar } from "@/components/Image";

export function Testimonials() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Loved by the community
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            Supporters and creators, in their words
          </h2>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 4500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={24}
          loop
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="mt-12 !pb-14"
        >
          {TESTIMONIALS.map((t) => (
            <SwiperSlide key={t.id} className="h-auto">
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-bg p-6">
                <FaQuoteLeft className="text-2xl text-accent/30" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-body">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <Avatar src={t.photo} name={t.name} size={44} />
                  <div>
                    <p className="text-sm font-semibold text-heading">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
