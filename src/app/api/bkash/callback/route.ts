import { NextRequest, NextResponse } from "next/server";
import {
  executeBkashPayment,
  peekPendingPayment,
  takePendingPayment,
} from "@/lib/bkash";

/**
 * bKash redirects here after the wallet UI.
 * Query: paymentID, status=success|failure|cancel
 * On success we Execute Payment, then send the user back to purchase-credit
 * with the same success query shape Stripe uses so the page can record credits.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const paymentID = searchParams.get("paymentID") || "";
  const status = (searchParams.get("status") || "").toLowerCase();
  const origin = request.nextUrl.origin;
  const successPath = "/dashboard/supporter/purchase-credit";

  const pending = paymentID ? peekPendingPayment(paymentID) : undefined;

  if (status !== "success" || !paymentID) {
    if (paymentID) takePendingPayment(paymentID);
    return NextResponse.redirect(
      `${origin}${successPath}?status=cancel&method=bKash`,
    );
  }

  try {
    const executed = await executeBkashPayment(paymentID);
    const ok =
      executed.transactionStatus === "Completed" ||
      executed.statusCode === "0000";

    const entry = takePendingPayment(paymentID) || pending;
    if (!ok || !entry) {
      return NextResponse.redirect(
        `${origin}${successPath}?status=cancel&method=bKash`,
      );
    }

    const ref = executed.trxID || paymentID;
    const url =
      `${origin}${successPath}?status=success` +
      `&credits=${entry.credits}` +
      `&amount=${entry.amountUsd}` +
      `&ref=${encodeURIComponent(ref)}` +
      `&method=bKash`;

    return NextResponse.redirect(url);
  } catch {
    if (paymentID) takePendingPayment(paymentID);
    return NextResponse.redirect(
      `${origin}${successPath}?status=cancel&method=bKash`,
    );
  }
}
