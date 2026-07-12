import Stripe from "stripe";
import { createBkashPayment, savePendingPayment } from "@/lib/bkash";
import {
  getPaymentProvider,
  parsePaymentProvider,
  paymentMethodLabel,
  usdToBdt,
} from "@/lib/payment";

/**
 * Starts a credit-purchase checkout. Client may pass `provider: "stripe" | "bkash"`
 * (from the Pay modal). Falls back to PAYMENT_PROVIDER env if omitted.
 *
 * Stripe: Checkout Session (or mock success URL if no secret key).
 * bKash: Tokenized create payment → bkashURL (or mock if credentials missing).
 */
export async function POST(request: Request) {
  let body: {
    credits?: number;
    amountUsd?: number;
    email?: string;
    successPath?: string;
    provider?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const credits = Number(body.credits || 0);
  const amountUsd = Number(body.amountUsd || 0);
  const email = body.email || "";
  const successPath = body.successPath || "/dashboard/supporter/purchase-credit";
  const provider =
    parsePaymentProvider(body.provider) || getPaymentProvider();
  const method = paymentMethodLabel(provider);

  if (credits <= 0 || amountUsd <= 0) {
    return Response.json({ error: "Invalid package" }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") || new URL(request.url).origin;
  const successBase =
    `${origin}${successPath}?status=success&credits=${credits}` +
    `&amount=${amountUsd}&method=${encodeURIComponent(method)}`;
  const cancelUrl = `${origin}${successPath}?status=cancel&method=${encodeURIComponent(method)}`;

  if (provider === "bkash") {
    return startBkashCheckout({
      origin,
      successBase,
      cancelUrl,
      credits,
      amountUsd,
      email,
      method,
    });
  }

  return startStripeCheckout({
    successBase,
    cancelUrl,
    credits,
    amountUsd,
    email,
    method,
  });
}

async function startStripeCheckout(opts: {
  successBase: string;
  cancelUrl: string;
  credits: number;
  amountUsd: number;
  email: string;
  method: string;
}) {
  const secret = process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    const ref = `mock_${Date.now().toString(36)}`;
    return Response.json({
      url: `${opts.successBase}&ref=${ref}`,
      provider: "stripe",
      method: opts.method,
      mock: true,
    });
  }

  try {
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: opts.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(opts.amountUsd * 100),
            product_data: {
              name: `${opts.credits} FundSpring credits`,
              description: "Credits to back campaigns on FundSpring",
            },
          },
        },
      ],
      success_url: `${opts.successBase}&ref={CHECKOUT_SESSION_ID}`,
      cancel_url: opts.cancelUrl,
    });
    return Response.json({
      url: session.url,
      provider: "stripe",
      method: opts.method,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Stripe error" },
      { status: 500 },
    );
  }
}

async function startBkashCheckout(opts: {
  origin: string;
  successBase: string;
  cancelUrl: string;
  credits: number;
  amountUsd: number;
  email: string;
  method: string;
}) {
  const amountBdt = usdToBdt(opts.amountUsd);

  // Optional demo skip — only when explicitly enabled. Otherwise always open
  // the real bKash sandbox payment page (do not auto-credit).
  if (process.env.BKASH_ALLOW_MOCK === "true") {
    const ref = `bkash_mock_${Date.now().toString(36)}`;
    return Response.json({
      url: `${opts.successBase}&ref=${ref}`,
      provider: "bkash",
      method: opts.method,
      mock: true,
      amountBdt,
    });
  }

  try {
    const invoice = `FS${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const callbackURL =
      (process.env.BKASH_CALLBACK_URL || "").trim() ||
      `${opts.origin}/api/bkash/callback`;

    const { paymentID, bkashURL } = await createBkashPayment({
      amountBdt,
      payerReference: opts.email || "01700000000",
      merchantInvoiceNumber: invoice,
      callbackURL,
    });

    savePendingPayment({
      paymentID,
      email: opts.email,
      credits: opts.credits,
      amountUsd: opts.amountUsd,
      amountBdt,
      invoice,
      createdAt: Date.now(),
    });

    return Response.json({
      url: bkashURL,
      provider: "bkash",
      method: opts.method,
      paymentID,
      amountBdt,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "bKash error" },
      { status: 500 },
    );
  }
}
