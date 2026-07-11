"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import type { Campaign } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { CampaignCard } from "@/components/CampaignCard";
import { LoadingScreen, buttonClasses } from "@/components/ui";

export function TopCampaigns() {
  const { data, loading } = useApi<Campaign[]>("/campaigns/top?limit=6");

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Momentum
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            Top funded campaigns
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            The projects the community is rallying behind right now, ranked by
            credits raised.
          </p>
        </div>
        <Link
          href="/explore-campaigns"
          className={`${buttonClasses("soft", "md")} self-start`}
        >
          View all <FiArrowRight />
        </Link>
      </div>

      {loading ? (
        <LoadingScreen label="Loading campaigns…" />
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </section>
  );
}
