/**
 * Mock backend. Persists a small "database" in localStorage and exposes a
 * REST-like `mockApi(path, options)` router that mirrors the endpoints the
 * future Express server will provide. All business rules (credits, approvals,
 * refunds, notifications) live here so the UI components never special-case
 * "mock vs real".
 *
 * TODO(server): when NEXT_PUBLIC_API_URL points at the live Express API,
 * src/lib/api.ts stops calling this file — delete it and src/data/seed.ts.
 */

import type {
  AppNotification,
  AppUser,
  Campaign,
  Contribution,
  Payment,
  Report,
  Role,
  Withdrawal,
} from "@/lib/types";
import { buildSeed, CATEGORIES, SeedDb, TESTIMONIALS } from "@/data/seed";

const STORAGE_KEY = "fundspring.db.v1";

const CREDIT_GRANT: Record<Role, number> = {
  supporter: 50,
  creator: 20,
  admin: 0,
};

const PURCHASE_RATE = 10; // credits per USD when buying
const WITHDRAW_RATE = 20; // credits per USD when withdrawing
const MIN_WITHDRAW_CREDITS = 200;

type Db = SeedDb;

function nowIso(): string {
  return new Date().toISOString();
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function loadDb(): Db {
  if (typeof window === "undefined") return buildSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = buildSeed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as Db;
  } catch {
    const seed = buildSeed();
    return seed;
  }
}

