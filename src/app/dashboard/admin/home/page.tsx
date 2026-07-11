"use client";

import Link from "next/link";
import {
  FiUsers,
  FiEdit3,
  FiDollarSign,
  FiCreditCard,
  FiCheckSquare,
  FiFlag,
  FiArrowRight,
} from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/lib/useApi";
import { Card, PageHeading, StatCard } from "@/components/ui";
import { formatCredits, formatUsd } from "@/lib/utils";

interface AdminStats {
  supporters: number;
  creators: number;
  totalCredits: number;
  totalPayments: number;
  totalCampaigns: number;
  pendingCampaigns: number;
  pendingWithdrawals: number;
  openReports: number;
}

export default function AdminHome() {
  const { dbUser } = useAuth();
  const { data: stats } = useApi<AdminStats>("/stats/admin");

  const queue = [
    {
      label: "Campaigns awaiting approval",
      count: stats?.pendingCampaigns ?? 0,
      href: "/dashboard/admin/campaign-approvals",
      icon: FiCheckSquare,
    },
    {
      label: "Withdrawal requests",
      count: stats?.pendingWithdrawals ?? 0,
      href: "/dashboard/admin/withdrawal-requests",
      icon: FiDollarSign,
    },
    {
      label: "Open reports",
      count: stats?.openReports ?? 0,
      href: "/dashboard/admin/reports",
      icon: FiFlag,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeading
        title={`Admin overview`}
        subtitle={`Signed in as ${dbUser?.name ?? "admin"}. Here's the health of the platform.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Supporters" value={stats?.supporters ?? 0} icon={<FiUsers />} />
        <StatCard label="Creators" value={stats?.creators ?? 0} icon={<FiEdit3 />} />
        <StatCard
          label="Total credits"
          value={formatCredits(stats?.totalCredits ?? 0)}
          icon={<FiCreditCard />}
          hint="Held across all users"
        />
        <StatCard
          label="Payments processed"
          value={formatUsd(stats?.totalPayments ?? 0)}
          icon={<FiDollarSign />}
          hint="Credit purchases"
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-heading">Needs your attention</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {queue.map((q) => (
            <Link key={q.label} href={q.href}>
              <Card className="flex items-center justify-between p-5 transition-colors hover:border-accent">
                <div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <q.icon />
                  </span>
                  <p className="mt-3 text-2xl font-bold text-heading">{q.count}</p>
                  <p className="text-sm text-muted">{q.label}</p>
                </div>
                <FiArrowRight className="text-muted" />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
