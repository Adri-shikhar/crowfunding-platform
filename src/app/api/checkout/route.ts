import Stripe from "stripe";

/**
 * Creates a Stripe Checkout Session for a credit purchase and returns its URL.
 * The supporter is redirected there, and on completion Stripe sends them back to
 * `successPath` with the credits/amount/reference in the query — the page then
 * records the payment via apiReq.
 *
 * When STRIPE_SECRET_KEY isn't configured, we fall back to a mock success URL so
 * the whole flow still works end-to-end in the demo.
 */
export async function POST(request: Request) {
  let body: {
    credits?: number;
    amountUsd?: number;
    email?: string;
    successPath?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const credits = Number(body.credits || 0);
  const amountUsd = Number(body.amountUsd || 0);
  const successPath = body.successPath || "/dashboard/supporter/purchase-credit";

  if (credits <= 0 || amountUsd <= 0) {
    return Response.json({ error: "Invalid package" }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") || new URL(request.url).origin;
  const successBase = `${origin}${successPath}?status=success&credits=${credits}&amount=${amountUsd}`;
  const cancelUrl = `${origin}${successPath}?status=cancel`;

  const secret = process.env.STRIPE_SECRET_KEY;

  // ---- Mock fallback (no Stripe key) -----------------------------------
  if (!secret) {
    const ref = `mock_${Date.now().toString(36)}`;
    return Response.json({ url: `${successBase}&ref=${ref}`, mock: true });
  }

  // ---- Real Stripe checkout --------------------------------------------
  try {
    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: body.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amountUsd * 100),
            product_data: {
              name: `${credits} FundSpring credits`,
              description: "Credits to back campaigns on FundSpring",
            },
          },
        },
      ],
      success_url: `${successBase}&ref={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Stripe error" },
      { status: 500 },
    );
  }
}
