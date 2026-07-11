/**
 * Role-based dashboard configuration: which URL belongs to which role, the
 * sidebar links per role, and the accent theme each role gets. DashboardLayout
 * reads `themes[role]` and sets the `--accent*` CSS variables inline so the
 * whole subtree re-skins with zero extra CSS.
 */

import type { IconType } from "react-icons";
import {
  FiHome,
  FiCompass,
  FiHeart,
  FiCreditCard,
  FiClock,
  FiPlusCircle,
  FiFolder,
  FiDownloadCloud,
  FiCheckSquare,
  FiDollarSign,
  FiUsers,
  FiGrid,
  FiFlag,
} from "react-icons/fi";
import type { Role } from "@/lib/types";

export interface SidebarLink {
  label: string;
  href: string;
  icon: IconType;
}

export interface RoleTheme {
  label: string;
  /** Solid accent — white text sits on it in both light and dark. */
  accent: string;
  accentStrong: string;
  accentFg: string;
  /** Tailwind-friendly gradient for hero headers. */
  gradient: string;
  tagline: string;
}

export const ROLES: Role[] = ["supporter", "creator", "admin"];

export function getRoleFromPath(pathname: string): Role | null {
  if (pathname.includes("/dashboard/supporter")) return "supporter";
  if (pathname.includes("/dashboard/creator")) return "creator";
  if (pathname.includes("/dashboard/admin")) return "admin";
  return null;
}

export function getDashboardPath(role: Role): string {
  return `/dashboard/${role}/home`;
}

export function getProfilePath(role: Role): string {
  return `/dashboard/${role}/home`;
}

export const themes: Record<Role, RoleTheme> = {
  supporter: {
    label: "Supporter",
    accent: "#0d9488",
    accentStrong: "#0f766e",
    accentFg: "#ffffff",
    gradient: "linear-gradient(120deg, #0d9488, #22c55e)",
    tagline: "Back the ideas you believe in.",
  },
  creator: {
    label: "Creator",
    accent: "#7c3aed",
    accentStrong: "#6d28d9",
    accentFg: "#ffffff",
    gradient: "linear-gradient(120deg, #7c3aed, #d946ef)",
    tagline: "Turn your idea into a funded reality.",
  },
  admin: {
    label: "Admin",
    accent: "#c2410c",
    accentStrong: "#9a3412",
    accentFg: "#ffffff",
    gradient: "linear-gradient(120deg, #c2410c, #f59e0b)",
    tagline: "Keep the platform fair and trusted.",
  },
};

export const sidebarLinks: Record<Role, SidebarLink[]> = {
  supporter: [
    { label: "Home", href: "/dashboard/supporter/home", icon: FiHome },
    { label: "Explore Campaigns", href: "/dashboard/supporter/explore", icon: FiCompass },
    { label: "My Contributions", href: "/dashboard/supporter/my-contributions", icon: FiHeart },
    { label: "Purchase Credit", href: "/dashboard/supporter/purchase-credit", icon: FiCreditCard },
    { label: "Payment History", href: "/dashboard/supporter/payment-history", icon: FiClock },
  ],
  creator: [
    { label: "Home", href: "/dashboard/creator/home", icon: FiHome },
    { label: "Add New Campaign", href: "/dashboard/creator/add-campaign", icon: FiPlusCircle },
    { label: "My Campaigns", href: "/dashboard/creator/my-campaigns", icon: FiFolder },
    { label: "Withdrawals", href: "/dashboard/creator/withdrawals", icon: FiDownloadCloud },
    { label: "Payment History", href: "/dashboard/creator/payment-history", icon: FiClock },
  ],
  admin: [
    { label: "Home", href: "/dashboard/admin/home", icon: FiHome },
    { label: "Campaign Approvals", href: "/dashboard/admin/campaign-approvals", icon: FiCheckSquare },
    { label: "Withdrawal Requests", href: "/dashboard/admin/withdrawal-requests", icon: FiDollarSign },
    { label: "Manage Users", href: "/dashboard/admin/manage-users", icon: FiUsers },
    { label: "Manage Campaigns", href: "/dashboard/admin/manage-campaigns", icon: FiGrid },
    { label: "Reports", href: "/dashboard/admin/reports", icon: FiFlag },
  ],
};
