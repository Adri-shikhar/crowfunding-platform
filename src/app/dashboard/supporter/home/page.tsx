"use client";

import Link from "next/link";
import { FiHeart, FiClock, FiTrendingUp, FiCompass } from "react-icons/fi";
import type { Contribution } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/lib/useApi";
import {
  Button,
  EmptyState,
  LoadingScreen,
  PageHeading,
  StatCard,
  StatusChip,
  TableCard,
  TD,
  TH,
} from "@/components/ui";
import { formatCredits, formatDate } from "@/lib/utils";

interface SupporterStats {
  totalContributions: number;
  pendingContributions: number;
  approvedContributions: number;
  totalContributed: number;
}

export default function SupporterHome() {
  const { dbUser } = useAuth();
  const email = dbUser?.email ?? "";

  const { data: stats } = useApi<SupporterStats>(
    email ? `/stats/supporter?email=${encodeURIComponent(email)}` : null,
  );
  const { data: approved, loading } = useApi<Contribution[]>(
    email
      ? `/contributions?supporterEmail=${encodeURIComponent(email)}&status=approved`
      : null,
  );

  return (
    <div className="space-y-8">
      <PageHeading
        title={`Welcome back, ${dbUser?.name?.split(" ")[0] ?? "Supporter"}`}
        subtitle="Here's a snapshot of your giving on FundSpring."
        action={
          <Link href="/dashboard/supporter/explore">
            <Button>
              <FiCompass /> Explore campaigns
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total contributions"
          value={stats?.totalContributions ?? 0}
          icon={<FiHeart />}
        />
        <StatCard
          label="Pending review"
          value={stats?.pendingContributions ?? 0}
          icon={<FiClock />}
        />
        <StatCard
          label="Total contributed"
          value={`${formatCredits(stats?.totalContributed ?? 0)} cr`}
          icon={<FiTrendingUp />}
          hint="Approved pledges only"
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-heading">
          Approved contributions
        </h2>
        {loading ? (
          <LoadingScreen label="Loading contributions…" />
        ) : (approved ?? []).length === 0 ? (
          <EmptyState
            icon={<FiHeart />}
            title="No approved contributions yet"
            message="When a creator approves one of your pledges, it will show up here."
            action={
              <Link href="/dashboard/supporter/explore" className="mt-2">
                <Button variant="soft">Find a campaign</Button>
              </Link>
            }
          />
        ) : (
          <TableCard>
            <thead>
              <tr className="border-b border-border">
                <TH>Campaign</TH>
                <TH>Amount</TH>
                <TH>Date</TH>
                <TH>Status</TH>
              </tr>
            </thead>
            <tbody>
              {(approved ?? []).map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <TD className="font-medium text-heading">
                    <Link href={`/campaigns/${c.campaignId}`} className="hover:text-accent">
                      {c.campaignTitle}
                    </Link>
                  </TD>
                  <TD>{formatCredits(c.amount)} cr</TD>
                  <TD>{formatDate(c.createdAt)}</TD>
                  <TD>
                    <StatusChip status={c.status} />
                  </TD>
                </tr>
              ))}
            </tbody>
          </TableCard>
        )}
      </div>
    </div>
  );
}