function saveDb(db: Db): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/** Reset helper (used by a dev-only button if needed). */
export function resetMockDb(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function notify(
  db: Db,
  message: string,
  toEmail: string,
  actionRoute: string,
): void {
  db.notifications.push({
    id: genId("n"),
    message,
    toEmail,
    actionRoute,
    time: nowIso(),
    read: false,
  });
}

function isExpired(c: Campaign): boolean {
  return new Date(c.deadline).getTime() < Date.now();
}

// --------------------------------------------------------------------------
// Result helpers
// --------------------------------------------------------------------------
type Result = { data?: unknown; error?: string; status?: number };
const ok = (data: unknown): Result => ({ data, status: 200 });
const fail = (error: string, status = 400): Result => ({ error, status });

// --------------------------------------------------------------------------
// Router
// --------------------------------------------------------------------------
export interface MockOptions {
  method?: string;
  body?: unknown;
}

export function mockApi(rawPath: string, options: MockOptions = {}): Result {
  const method = (options.method || "GET").toUpperCase();
  const [pathname, queryString = ""] = rawPath.split("?");
  const query = new URLSearchParams(queryString);
  const body = (options.body ?? {}) as Record<string, unknown>;
  const segments = pathname.split("/").filter(Boolean); // e.g. ["campaigns","c-1","status"]

  const db = loadDb();
  let result: Result;

  try {
    result = route(db, method, segments, query, body);
  } catch (err) {
    result = fail(err instanceof Error ? err.message : "Mock request failed", 500);
  }

  // Any handler may mutate `db`; persist unless it was a plain read.
  if (method !== "GET") saveDb(db);
  return result;
}

function route(
  db: Db,
  method: string,
  seg: string[],
  q: URLSearchParams,
  body: Record<string, unknown>,
): Result {
  const [root, a, b] = seg;

  switch (root) {
    case "categories":
      return ok(CATEGORIES);
    case "testimonials":
      return ok(TESTIMONIALS);
    case "users":
      return usersRoute(db, method, a, b, q, body);
    case "campaigns":
      return campaignsRoute(db, method, a, b, q, body);
    case "contributions":
      return contributionsRoute(db, method, a, b, q, body);
    case "payments":
      return paymentsRoute(db, method, q, body);
    case "withdrawals":
      return withdrawalsRoute(db, method, a, b, q, body);
    case "notifications":
      return notificationsRoute(db, method, a, q, body);
    case "reports":
      return reportsRoute(db, method, a, body);
    case "stats":
      return statsRoute(db, a, q);
    default:
      return fail(`Unknown endpoint: /${seg.join("/")}`, 404);
  }
}

// --------------------------------------------------------------------------
// Users
// --------------------------------------------------------------------------
function usersRoute(
  db: Db,
  method: string,
  a: string | undefined,
  b: string | undefined,
  q: URLSearchParams,
  body: Record<string, unknown>,
): Result {
  // POST /users/register — create or return existing (credits granted ONCE).
  if (method === "POST" && a === "register") {
    const email = String(body.email || "").toLowerCase();
    if (!email) return fail("Email is required");
    const existing = db.users.find((u) => u.email === email);
    if (existing) {
      // Never re-grant credits on subsequent logins; just refresh profile bits.
      if (body.name) existing.name = String(body.name);
      if (body.photoURL) existing.photoURL = String(body.photoURL);
      if (body.uid) existing.uid = String(body.uid);
      return ok(existing);
    }
    const role = (String(body.role || "supporter") as Role) || "supporter";
    const user: AppUser = {
      id: genId("u"),
      uid: String(body.uid || ""),
      name: String(body.name || email.split("@")[0]),
      email,
      photoURL: String(body.photoURL || ""),
      role,
      credits: CREDIT_GRANT[role] ?? 0,
      raisedCredits: 0,
      createdAt: nowIso(),
    };
    db.users.push(user);
    return ok(user);
  }

  // GET /users/me?email=
  if (method === "GET" && a === "me") {
    const email = (q.get("email") || "").toLowerCase();
    const user = db.users.find((u) => u.email === email) || null;
    return ok(user);
  }

  // GET /users — admin list
  if (method === "GET" && !a) {
    return ok([...db.users].sort((x, y) => x.name.localeCompare(y.name)));
  }

  // PATCH /users/:id/role
  if (method === "PATCH" && a && b === "role") {
    const user = db.users.find((u) => u.id === a);
    if (!user) return fail("User not found", 404);
    user.role = String(body.role) as Role;
    return ok(user);
  }

  // DELETE /users/:id
  if (method === "DELETE" && a) {
    const idx = db.users.findIndex((u) => u.id === a);
    if (idx === -1) return fail("User not found", 404);
    const [removed] = db.users.splice(idx, 1);
    return ok(removed);
  }

  return fail("Unsupported users request", 405);
}

// --------------------------------------------------------------------------
// Campaigns
// --------------------------------------------------------------------------
function campaignsRoute(
  db: Db,
  method: string,
  a: string | undefined,
  b: string | undefined,
  q: URLSearchParams,
  body: Record<string, unknown>,
): Result {
  // GET /campaigns/top?limit=6
  if (method === "GET" && a === "top") {
    const limit = Number(q.get("limit") || 6);
    const top = db.campaigns
      .filter((c) => c.status === "approved")
      .sort((x, y) => y.raised - x.raised)
      .slice(0, limit);
    return ok(top);
  }

  // GET /campaigns/mine?email=
  if (method === "GET" && a === "mine") {
    const email = (q.get("email") || "").toLowerCase();
    const mine = db.campaigns
      .filter((c) => c.creatorEmail === email)
      .sort((x, y) => new Date(y.deadline).getTime() - new Date(x.deadline).getTime());
    return ok(mine);
  }

  // GET /campaigns/pending — admin approval queue
  if (method === "GET" && a === "pending") {
    return ok(db.campaigns.filter((c) => c.status === "pending"));
  }

  // GET /campaigns/:id
  if (method === "GET" && a && !b) {
    const c = db.campaigns.find((x) => x.id === a);
    return c ? ok(c) : fail("Campaign not found", 404);
  }

  // GET /campaigns — public list with filters
  if (method === "GET" && !a) {
    let list = [...db.campaigns];
    const status = q.get("status");
    if (status) list = list.filter((c) => c.status === status);
    if (q.get("notExpired") === "true") list = list.filter((c) => !isExpired(c));
    const category = q.get("category");
    if (category) list = list.filter((c) => c.category === category);
    const search = (q.get("q") || "").toLowerCase().trim();
    if (search) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.story.toLowerCase().includes(search),
      );
    }
    const sort = q.get("sort");
    if (sort === "raised") list.sort((x, y) => y.raised - x.raised);
    else if (sort === "deadline")
      list.sort(
        (x, y) => new Date(x.deadline).getTime() - new Date(y.deadline).getTime(),
      );
    else list.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
    return ok(list);
  }

  // POST /campaigns — create pending
  if (method === "POST" && !a) {
    const campaign: Campaign = {
      id: genId("c"),
      title: String(body.title || "Untitled campaign"),
      story: String(body.story || ""),
      category: String(body.category || "community"),
      fundingGoal: Number(body.fundingGoal || 0),
      minContribution: Number(body.minContribution || 10),
      deadline: String(body.deadline || nowIso()),
      rewardInfo: String(body.rewardInfo || ""),
      image: String(body.image || ""),
      creatorEmail: String(body.creatorEmail || "").toLowerCase(),
      creatorName: String(body.creatorName || "Creator"),
      status: "pending",
      raised: 0,
      backers: 0,
      createdAt: nowIso(),
    };
    db.campaigns.push(campaign);
    // Notify all admins there's something to review.
    db.users
      .filter((u) => u.role === "admin")
      .forEach((admin) =>
        notify(
          db,
          `New campaign "${campaign.title}" is awaiting approval.`,
          admin.email,
          "/dashboard/admin/campaign-approvals",
        ),
      );
    return ok(campaign);
  }

  // PATCH /campaigns/:id/status — admin approve/reject
  if (method === "PATCH" && a && b === "status") {
    const c = db.campaigns.find((x) => x.id === a);
    if (!c) return fail("Campaign not found", 404);
    const status = String(body.status) as Campaign["status"];
    c.status = status;
    if (status === "approved") {
      notify(
        db,
        `Your campaign "${c.title}" was approved and is now live.`,
        c.creatorEmail,
        `/campaigns/${c.id}`,
      );
    } else if (status === "rejected") {
      notify(
        db,
        `Your campaign "${c.title}" was not approved. Check your dashboard for details.`,
        c.creatorEmail,
        "/dashboard/creator/my-campaigns",
      );
    }
    return ok(c);
  }

  // PATCH /campaigns/:id — creator edits (title/story/reward only)
  if (method === "PATCH" && a && !b) {
    const c = db.campaigns.find((x) => x.id === a);
    if (!c) return fail("Campaign not found", 404);
    if (body.title !== undefined) c.title = String(body.title);
    if (body.story !== undefined) c.story = String(body.story);
    if (body.rewardInfo !== undefined) c.rewardInfo = String(body.rewardInfo);
    return ok(c);
  }

  // DELETE /campaigns/:id — refund approved supporters, remove campaign
  if (method === "DELETE" && a) {
    const c = db.campaigns.find((x) => x.id === a);
    if (!c) return fail("Campaign not found", 404);
    const related = db.contributions.filter((ct) => ct.campaignId === a);
    related
      .filter((ct) => ct.status === "approved")
      .forEach((ct) => {
        const supporter = db.users.find((u) => u.email === ct.supporterEmail);
        if (supporter) supporter.credits += ct.amount;
        notify(
          db,
          `"${c.title}" was closed by its creator. Your ${ct.amount} credits were refunded.`,
          ct.supporterEmail,
          "/dashboard/supporter/my-contributions",
        );
      });
    // Roll back the creator's raised credits for this campaign.
    const creator = db.users.find((u) => u.email === c.creatorEmail);
    if (creator) creator.raisedCredits = Math.max(0, creator.raisedCredits - c.raised);
    db.contributions = db.contributions.filter((ct) => ct.campaignId !== a);
    db.campaigns = db.campaigns.filter((x) => x.id !== a);
    return ok({ id: a, refunded: related.filter((r) => r.status === "approved").length });
  }

  return fail("Unsupported campaigns request", 405);
}

