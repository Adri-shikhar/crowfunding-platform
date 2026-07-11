"use client";

import { FormEvent, useState } from "react";
import { FiTrendingUp, FiDownloadCloud, FiAlertTriangle } from "react-icons/fi";
import type { Withdrawal } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { apiReq } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Field,
  LoadingScreen,
  PageHeading,
  Select,
  StatusChip,
  TableCard,
  TextInput,
  TD,
  TH,
} from "@/components/ui";
import { formatCredits, formatDate, formatUsd } from "@/lib/utils";

const MIN_WITHDRAW = 200;
const WITHDRAW_RATE = 20; // credits per USD
const METHODS = ["Stripe", "PayPal", "Bank Transfer", "Payoneer"];

export default function Withdrawals() {
  const { dbUser, refreshUser } = useAuth();
  const email = dbUser?.email ?? "";
  const raised = dbUser?.raisedCredits ?? 0;

  const { data, loading, refetch } = useApi<Withdrawal[]>(
    email ? `/withdrawals?creatorEmail=${encodeURIComponent(email)}` : null,
  );

  const [credits, setCredits] = useState(MIN_WITHDRAW);
  const [method, setMethod] = useState(METHODS[0]);
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canWithdraw = raised >= MIN_WITHDRAW;
  const amountUsd = credits / WITHDRAW_RATE;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (credits <= 0) return setError("Enter how many credits to withdraw.");
    if (credits > raised) return setError("You can't withdraw more than you've raised.");
    if (!account.trim()) return setError("Please enter your account details.");

    setSubmitting(true);
    const { error: err } = await apiReq("/withdrawals", {
      method: "POST",
      body: { creatorEmail: email, credits, method, accountNumber: account.trim() },
    });
    setSubmitting(false);
    if (err) return setError(err);
    setSuccess("Withdrawal requested! An admin will process it shortly.");
    setAccount("");
    await refreshUser();
    await refetch();
  }

  const withdrawals = data ?? [];

  return (
    <div className="space-y-8">
      <PageHeading
        title="Withdrawals"
        subtitle="Cash out the credits you've raised. 20 credits = $1 on withdrawal."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Earnings + form */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <FiTrendingUp />
              </span>
              <div>
                <p className="text-sm text-muted">Available to withdraw</p>
                <p className="text-2xl font-bold text-heading">
                  {formatCredits(raised)} credits
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">
              Worth about{" "}
              <span className="font-semibold text-heading">
                {formatUsd(raised / WITHDRAW_RATE)}
              </span>{" "}
              at the current rate.
            </p>
          </Card>

          {!canWithdraw ? (
            <Card className="p-6">
              <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 p-4 text-amber-600 dark:text-amber-400">
                <FiAlertTriangle className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Insufficient credit</p>
                  <p className="mt-1 text-sm">
                    You need at least {MIN_WITHDRAW} raised credits to request a
                    withdrawal. You currently have {formatCredits(raised)}.
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-heading">Request a withdrawal</h3>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <Field label="Credits to withdraw" htmlFor="credits">
                  <TextInput
                    id="credits"
                    type="number"
                    min={1}
                    max={raised}
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                  />
                </Field>

                <div className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
                  <span className="text-sm text-muted">You&apos;ll receive</span>
                  <span className="text-lg font-bold text-accent">
                    {formatUsd(amountUsd)}
                  </span>
                </div>

                <Field label="Payment system" htmlFor="method">
                  <Select id="method" value={method} onChange={(e) => setMethod(e.target.value)}>
                    {METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Account number / details" htmlFor="account">
                  <TextInput
                    id="account"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="e.g. acct_1234 or you@paypal.me"
                  />
                </Field>

                {error && <Alert tone="error">{error}</Alert>}
                {success && <Alert tone="success">{success}</Alert>}

                <Button type="submit" className="w-full" loading={submitting}>
                  <FiDownloadCloud /> Request withdrawal
                </Button>
              </form>
            </Card>
          )}
        </div>

        {/* History */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-heading">Withdrawal history</h3>
          {loading ? (
            <LoadingScreen label="Loading…" />
          ) : withdrawals.length === 0 ? (
            <EmptyState
              icon={<FiDownloadCloud />}
              title="No withdrawals yet"
              message="Your withdrawal requests and their status will show up here."
            />
          ) : (
            <TableCard minWidth={520}>
              <thead>
                <tr className="border-b border-border">
                  <TH>Date</TH>
                  <TH>Credits</TH>
                  <TH>Amount</TH>
                  <TH>Method</TH>
                  <TH>Status</TH>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b border-border last:border-0">
                    <TD>{formatDate(w.createdAt)}</TD>
                    <TD>{formatCredits(w.credits)}</TD>
                    <TD className="font-medium text-heading">{formatUsd(w.amountUsd)}</TD>
                    <TD>{w.method}</TD>
                    <TD>
                      <StatusChip status={w.status} />
                    </TD>
                  </tr>
                ))}
              </tbody>
            </TableCard>
          )}
        </div>
      </div>
    </div>
  );
}
