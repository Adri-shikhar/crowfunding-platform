"use client";

import { useState } from "react";
import { FiEye, FiCheck, FiX, FiInbox } from "react-icons/fi";
import type { Contribution } from "@/lib/types";
import { apiReq } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/lib/useApi";
import { Avatar } from "@/components/Image";
import {
  Button,
  EmptyState,
  LoadingScreen,
  Modal,
  StatusChip,
  TableCard,
  TD,
  TH,
} from "@/components/ui";
import { formatCredits, formatDate, timeAgo } from "@/lib/utils";

export function ReviewContributions({
  creatorEmail,
  onReviewed,
}: {
  creatorEmail: string;
  onReviewed?: () => void;
}) {
  const { refreshUser } = useAuth();
  const { data, loading, refetch } = useApi<Contribution[]>(
    creatorEmail
      ? `/contributions/review?creatorEmail=${encodeURIComponent(creatorEmail)}`
      : null,
  );
  const [viewing, setViewing] = useState<Contribution | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const pending = (data ?? []).filter((c) => c.status === "pending");

  async function review(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    await apiReq(`/contributions/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
    setBusyId(null);
    setViewing(null);
    await refetch();
    await refreshUser();
    onReviewed?.();
  }

  if (loading) return <LoadingScreen label="Loading contributions…" />;

  if (pending.length === 0) {
    return (
      <EmptyState
        icon={<FiInbox />}
        title="No contributions to review"
        message="When supporters pledge to your campaigns, they'll appear here for approval."
      />
    );
  }

  return (
    <>
      <TableCard minWidth={640}>
        <thead>
          <tr className="border-b border-border">
            <TH>Supporter</TH>
            <TH>Campaign</TH>
            <TH>Amount</TH>
            <TH>When</TH>
            <TH className="text-right">Actions</TH>
          </tr>
        </thead>
        <tbody>
          {pending.map((c) => (
            <tr key={c.id} className="border-b border-border last:border-0">
              <TD>
                <div className="flex items-center gap-2.5">
                  <Avatar name={c.supporterName} email={c.supporterEmail} size={32} />
                  <span className="font-medium text-heading">{c.supporterName}</span>
                </div>
              </TD>
              <TD className="max-w-[16rem] truncate">{c.campaignTitle}</TD>
              <TD className="font-semibold text-heading">{formatCredits(c.amount)} cr</TD>
              <TD className="text-muted">{timeAgo(c.createdAt)}</TD>
              <TD>
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setViewing(c)}>
                    <FiEye /> View
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    loading={busyId === c.id}
                    onClick={() => review(c.id, "approved")}
                  >
                    <FiCheck /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busyId === c.id}
                    onClick={() => review(c.id, "rejected")}
                  >
                    <FiX /> Reject
                  </Button>
                </div>
              </TD>
            </tr>
          ))}
        </tbody>
      </TableCard>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title="Contribution details"
        footer={
          viewing && (
            <>
              <Button
                variant="danger"
                onClick={() => review(viewing.id, "rejected")}
                loading={busyId === viewing.id}
              >
                <FiX /> Reject & refund
              </Button>
              <Button
                variant="success"
                onClick={() => review(viewing.id, "approved")}
                loading={busyId === viewing.id}
              >
                <FiCheck /> Approve
              </Button>
            </>
          )
        }
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={viewing.supporterName} email={viewing.supporterEmail} size={44} />
              <div>
                <p className="font-semibold text-heading">{viewing.supporterName}</p>
                <p className="text-sm text-muted">{viewing.supporterEmail}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-muted">Campaign</dt>
                <dd className="mt-0.5 font-medium text-heading">{viewing.campaignTitle}</dd>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-muted">Amount</dt>
                <dd className="mt-0.5 font-medium text-heading">
                  {formatCredits(viewing.amount)} credits
                </dd>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-muted">Date</dt>
                <dd className="mt-0.5 font-medium text-heading">{formatDate(viewing.createdAt)}</dd>
              </div>
              <div className="rounded-xl bg-surface-2 p-3">
                <dt className="text-muted">Status</dt>
                <dd className="mt-0.5"><StatusChip status={viewing.status} /></dd>
              </div>
            </dl>
            <p className="text-xs text-muted">
              Approving adds these credits to your campaign&apos;s raised total.
              Rejecting refunds the supporter in full.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