// --------------------------------------------------------------------------
// Contributions
// --------------------------------------------------------------------------
function contributionsRoute(
  db: Db,
  method: string,
  a: string | undefined,
  b: string | undefined,
  q: URLSearchParams,
  body: Record<string, unknown>,
): Result {
  // GET /contributions/review?creatorEmail= — pending items for a creator
  if (method === "GET" && a === "review") {
    const creatorEmail = (q.get("creatorEmail") || "").toLowerCase();
    const list = db.contributions
      .filter((ct) => ct.creatorEmail === creatorEmail)
      .sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
    return ok(list);
  }

  // GET /contributions?supporterEmail= | ?creatorEmail= | ?campaignId=
  if (method === "GET" && !a) {
    let list = [...db.contributions];
    const supporterEmail = (q.get("supporterEmail") || "").toLowerCase();
    const creatorEmail = (q.get("creatorEmail") || "").toLowerCase();
    const campaignId = q.get("campaignId");
    const status = q.get("status");
    if (supporterEmail) list = list.filter((c) => c.supporterEmail === supporterEmail);
    if (creatorEmail) list = list.filter((c) => c.creatorEmail === creatorEmail);
    if (campaignId) list = list.filter((c) => c.campaignId === campaignId);
    if (status) list = list.filter((c) => c.status === status);
    list.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
    return ok(list);
  }

  // POST /contributions — supporter contributes (credits held, status pending)
  if (method === "POST" && !a) {
    const campaign = db.campaigns.find((c) => c.id === String(body.campaignId));
    if (!campaign) return fail("Campaign not found", 404);
    if (campaign.status !== "approved") return fail("This campaign is not open for funding.");
    if (isExpired(campaign)) return fail("This campaign has ended.");
    const supporter = db.users.find(
      (u) => u.email === String(body.supporterEmail || "").toLowerCase(),
    );
    if (!supporter) return fail("Supporter account not found", 404);
    const amount = Number(body.amount || 0);
    if (amount < campaign.minContribution)
      return fail(`Minimum contribution is ${campaign.minContribution} credits.`);
    if (supporter.credits < amount) return fail("Insufficient credits.");

    supporter.credits -= amount; // hold the credits until reviewed
    const contribution: Contribution = {
      id: genId("ct"),
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      supporterEmail: supporter.email,
      supporterName: supporter.name,
      creatorEmail: campaign.creatorEmail,
      amount,
      status: "pending",
      createdAt: nowIso(),
    };
    db.contributions.push(contribution);
    notify(
      db,
      `${supporter.name} pledged ${amount} credits to "${campaign.title}".`,
      campaign.creatorEmail,
      "/dashboard/creator/home",
    );
    return ok(contribution);
  }

  // PATCH /contributions/:id/status — creator approve/reject
  if (method === "PATCH" && a && b === "status") {
    const ct = db.contributions.find((x) => x.id === a);
    if (!ct) return fail("Contribution not found", 404);
    if (ct.status !== "pending") return fail("This contribution was already reviewed.");
    const status = String(body.status) as Contribution["status"];
    ct.status = status;
    const campaign = db.campaigns.find((c) => c.id === ct.campaignId);
    const creator = db.users.find((u) => u.email === ct.creatorEmail);

    if (status === "approved") {
      if (campaign) {
        campaign.raised += ct.amount;
        campaign.backers += 1;
      }
      if (creator) creator.raisedCredits += ct.amount;
      notify(
        db,
        `Your ${ct.amount}-credit contribution to "${ct.campaignTitle}" was approved. Thank you!`,
        ct.supporterEmail,
        "/dashboard/supporter/my-contributions",
      );
    } else if (status === "rejected") {
      const supporter = db.users.find((u) => u.email === ct.supporterEmail);
      if (supporter) supporter.credits += ct.amount; // refund the held credits
      notify(
        db,
        `Your contribution to "${ct.campaignTitle}" was declined and ${ct.amount} credits were refunded.`,
        ct.supporterEmail,
        "/dashboard/supporter/my-contributions",
      );
    }
    return ok(ct);
  }

  return fail("Unsupported contributions request", 405);
}

