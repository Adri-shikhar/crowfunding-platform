"use client";

import Link from "next/link";
import { FiTrendingUp, FiFolder, FiClock, FiUsers, FiPlusCircle } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/lib/useApi";
import { ReviewContributions } from "@/components/creator/ReviewContributions";
import { Button, PageHeading, StatCard } from "@/components/ui";
import { formatCredits } from "@/lib/utils";

interface CreatorStats {
  totalCampaigns: number;
  approvedCampaigns: number;
  pendingReview: number;
  raisedCredits: number;
  totalBackers: number;
}

export default function CreatorHome() {
  const { dbUser } = useAuth();
  const email = dbUser?.email ?? "";
  const { data: stats, refetch } = useApi<CreatorStats>(
    email ? `/stats/creator?email=${encodeURIComponent(email)}` : null,
  );

  return (
    <div className="space-y-8">
      <PageHeading
        title={`Hello, ${dbUser?.name?.split(" ")[0] ?? "Creator"}`}
        subtitle="Track your campaigns and review incoming contributions."
        action={
          <Link href="/dashboard/creator/add-campaign">
            <Button>
              <FiPlusCircle /> New campaign
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Raised credits"
          value={`${formatCredits(stats?.raisedCredits ?? 0)}`}
          icon={<FiTrendingUp />}
          hint="Available to withdraw"
        />
        <StatCard
          label="Active campaigns"
          value={stats?.approvedCampaigns ?? 0}
          icon={<FiFolder />}
        />
        <StatCard
          label="Pending review"
          value={stats?.pendingReview ?? 0}
          icon={<FiClock />}
        />
        <StatCard
          label="Total backers"
          value={stats?.totalBackers ?? 0}
          icon={<FiUsers />}
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-heading">
          Contributions to review
        </h2>
        <ReviewContributions creatorEmail={email} onReviewed={refetch} />
      </div>
    </div>
  );
}
