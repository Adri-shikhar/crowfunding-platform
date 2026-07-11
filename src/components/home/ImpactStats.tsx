"use client";

import { useEffect, useRef, useState } from "react";
import { FiTrendingUp, FiUsers, FiAward, FiGlobe } from "react-icons/fi";

interface Stat {
  icon: typeof FiTrendingUp;
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { icon: FiTrendingUp, value: 1200000, suffix: "+", label: "Credits pledged" },
  { icon: FiUsers, value: 8400, suffix: "+", label: "Active backers" },
  { icon: FiAward, value: 640, suffix: "", label: "Campaigns funded" },
  { icon: FiGlobe, value: 37, suffix: "", label: "Countries reached" },
];

function formatCompact(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
  if (n >= 1000) return Math.round(n / 1000) + "K";
  return String(n);
}

function useCountUp(target: number, run: boolean, duration = 1400): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return value;
}

function StatItem({ stat, run }: { stat: Stat; run: boolean }) {
  const value = useCountUp(stat.value, run);
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl text-white backdrop-blur-sm">
        <stat.icon />
      </span>
      <span className="mt-2 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
        {formatCompact(value)}
        {stat.suffix}
      </span>
      <span className="text-sm font-medium text-white/80">{stat.label}</span>
    </div>
  );
}

export function ImpactStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-gradient-to-br from-accent to-accent-strong">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Platform impact, in numbers
          </h2>
          <p className="mt-3 text-white/85">
            A snapshot of what the FundSpring community has built together — one
            credit at a time.
          </p>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <StatItem key={s.label} stat={s} run={run} />
          ))}
        </div>
      </div>
    </section>
  );
}
