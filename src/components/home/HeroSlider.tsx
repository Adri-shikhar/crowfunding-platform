"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { FiArrowRight } from "react-icons/fi";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { buttonClasses } from "@/components/ui";

interface Banner {
  eyebrow: string;
  heading: string;
  subheading: string;
  gradient: string;
  image: string;
}

const banners: Banner[] = [
  {
    eyebrow: "Fund what matters",
    heading: "Turn small credits into real-world change.",
    subheading:
      "Back reviewed campaigns — solar classrooms, community markets, open-source tools — and watch your credits become impact you can see.",
    gradient: "from-indigo-600 via-violet-600 to-fuchsia-600",
    image: "https://picsum.photos/seed/fundspring-hero-1/1600/900",
  },
  {
    eyebrow: "For creators",
    heading: "Bring your idea to a community that shows up.",
    subheading:
      "Launch a campaign in minutes, get admin-verified for trust, and withdraw what you raise. No spreadsheets, no hidden fees.",
    gradient: "from-teal-600 via-emerald-600 to-lime-600",
    image: "https://picsum.photos/seed/fundspring-hero-2/1600/900",
  },
  {
    eyebrow: "Built on trust",
    heading: "Every campaign is reviewed before it goes live.",
    subheading:
      "Declined pledges are refunded automatically and every credit is accounted for. Give with confidence, from the first pledge to the last.",
    gradient: "from-orange-600 via-amber-600 to-rose-600",
    image: "https://picsum.photos/seed/fundspring-hero-3/1600/900",
  },
];

export function HeroSlider() {
  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="h-[80vh] max-h-[680px] min-h-[520px] w-full"
      >
        {banners.map((b, i) => (
          <SwiperSlide key={i}>
            <div className="relative h-full w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-br ${b.gradient} opacity-90`}
              />
              <div className="absolute inset-0 bg-black/25" />
              <div className="relative mx-auto flex h-full w-full max-w-7xl items-center px-4 sm:px-6">
                <div className="max-w-2xl text-white">
                  <span className="inline-block rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-semibold backdrop-blur-sm">
                    {b.eyebrow}
                  </span>
                  <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
                    {b.heading}
                  </h1>
                  <p className="mt-5 max-w-xl text-lg text-white/90">
                    {b.subheading}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/explore-campaigns"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-neutral-900 transition-transform hover:scale-[1.03]"
                    >
                      Explore Campaigns <FiArrowRight />
                    </Link>
                    <Link
                      href="/signup"
                      className={`${buttonClasses(
                        "outline",
                        "lg",
                      )} border-white/70 bg-white/10 text-white hover:border-white hover:text-white`}
                    >
                      Start a Campaign
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
