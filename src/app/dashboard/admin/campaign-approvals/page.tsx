"use client";

import Link from "next/link";
import { useState } from "react";
import { FiCheck, FiX, FiCheckSquare, FiExternalLink } from "react-icons/fi";
import type { Campaign } from "@/lib/types";
import { apiReq } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { CATEGORIES } from "@/data/seed";
import { CoverImage, Avatar } from "@/components/Image";
import {
  Button,
  Card,
  EmptyState,
  LoadingScreen,
  PageHeading,
} from "@/components/ui";
import { formatCredits, formatDate } from "@/lib/utils";

export default function CampaignApprovals() {
  const { data, loading, refetch } = useApi<Campaign[]>("/campaigns/pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const campaigns = data ?? [];

  async function decide(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    await apiReq(`/campaigns/${id}/status`, { method: "PATCH", body: { status } });
    setBusyId(null);
    await refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Campaign approvals"
        subtitle="Review new campaigns before they go live on the platform."
      />

      {loading ? (
        <LoadingScreen label="Loading pending campaigns…" />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<FiCheckSquare />}
          title="Nothing to review"
          message="All caught up — there are no campaigns waiting for approval."
        />
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const categoryName =
              CATEGORIES.find((x) => x.slug === c.category)?.name ?? c.category;
            return (
              <Card key={c.id} className="overflow-hidden">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <CoverImage
                    src={c.image}
                    alt={c.title}
                    className="h-40 w-full shrink-0 sm:h-auto sm:w-56"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                          {categoryName}
                        </span>
                        <h3 className="mt-2 text-lg font-semibold text-heading">
                          {c.title}
                        </h3>
                      </div>
                      <Link
                        href={`/campaigns/${c.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-muted hover:text-accent"
                      >
                        Preview <FiExternalLink />
                      </Link>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm text-muted">{c.story}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted">
                      <span className="inline-flex items-center gap-2">
                        <Avatar name={c.creatorName} email={c.creatorEmail} size={24} />
                        {c.creatorName}
                      </span>
                      <span>Goal: {formatCredits(c.fundingGoal)} cr</span>
                      <span>Ends {formatDate(c.deadline)}</span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="success"
                        loading={busyId === c.id}
                        onClick={() => decide(c.id, "approved")}
                      >
                        <FiCheck /> Approve
                      </Button>
                      <Button
                        variant="danger"
                        disabled={busyId === c.id}
                        onClick={() => decide(c.id, "rejected")}
                      >
                        <FiX /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