// --------------------------------------------------------------------------
// Payments
// --------------------------------------------------------------------------
function paymentsRoute(
  db: Db,
  method: string,
  q: URLSearchParams,
  body: Record<string, unknown>,
): Result {
  if (method === "GET") {
    const email = (q.get("email") || "").toLowerCase();
    const list = db.payments
      .filter((p) => !email || p.userEmail === email)
      .sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
    return ok(list);
  }

  // POST /payments — record a credit purchase and grant credits.
  if (method === "POST") {
    const reference = String(body.reference || genId("ref"));
    // Idempotency: don't double-credit the same checkout reference.
    const existing = db.payments.find((p) => p.reference === reference);
    if (existing) return ok(existing);

    const email = String(body.userEmail || "").toLowerCase();
    const type = String(body.type || "credit-purchase") as Payment["type"];
    const credits = Number(body.credits || 0);
    const amountUsd = Number(body.amountUsd || credits / PURCHASE_RATE);
    const payment: Payment = {
      id: genId("p"),
      userEmail: email,
      type,
      credits,
      amountUsd,
      method: String(body.method || "Stripe"),
      reference,
      createdAt: nowIso(),
    };
    db.payments.push(payment);
    if (type === "credit-purchase") {
      const user = db.users.find((u) => u.email === email);
      if (user) user.credits += credits;
    }
    return ok(payment);
  }

  return fail("Unsupported payments request", 405);
}

