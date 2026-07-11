"use client";

import { FiClock } from "react-icons/fi";
import type { Payment } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import {
  EmptyState,
  LoadingScreen,
  TableCard,
  TD,
  TH,
} from "@/components/ui";
import { cx, formatCredits, formatDate, formatUsd } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  "credit-purchase": "Credit purchase",
  withdrawal: "Withdrawal payout",
};

export function PaymentHistory({ email }: { email: string }) {
  const { data, loading } = useApi<Payment[]>(
    email ? `/payments?email=${encodeURIComponent(email)}` : null,
  );
  const payments = data ?? [];

  if (loading) return <LoadingScreen label="Loading payment history…" />;
  if (payments.length === 0) {
    return (
      <EmptyState
        icon={<FiClock />}
        title="No payments yet"
        message="Your credit purchases and payouts will appear here once you make one."
      />
    );
  }

  return (
    <TableCard minWidth={680}>
      <thead>
        <tr className="border-b border-border">
          <TH>Date</TH>
          <TH>Type</TH>
          <TH>Credits</TH>
          <TH>Amount</TH>
          <TH>Method</TH>
          <TH>Reference</TH>
        </tr>
      </thead>
      <tbody>
        {payments.map((p) => {
          const isPayout = p.type === "withdrawal";
          return (
            <tr key={p.id} className="border-b border-border last:border-0">
              <TD>{formatDate(p.createdAt)}</TD>
              <TD>
                <span
                  className={cx(
                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    isPayout
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-300"
                      : "bg-accent/15 text-accent",
                  )}
                >
                  {TYPE_LABEL[p.type] ?? p.type}
                </span>
              </TD>
              <TD className={cx("font-medium", isPayout ? "text-rose-500" : "text-emerald-500")}>
                {isPayout ? "-" : "+"}
                {formatCredits(p.credits)}
              </TD>
              <TD className="font-medium text-heading">{formatUsd(p.amountUsd)}</TD>
              <TD>{p.method}</TD>
              <TD className="font-mono text-xs text-muted">{p.reference}</TD>
            </tr>
          );
        })}
      </tbody>
    </TableCard>
  );
}
