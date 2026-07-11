/**
 * Domain types shared across the client. These mirror the shapes the future
 * Express API is expected to return, so components stay stable when the mock
 * data layer (src/data/*) is swapped for real network calls.
 */

export type Role = "supporter" | "creator" | "admin";

export type CampaignStatus = "pending" | "approved" | "rejected";
export type ContributionStatus = "pending" | "approved" | "rejected";
export type WithdrawalStatus = "pending" | "approved" | "rejected";
export type ReportStatus = "open" | "resolved";

export interface AppUser {
  id: string;
  uid: string; // Firebase uid
  name: string;
  email: string;
  photoURL: string;
  role: Role;
  /** Spendable credits (supporters contribute with these, creators withdraw). */
  credits: number;
  /** Approved credits a creator has raised across campaigns. */
  raisedCredits: number;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  story: string;
  category: string;
  fundingGoal: number; // in credits
  minContribution: number; // in credits
  deadline: string; // ISO date
  rewardInfo: string;
  image: string;
  creatorEmail: string;
  creatorName: string;
  status: CampaignStatus;
  raised: number; // approved credits raised
  backers: number;
  createdAt: string;
}

export interface Contribution {
  id: string;
  campaignId: string;
  campaignTitle: string;
  supporterEmail: string;
  supporterName: string;
  creatorEmail: string;
  amount: number; // credits
  status: ContributionStatus;
  createdAt: string;
}

export type PaymentType = "credit-purchase" | "withdrawal";

export interface Payment {
  id: string;
  userEmail: string;
  type: PaymentType;
  credits: number;
  amountUsd: number;
  method: string;
  reference: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  creatorEmail: string;
  creatorName: string;
  credits: number; // credits to withdraw
  amountUsd: number; // credits / 20
  method: string;
  accountNumber: string;
  status: WithdrawalStatus;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  message: string;
  toEmail: string;
  actionRoute: string;
  time: string; // ISO
  read: boolean;
}

export interface Report {
  id: string;
  reporterEmail: string;
  reporterName: string;
  campaignId: string;
  campaignTitle: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  photo: string;
  quote: string;
}

export interface ApiResult<T> {
  data?: T;
  error?: string;
  status?: number;
}
