"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiHeart } from "react-icons/fi";
import type { Contribution } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/lib/useApi";
import {
  Button,
  EmptyState,
  LoadingScreen,
  Pagination,
  PageHeading,
  StatusChip,
  TableCard,
  TD,
  TH,
} from "@/components/ui";
import { formatCredits, formatDate } from "@/lib/utils";

const PER_PAGE = 6;

export default function MyContributions() {
  const { dbUser } = useAuth();
  const email = dbUser?.email ?? "";
  const { data, loading } = useApi<Contribution[]>(
    email ? `/contributions?supporterEmail=${encodeURIComponent(email)}` : null,
  );
  const [page, setPage] = useState(1);

  const all = useMemo(() => data ?? [], [data]);
  const totalPages = Math.ceil(all.length / PER_PAGE);
  const pageItems = all.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      <PageHeading
        title="My contributions"
        subtitle="Every pledge you've made, with its current review status."
      />

      {loading ? (
        <LoadingScreen label="Loading your contributions…" />
      ) : all.length === 0 ? (
        <EmptyState
          icon={<FiHeart />}
          title="You haven't contributed yet"
          message="Back a campaign to start making an impact — your pledges will appear here."
          action={
            <Link href="/dashboard/supporter/explore" className="mt-2">
              <Button variant="soft">Explore campaigns</Button>
            </Link>
          }
        />
      ) : (
        <>
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
              {pageItems.map((c) => (
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

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Showing {(page - 1) * PER_PAGE + 1}–
              {Math.min(page * PER_PAGE, all.length)} of {all.length}
            </p>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
