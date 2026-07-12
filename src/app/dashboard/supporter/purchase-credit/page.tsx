"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiZap } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useAuth } from "@/contexts/AuthContext";
import { apiReq } from "@/lib/api";
import { Alert, Button, Modal, PageHeading, Spinner } from "@/components/ui";
import type { PaymentProvider } from "@/lib/payment";
import { cx, formatCredits, formatUsd } from "@/lib/utils";

interface Package {
  credits: number;
  price: number;
  label: string;
  best?: boolean;
}

// 10 credits = $1 base; larger packs include bonus value.
const PACKAGES: Package[] = [
  { credits: 100, price: 10, label: "Starter" },
  { credits: 300, price: 25, label: "Popular" },
  { credits: 800, price: 60, label: "Value", best: true },
  { credits: 1500, price: 110, label: "Patron" },
];

const BDT_PER_USD = Number(process.env.NEXT_PUBLIC_BKASH_BDT_PER_USD || 110);

function toBdt(usd: number): number {
  const rate =
    Number.isFinite(BDT_PER_USD) && BDT_PER_USD > 0 ? BDT_PER_USD : 110;
  return Math.round(usd * rate);
}

export default function PurchaseCredit() {
  const { dbUser, refreshUser } = useAuth();
  const email = dbUser?.email ?? "";
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    type: "success" | "cancel";
    credits?: number;
  } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selected, setSelected] = useState<Package | null>(null);

  // Handle redirect back from Stripe / bKash (or mock checkout).
  useEffect(() => {
    if (!email) return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success") {
      const credits = Number(params.get("credits") || 0);
      const amount = Number(params.get("amount") || 0);
      const ref = params.get("ref") || "";
      const method = params.get("method") || "Stripe";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProcessing(true);
      (async () => {
        await apiReq("/payments", {
          method: "POST",
          body: {
            userEmail: email,
            type: "credit-purchase",
            credits,
            amountUsd: amount,
            method,
            reference: ref,
          },
        });
        await refreshUser();
        setResult({ type: "success", credits });
        setProcessing(false);
        router.replace("/dashboard/supporter/purchase-credit");
      })();
    } else if (status === "cancel") {
      setResult({ type: "cancel" });
      router.replace("/dashboard/supporter/purchase-credit");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function payWith(provider: PaymentProvider) {
    if (!selected) return;
    setError("");
    setPending(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        credits: selected.credits,
        amountUsd: selected.price,
        email,
        provider,
        successPath: "/dashboard/supporter/purchase-credit",
      }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.url) {
      setError(json?.error || "Could not start checkout. Please try again.");
      setPending(false);
      return;
    }
    window.location.assign(json.url);
  }

  return (
    <div className="space-y-8">
      <PageHeading
        title="Purchase credits"
        subtitle="Top up your balance to back more campaigns. Pay with Stripe or bKash."
      />

      {processing && (
        <Alert tone="info">
          <span className="inline-flex items-center gap-2">
            <Spinner size={16} /> Confirming your payment…
          </span>
        </Alert>
      )}
      {result?.type === "success" && (
        <Alert tone="success">
          Payment successful — {formatCredits(result.credits ?? 0)} credits added
          to your balance. Current balance:{" "}
          {formatCredits(dbUser?.credits ?? 0)} credits.
        </Alert>
      )}
      {result?.type === "cancel" && (
        <Alert tone="info">
          Checkout was cancelled. No credits were purchased.
        </Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4">
        <span className="text-sm text-muted">Your current balance</span>
        <span className="inline-flex items-center gap-1.5 text-lg font-bold text-accent">
          <HiOutlineSparkles /> {formatCredits(dbUser?.credits ?? 0)} credits
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PACKAGES.map((pkg) => {
          const bonus = pkg.credits - pkg.price * 10;
          return (
            <div
              key={pkg.credits}
              className={cx(
                "relative flex flex-col rounded-2xl border-2 bg-surface p-6 transition-colors",
                pkg.best ? "border-accent" : "border-border",
              )}
            >
              {pkg.best && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-fg">
                  Best value
                </span>
              )}
              <p className="text-sm font-semibold text-muted">{pkg.label}</p>
              <p className="mt-2 flex items-baseline gap-1 text-3xl font-extrabold text-heading">
                {formatCredits(pkg.credits)}
                <span className="text-sm font-medium text-muted">credits</span>
              </p>
              {bonus > 0 && (
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-500">
                  <FiZap /> +{bonus} bonus credits
                </p>
              )}
              <p className="mt-4 text-2xl font-bold text-heading">
                {formatUsd(pkg.price)}
              </p>
              <p className="mt-1 text-xs text-muted">
                or ৳{toBdt(pkg.price).toLocaleString()} via bKash
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-muted">
                <li className="flex items-center gap-2">
                  <FiCheck className="text-accent" /> Instant top-up
                </li>
                <li className="flex items-center gap-2">
                  <FiCheck className="text-accent" /> Back any campaign
                </li>
              </ul>
              <Button
                className="mt-5 w-full"
                onClick={() => {
                  setError("");
                  setSelected(pkg);
                }}
              >
                Pay
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted">
        Choose Stripe (card / test mode) or bKash (sandbox) at checkout. No real
        charge in demo mode when keys are missing.
      </p>

      <Modal
        open={!!selected}
        onClose={() => {
          if (!pending) setSelected(null);
        }}
        title="Choose payment method"
        size="sm"
      >
        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm">
              <p className="font-semibold text-heading">{selected.label} pack</p>
              <p className="mt-1 text-muted">
                {formatCredits(selected.credits)} credits ·{" "}
                {formatUsd(selected.price)} / ৳
                {toBdt(selected.price).toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              disabled={pending}
              onClick={() => payWith("stripe")}
              className="flex w-full items-center justify-between rounded-xl border-2 border-border bg-surface px-4 py-3 text-left transition-colors hover:border-accent disabled:opacity-60"
            >
              <span>
                <span className="block font-semibold text-heading">
                  Pay with Stripe
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  Card · {formatUsd(selected.price)}
                </span>
              </span>
              {pending ? <Spinner size={16} /> : null}
            </button>

            <button
              type="button"
              disabled={pending}
              onClick={() => payWith("bkash")}
              className="flex w-full items-center justify-between rounded-xl border-2 border-border bg-surface px-4 py-3 text-left transition-colors hover:border-accent disabled:opacity-60"
            >
              <span>
                <span className="block font-semibold text-heading">
                  Pay with bKash
                </span>
                <span className="mt-0.5 block text-xs text-muted">
                  Mobile wallet · ৳{toBdt(selected.price).toLocaleString()}
                </span>
              </span>
              {pending ? <Spinner size={16} /> : null}
            </button>

            <Button
              variant="ghost"
              className="w-full"
              disabled={pending}
              onClick={() => setSelected(null)}
            >
              Cancel
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
