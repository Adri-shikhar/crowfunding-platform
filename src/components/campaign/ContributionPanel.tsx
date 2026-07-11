"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import type { Campaign } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { apiReq } from "@/lib/api";
import { Alert, Button, Card, Field, TextInput } from "@/components/ui";
import { formatCredits, isExpired } from "@/lib/utils";

export function ContributionPanel({
  campaign,
  onContributed,
}: {
  campaign: Campaign;
  onContributed: () => void;
}) {
  const { firebaseUser, dbUser, role, credits, refreshUser } = useAuth();
  const [amount, setAmount] = useState<number>(campaign.minContribution);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const ended = isExpired(campaign.deadline);

  // Not signed in
  if (!firebaseUser) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-heading">Back this campaign</h3>
        <p className="mt-2 text-sm text-muted">
          Sign in as a supporter to pledge your credits to this project.
        </p>
        <Link href="/login" className="mt-4 block">
          <Button className="w-full">
            Sign in to contribute <FiArrowRight />
          </Button>
        </Link>
        <p className="mt-3 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    );
  }

  // Signed in, but not a supporter
  if (role && role !== "supporter") {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-heading">Back this campaign</h3>
        <Alert tone="info">
          Only supporter accounts can contribute credits. You&apos;re signed in as
          a {role}.
        </Alert>
      </Card>
    );
  }

  const insufficient = amount > credits;

  async function handleSubmit() {
    setError("");
    setSuccess("");
    if (amount < campaign.minContribution) {
      setError(`Minimum contribution is ${campaign.minContribution} credits.`);
      return;
    }
    if (insufficient) {
      setError("You don't have enough credits for this pledge.");
      return;
    }
    setLoading(true);
    const { data, error: err } = await apiReq("/contributions", {
      method: "POST",
      body: {
        campaignId: campaign.id,
        supporterEmail: dbUser?.email,
        amount,
      },
    });
    setLoading(false);
    if (err || !data) {
      setError(err || "Could not submit your contribution.");
      return;
    }
    setSuccess(
      `Pledged ${formatCredits(amount)} credits! It's now pending the creator's review.`,
    );
    await refreshUser();
    onContributed();
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-heading">Back this campaign</h3>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3">
        <span className="text-sm text-muted">Your balance</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent">
          <HiOutlineSparkles /> {formatCredits(credits)} credits
        </span>
      </div>

      {ended ? (
        <Alert tone="info">This campaign has ended and is no longer accepting pledges.</Alert>
      ) : (
        <>
          <div className="mt-4">
            <Field
              label="Contribution amount (credits)"
              htmlFor="amount"
              hint={`Minimum ${campaign.minContribution} credits`}
            >
              <TextInput
                id="amount"
                type="number"
                min={campaign.minContribution}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </Field>

            <div className="mt-3 flex flex-wrap gap-2">
              {[campaign.minContribution, 50, 100, 250].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-body transition-colors hover:border-accent hover:text-accent"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
          {success && <div className="mt-4"><Alert tone="success">{success}</Alert></div>}

          {insufficient && !error && (
            <div className="mt-4">
              <Alert tone="info">
                Not enough credits?{" "}
                <Link
                  href="/dashboard/supporter/purchase-credit"
                  className="font-semibold underline"
                >
                  Purchase more
                </Link>
                .
              </Alert>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            loading={loading}
            className="mt-5 w-full"
            disabled={insufficient}
          >
            Pledge {formatCredits(amount)} credits
          </Button>
          <p className="mt-3 text-center text-xs text-muted">
            Your credits are held until the creator approves. Declined pledges are
            refunded in full.
          </p>
        </>
      )}
    </Card>
  );
}
