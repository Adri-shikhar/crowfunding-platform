"use client";

import Link from "next/link";
import { useState } from "react";
import { FiSlash, FiTrash2, FiFlag } from "react-icons/fi";
import type { Report } from "@/lib/types";
import { apiReq } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import {
  Button,
  EmptyState,
  LoadingScreen,
  PageHeading,
  StatusChip,
  TableCard,
  TD,
  TH,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function Reports() {
  const { data, loading, refetch } = useApi<Report[]>("/reports");
  const [busyId, setBusyId] = useState<string | null>(null);
  const reports = data ?? [];

  async function suspend(id: string) {
    setBusyId(id);
    await apiReq(`/reports/${id}`, { method: "PATCH", body: { action: "suspend" } });
    setBusyId(null);
    await refetch();
  }

  async function dismiss(id: string) {
    setBusyId(id);
    await apiReq(`/reports/${id}`, { method: "DELETE" });
    setBusyId(null);
    await refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Reports"
        subtitle="Community reports on campaigns. Suspend the campaign or dismiss the report."
      />

      {loading ? (
        <LoadingScreen label="Loading reports…" />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<FiFlag />}
          title="No reports"
          message="When users report a campaign, it will show up here for review."
        />
      ) : (
        <TableCard minWidth={780}>
          <thead>
            <tr className="border-b border-border">
              <TH>Reporter</TH>
              <TH>Campaign</TH>
              <TH>Reason</TH>
              <TH>Date</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <TD className="text-muted">{r.reporterName}</TD>
                <TD className="max-w-[14rem] truncate font-medium text-heading">
                  <Link href={`/campaigns/${r.campaignId}`} target="_blank" className="hover:text-accent">
                    {r.campaignTitle}
                  </Link>
                </TD>
                <TD className="max-w-[18rem] text-sm text-body">{r.reason}</TD>
                <TD className="text-muted">{formatDate(r.createdAt)}</TD>
                <TD>
                  <StatusChip status={r.status} />
                </TD>
                <TD>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="danger"
                      loading={busyId === r.id}
                      disabled={r.status === "resolved"}
                      onClick={() => suspend(r.id)}
                    >
                      <FiSlash /> Suspend
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === r.id}
                      onClick={() => dismiss(r.id)}
                    >
                      <FiTrash2 /> Delete
                    </Button>
                  </div>
                </TD>
              </tr>
            ))}
          </tbody>
        </TableCard>
      )}
    </div>
  );
}
