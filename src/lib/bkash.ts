/**
 * bKash Tokenized Checkout helpers (sandbox + live).
 * All calls must stay on the server — never expose secrets to the client.
 */

export interface BkashPendingPayment {
  paymentID: string;
  email: string;
  credits: number;
  amountUsd: number;
  amountBdt: number;
  invoice: string;
  createdAt: number;
}

/** In-memory pending payments for the demo (lost on server restart). */
const pending = new Map<string, BkashPendingPayment>();

/** Public sandbox defaults so checkout works even if .env wasn't reloaded. */
const SANDBOX = {
  baseUrl: "https://tokenized.sandbox.bka.sh/v1.2.0-beta",
  appKey: "4f6o0cjiki2rfm34kfdadl1eqq",
  appSecret: "2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b",
  username: "sandboxTokenizedUser02",
  password: "sandboxTokenizedUser02@12345",
};

export function savePendingPayment(entry: BkashPendingPayment): void {
  pending.set(entry.paymentID, entry);
}

export function takePendingPayment(
  paymentID: string,
): BkashPendingPayment | undefined {
  const entry = pending.get(paymentID);
  if (entry) pending.delete(paymentID);
  return entry;
}

export function peekPendingPayment(
  paymentID: string,
): BkashPendingPayment | undefined {
  return pending.get(paymentID);
}

function cfg() {
  return {
    baseUrl: (
      process.env.BKASH_BASE_URL?.replace(/\/$/, "") || SANDBOX.baseUrl
    ).replace(/\/$/, ""),
    appKey: process.env.BKASH_APP_KEY || SANDBOX.appKey,
    appSecret: process.env.BKASH_APP_SECRET || SANDBOX.appSecret,
    username: process.env.BKASH_USERNAME || SANDBOX.username,
    password: process.env.BKASH_PASSWORD || SANDBOX.password,
  };
}

export function bkashConfigured(): boolean {
  const c = cfg();
  return Boolean(c.appKey && c.appSecret && c.username && c.password);
}

/** bKash rejects some special chars in payerReference — keep it simple. */
export function sanitizePayerReference(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9._+-]/g, "").slice(0, 255);
  return cleaned || "01700000000";
}

interface GrantTokenResponse {
  id_token?: string;
  statusCode?: string;
  statusMessage?: string;
  errorMessage?: string;
  msg?: string;
}

export async function grantBkashToken(): Promise<string> {
  const c = cfg();
  const res = await fetch(`${c.baseUrl}/tokenized/checkout/token/grant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      username: c.username,
      password: c.password,
    },
    body: JSON.stringify({
      app_key: c.appKey,
      app_secret: c.appSecret,
    }),
    cache: "no-store",
  });

  const json = (await res.json()) as GrantTokenResponse;
  if (!json.id_token) {
    throw new Error(
      json.errorMessage ||
        json.statusMessage ||
        json.msg ||
        "Failed to grant bKash token",
    );
  }
  return json.id_token;
}

interface CreatePaymentResponse {
  paymentID?: string;
  bkashURL?: string;
  statusCode?: string;
  statusMessage?: string;
  errorMessage?: string;
  errorCode?: string;
}

export async function createBkashPayment(input: {
  amountBdt: number;
  payerReference: string;
  merchantInvoiceNumber: string;
  callbackURL: string;
}): Promise<{ paymentID: string; bkashURL: string }> {
  const c = cfg();
  const token = await grantBkashToken();
  const res = await fetch(`${c.baseUrl}/tokenized/checkout/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: token,
      "x-app-key": c.appKey,
    },
    body: JSON.stringify({
      mode: "0011",
      payerReference: sanitizePayerReference(input.payerReference),
      callbackURL: input.callbackURL,
      amount: String(input.amountBdt),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: input.merchantInvoiceNumber.slice(0, 255),
    }),
    cache: "no-store",
  });

  const json = (await res.json()) as CreatePaymentResponse;
  if (!json.paymentID || !json.bkashURL) {
    throw new Error(
      json.errorMessage ||
        json.statusMessage ||
        `Failed to create bKash payment (${json.errorCode || json.statusCode || "unknown"})`,
    );
  }
  return { paymentID: json.paymentID, bkashURL: json.bkashURL };
}

interface ExecutePaymentResponse {
  paymentID?: string;
  trxID?: string;
  transactionStatus?: string;
  amount?: string;
  statusCode?: string;
  statusMessage?: string;
  errorMessage?: string;
}

export async function executeBkashPayment(
  paymentID: string,
): Promise<ExecutePaymentResponse> {
  const c = cfg();
  const token = await grantBkashToken();
  const res = await fetch(`${c.baseUrl}/tokenized/checkout/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: token,
      "x-app-key": c.appKey,
    },
    body: JSON.stringify({ paymentID }),
    cache: "no-store",
  });

  return (await res.json()) as ExecutePaymentResponse;
}
