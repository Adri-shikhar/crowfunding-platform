"use client";

import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import type { Campaign } from "@/lib/types";
import { CATEGORIES } from "@/data/seed";
import { useApi } from "@/lib/useApi";
import { CampaignCard } from "@/components/CampaignCard";
import { EmptyState, LoadingScreen, Select } from "@/components/ui";
import { cx } from "@/lib/utils";

/**
 * Filterable campaign grid used by the public Explore page and the supporter
 * dashboard. `notExpiredOnly` hides ended campaigns (supporters can only fund
 * live ones). `linkBase` lets the dashboard point cards at its own detail route.
 */
export function CampaignBrowser({
  initialCategory = "",
  notExpiredOnly = false,
  linkBase = "/campaigns",
}: {
  initialCategory?: string;
  notExpiredOnly?: boolean;
  linkBase?: string;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const path = useMemo(() => {
    const params = new URLSearchParams({ status: "approved", sort });
    if (notExpiredOnly) params.set("notExpired", "true");
    if (category) params.set("category", category);
    if (query.trim()) params.set("q", query.trim());
    return `/campaigns?${params.toString()}`;
  }, [category, query, sort, notExpiredOnly]);

  const { data, loading } = useApi<Campaign[]>(path);
  const campaigns = data ?? [];

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns…"
            className="w-full rounded-xl border border-border-strong bg-surface py-2.5 pl-10 pr-3.5 text-sm text-heading placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>
        <div className="w-full sm:w-48 lg:w-52">
          <Select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="raised">Most funded</option>
            <option value="deadline">Ending soon</option>
          </Select>
        </div>
      </div>

      {/* Category pills */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        <CategoryPill label="All" active={!category} onClick={() => setCategory("")} />
        {CATEGORIES.map((c) => (
          <CategoryPill
            key={c.slug}
            label={c.name}
            active={category === c.slug}
            onClick={() => setCategory(c.slug)}
          />
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <LoadingScreen label="Loading campaigns…" />
      ) : campaigns.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No campaigns found"
            message="Try a different category or clear your search to see everything."
          />
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {campaigns.length} campaign{campaigns.length === 1 ? "" : "s"}
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <CampaignCard key={c.id} campaign={c} href={`${linkBase}/${c.id}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-fg"
          : "border border-border bg-surface text-body hover:bg-surface-2",
      )}
    >
      {label}
    </button>
  );
}