// --------------------------------------------------------------------------
// Withdrawals
// --------------------------------------------------------------------------
function withdrawalsRoute(
  db: Db,
  method: string,
  a: string | undefined,
  b: string | undefined,
  q: URLSearchParams,
  body: Record<string, unknown>,
): Result {
  // GET /withdrawals?creatorEmail= | ?status=pending
  if (method === "GET" && !a) {
    let list = [...db.withdrawals];
    const creatorEmail = (q.get("creatorEmail") || "").toLowerCase();
    const status = q.get("status");
    if (creatorEmail) list = list.filter((w) => w.creatorEmail === creatorEmail);
    if (status) list = list.filter((w) => w.status === status);
    list.sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
    return ok(list);
  }

  // POST /withdrawals — creator requests
  if (method === "POST" && !a) {
    const creator = db.users.find(
      (u) => u.email === String(body.creatorEmail || "").toLowerCase(),
    );
    if (!creator) return fail("Creator not found", 404);
    if (creator.raisedCredits < MIN_WITHDRAW_CREDITS)
      return fail(`You need at least ${MIN_WITHDRAW_CREDITS} raised credits to withdraw.`);
    const credits = Number(body.credits || 0);
    if (credits <= 0) return fail("Enter a valid number of credits.");
    if (credits > creator.raisedCredits) return fail("You cannot withdraw more than you raised.");
    const withdrawal: Withdrawal = {
      id: genId("w"),
      creatorEmail: creator.email,
      creatorName: creator.name,
      credits,
      amountUsd: credits / WITHDRAW_RATE,
      method: String(body.method || "Stripe"),
      accountNumber: String(body.accountNumber || ""),
      status: "pending",
      createdAt: nowIso(),
    };
    db.withdrawals.push(withdrawal);
    db.users
      .filter((u) => u.role === "admin")
      .forEach((admin) =>
        notify(
          db,
          `${creator.name} requested a withdrawal of ${credits} credits.`,
          admin.email,
          "/dashboard/admin/withdrawal-requests",
        ),
      );
    return ok(withdrawal);
  }

  // PATCH /withdrawals/:id/status — admin marks Payment Success (approved)
  if (method === "PATCH" && a && b === "status") {
    const w = db.withdrawals.find((x) => x.id === a);
    if (!w) return fail("Withdrawal not found", 404);
    const status = String(body.status) as Withdrawal["status"];
    w.status = status;
    if (status === "approved") {
      const creator = db.users.find((u) => u.email === w.creatorEmail);
      if (creator) creator.raisedCredits = Math.max(0, creator.raisedCredits - w.credits);
      db.payments.push({
        id: genId("p"),
        userEmail: w.creatorEmail,
        type: "withdrawal",
        credits: w.credits,
        amountUsd: w.amountUsd,
        method: w.method,
        reference: `wd_${w.id}`,
        createdAt: nowIso(),
      });
      notify(
        db,
        `Your withdrawal of ${w.credits} credits ($${w.amountUsd.toFixed(2)}) was paid out.`,
        w.creatorEmail,
        "/dashboard/creator/payment-history",
      );
    }
    return ok(w);
  }

  return fail("Unsupported withdrawals request", 405);
}

// --------------------------------------------------------------------------
// Notifications
// --------------------------------------------------------------------------
function notificationsRoute(
  db: Db,
  method: string,
  a: string | undefined,
  q: URLSearchParams,
  body: Record<string, unknown>,
): Result {
  if (method === "GET") {
    const email = (q.get("email") || "").toLowerCase();
    const list = db.notifications
      .filter((n) => n.toEmail === email)
      .sort((x, y) => new Date(y.time).getTime() - new Date(x.time).getTime());
    return ok(list);
  }

  if (method === "POST") {
    const n: AppNotification = {
      id: genId("n"),
      message: String(body.message || ""),
      toEmail: String(body.toEmail || "").toLowerCase(),
      actionRoute: String(body.actionRoute || "/dashboard"),
      time: nowIso(),
      read: false,
    };
    db.notifications.push(n);
    return ok(n);
  }

  // PATCH /notifications/read?email= — mark all read
  if (method === "PATCH" && a === "read") {
    const email = (q.get("email") || "").toLowerCase();
    db.notifications.forEach((n) => {
      if (n.toEmail === email) n.read = true;
    });
    return ok({ email });
  }

  return fail("Unsupported notifications request", 405);
}

