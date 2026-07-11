import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiCpu,
  FiFeather,
  FiBookOpen,
  FiHeart,
  FiMusic,
  FiUsers,
  FiTarget,
  FiGift,
} from "react-icons/fi";
import { CATEGORIES } from "@/data/seed";

const ICONS: Record<string, IconType> = {
  technology: FiCpu,
  environment: FiFeather,
  education: FiBookOpen,
  health: FiHeart,
  arts: FiMusic,
  community: FiUsers,
  games: FiTarget,
  "social-good": FiGift,
};

export function Categories() {
  return (
    <section id="categories" className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-accent">
          Explore by category
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">
          Find a cause that fits you
        </h2>
        <p className="mt-3 text-muted">
          Eight categories, one shared goal: help good ideas find the people who
          will fund them.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.slug] ?? FiTarget;
          return (
            <Link
              key={cat.slug}
              href={`/explore-campaigns?category=${cat.slug}`}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-xl text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                <Icon />
              </span>
              <div>
                <h3 className="font-semibold text-heading">{cat.name}</h3>
                <p className="mt-0.5 text-xs text-muted">{cat.blurb}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
