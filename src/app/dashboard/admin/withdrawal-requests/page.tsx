"use client";

import { useState } from "react";
import { FiCheck, FiDollarSign } from "react-icons/fi";
import type { Withdrawal } from "@/lib/types";
import { apiReq } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { Avatar } from "@/components/Image";
import {
  Button,
  EmptyState,
  LoadingScreen,
  PageHeading,
  TableCard,
  TD,
  TH,
} from "@/components/ui";
import { formatCredits, formatDate, formatUsd } from "@/lib/utils";

export default function WithdrawalRequests() {
  const { data, loading, refetch } = useApi<Withdrawal[]>("/withdrawals?status=pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const requests = data ?? [];

  async function pay(id: string) {
    setBusyId(id);
    await apiReq(`/withdrawals/${id}/status`, {
      method: "PATCH",
      body: { status: "approved" },
    });
    setBusyId(null);
    await refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Withdrawal requests"
        subtitle="Approve creator payouts. Marking one paid decreases their raised credits."
      />

      {loading ? (
        <LoadingScreen label="Loading requests…" />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<FiDollarSign />}
          title="No pending withdrawals"
          message="Creator payout requests will appear here for you to process."
        />
      ) : (
        <TableCard minWidth={760}>
          <thead>
            <tr className="border-b border-border">
              <TH>Creator</TH>
              <TH>Credits</TH>
              <TH>Payout</TH>
              <TH>Method</TH>
              <TH>Account</TH>
              <TH>Requested</TH>
              <TH className="text-right">Action</TH>
            </tr>
          </thead>
          <tbody>
            {requests.map((w) => (
              <tr key={w.id} className="border-b border-border last:border-0">
                <TD>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={w.creatorName} email={w.creatorEmail} size={32} />
                    <span className="font-medium text-heading">{w.creatorName}</span>
                  </div>
                </TD>
                <TD>{formatCredits(w.credits)}</TD>
                <TD className="font-semibold text-heading">{formatUsd(w.amountUsd)}</TD>
                <TD>{w.method}</TD>
                <TD className="font-mono text-xs text-muted">{w.accountNumber}</TD>
                <TD className="text-muted">{formatDate(w.createdAt)}</TD>
                <TD>
                  <div className="flex justify-end">
                    <Button size="sm" variant="success" loading={busyId === w.id} onClick={() => pay(w.id)}>
                      <FiCheck /> Payment Success
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
