/**
 * Payment provider switch. Set PAYMENT_PROVIDER (and optionally
 * NEXT_PUBLIC_PAYMENT_PROVIDER for UI labels) to "stripe" or "bkash".
 */

export type PaymentProvider = "stripe" | "bkash";

export function parsePaymentProvider(
  value: string | null | undefined,
): PaymentProvider | null {
  const raw = (value || "").trim().toLowerCase();
  if (raw === "bkash") return "bkash";
  if (raw === "stripe") return "stripe";
  return null;
}

/** Default provider from env when the client does not send one. */
export function getPaymentProvider(): PaymentProvider {
  return (
    parsePaymentProvider(process.env.PAYMENT_PROVIDER) ||
    parsePaymentProvider(process.env.NEXT_PUBLIC_PAYMENT_PROVIDER) ||
    "stripe"
  );
}

export function paymentMethodLabel(provider: PaymentProvider): string {
  return provider === "bkash" ? "bKash" : "Stripe";
}

/** Convert package USD price to BDT for bKash (default ৳110 = $1). */
export function usdToBdt(amountUsd: number): number {
  const rate = Number(process.env.BKASH_BDT_PER_USD || 110);
  return Math.round(amountUsd * (Number.isFinite(rate) && rate > 0 ? rate : 110));
}
