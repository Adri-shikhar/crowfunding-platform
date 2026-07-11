"use client";

import Link from "next/link";
import { use } from "react";
import { FiArrowLeft, FiCalendar, FiGift, FiTarget, FiUsers } from "react-icons/fi";
import type { Campaign } from "@/lib/types";
import { CATEGORIES } from "@/data/seed";
import { useApi } from "@/lib/useApi";
import { CoverImage, Avatar } from "@/components/Image";
import { ProgressBar, LoadingScreen, EmptyState, Button } from "@/components/ui";
import { ContributionPanel } from "@/components/campaign/ContributionPanel";
import { ReportDialog } from "@/components/campaign/ReportDialog";
import { daysLeft, formatCredits, formatDate, isExpired, percent } from "@/lib/utils";

export default function CampaignDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: campaign, loading, refetch } = useApi<Campaign>(`/campaigns/${id}`);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
        <LoadingScreen label="Loading campaign…" />
      </div>
    );
  }

  if (!campaign || !campaign.id) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
        <EmptyState
          icon={<FiTarget />}
          title="Campaign not found"
          message="This campaign may have been removed or isn't available yet."
          action={
            <Link href="/explore-campaigns" className="mt-2">
              <Button variant="soft">Back to Explore</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const categoryName =
    CATEGORIES.find((c) => c.slug === campaign.category)?.name ?? campaign.category;
  const pct = percent(campaign.raised, campaign.fundingGoal);
  const ended = isExpired(campaign.deadline);

  const stats = [
    { icon: FiUsers, label: "Backers", value: formatCredits(campaign.backers) },
    { icon: FiTarget, label: "Goal", value: `${formatCredits(campaign.fundingGoal)} cr` },
    { icon: FiCalendar, label: ended ? "Status" : "Days left", value: ended ? "Ended" : `${daysLeft(campaign.deadline)}` },
    { icon: FiGift, label: "Min pledge", value: `${formatCredits(campaign.minContribution)} cr` },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/explore-campaigns"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-accent"
      >
        <FiArrowLeft /> Back to Explore
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        {/* Main */}
        <div>
          <div className="overflow-hidden rounded-3xl border border-border">
            <CoverImage
              src={campaign.image}
              alt={campaign.title}
              className="aspect-[16/9] w-full"
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              {categoryName}
            </span>
            {ended && (
              <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-500">
                Ended
              </span>
            )}
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-4xl">
            {campaign.title}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <Avatar name={campaign.creatorName} email={campaign.creatorEmail} size={40} />
            <div>
              <p className="text-sm font-semibold text-heading">
                {campaign.creatorName}
              </p>
              <p className="text-xs text-muted">Campaign creator</p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
                <s.icon className="text-accent" />
                <p className="mt-2 text-lg font-bold text-heading">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-heading">About this campaign</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-body">
              {campaign.story}
            </p>
          </div>

          {/* Rewards */}
          <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-heading">
              <FiGift className="text-accent" /> Rewards for backers
            </h2>
            <p className="mt-3 leading-relaxed text-body">{campaign.rewardInfo}</p>
          </div>

          <div className="mt-6">
            <ReportDialog campaign={campaign} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-heading">
                {formatCredits(campaign.raised)}
                <span className="text-base font-normal text-muted"> credits raised</span>
              </span>
              <span className="text-sm font-semibold text-accent">{pct}%</span>
            </div>
            <div className="mt-3">
              <ProgressBar value={pct} />
            </div>
            <p className="mt-2 text-sm text-muted">
              of {formatCredits(campaign.fundingGoal)} credit goal ·{" "}
              {ended ? "Campaign ended" : `Ends ${formatDate(campaign.deadline)}`}
            </p>
          </div>

          <div className="mt-5">
            <ContributionPanel campaign={campaign} onContributed={refetch} />
          </div>
        </div>
      </div>
    </div>
  );
}