// --------------------------------------------------------------------------
// Reports
// --------------------------------------------------------------------------
function reportsRoute(
  db: Db,
  method: string,
  a: string | undefined,
  body: Record<string, unknown>,
): Result {
  if (method === "GET") {
    const list = [...db.reports].sort(
      (x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime(),
    );
    return ok(list);
  }

  if (method === "POST") {
    const report: Report = {
      id: genId("r"),
      reporterEmail: String(body.reporterEmail || "").toLowerCase(),
      reporterName: String(body.reporterName || "Anonymous"),
      campaignId: String(body.campaignId || ""),
      campaignTitle: String(body.campaignTitle || ""),
      reason: String(body.reason || ""),
      status: "open",
      createdAt: nowIso(),
    };
    db.reports.push(report);
    return ok(report);
  }

  // PATCH /reports/:id — resolve or suspend the reported campaign
  if (method === "PATCH" && a) {
    const report = db.reports.find((r) => r.id === a);
    if (!report) return fail("Report not found", 404);
    const action = String(body.action || "resolve");
    if (action === "suspend") {
      const campaign = db.campaigns.find((c) => c.id === report.campaignId);
      if (campaign) {
        campaign.status = "rejected";
        notify(
          db,
          `Your campaign "${campaign.title}" was suspended after a report.`,
          campaign.creatorEmail,
          "/dashboard/creator/my-campaigns",
        );
      }
    }
    report.status = "resolved";
    return ok(report);
  }

  // DELETE /reports/:id
  if (method === "DELETE" && a) {
    const idx = db.reports.findIndex((r) => r.id === a);
    if (idx === -1) return fail("Report not found", 404);
    const [removed] = db.reports.splice(idx, 1);
    return ok(removed);
  }

  return fail("Unsupported reports request", 405);
}

// --------------------------------------------------------------------------
// Stats (dashboard home cards)
// --------------------------------------------------------------------------
function statsRoute(db: Db, a: string | undefined, q: URLSearchParams): Result {
  if (a === "supporter") {
    const email = (q.get("email") || "").toLowerCase();
    const mine = db.contributions.filter((c) => c.supporterEmail === email);
    const approved = mine.filter((c) => c.status === "approved");
    const pending = mine.filter((c) => c.status === "pending");
    const totalContributed = approved.reduce((s, c) => s + c.amount, 0);
    return ok({
      totalContributions: mine.length,
      pendingContributions: pending.length,
      approvedContributions: approved.length,
      totalContributed,
    });
  }

  if (a === "creator") {
    const email = (q.get("email") || "").toLowerCase();
    const mine = db.campaigns.filter((c) => c.creatorEmail === email);
    const contributions = db.contributions.filter((c) => c.creatorEmail === email);
    const creator = db.users.find((u) => u.email === email);
    return ok({
      totalCampaigns: mine.length,
      approvedCampaigns: mine.filter((c) => c.status === "approved").length,
      pendingReview: contributions.filter((c) => c.status === "pending").length,
      raisedCredits: creator?.raisedCredits ?? 0,
      totalBackers: mine.reduce((s, c) => s + c.backers, 0),
    });
  }

  if (a === "admin") {
    const supporters = db.users.filter((u) => u.role === "supporter").length;
    const creators = db.users.filter((u) => u.role === "creator").length;
    const totalCredits = db.users.reduce((s, u) => s + u.credits, 0);
    const totalPayments = db.payments
      .filter((p) => p.type === "credit-purchase")
      .reduce((s, p) => s + p.amountUsd, 0);
    return ok({
      supporters,
      creators,
      totalCredits,
      totalPayments,
      totalCampaigns: db.campaigns.length,
      pendingCampaigns: db.campaigns.filter((c) => c.status === "pending").length,
      pendingWithdrawals: db.withdrawals.filter((w) => w.status === "pending").length,
      openReports: db.reports.filter((r) => r.status === "open").length,
    });
  }

  return fail("Unknown stats scope", 404);
}
