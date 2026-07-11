"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/lib/dashboard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LoadingScreen } from "@/components/ui";

/**
 * Client-side route guard for a role's dashboard section. Critically, it NEVER
 * redirects while Firebase auth (or the profile fetch) is still resolving — so a
 * hard reload of a private page doesn't bounce the user to /login.
 */
export function RoleGuard({
  role: required,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const { firebaseUser, role, loading } = useAuth();
  const router = useRouter();

  const authResolving = loading || (!!firebaseUser && role === null);
  const authed = !!firebaseUser && role === required;

  useEffect(() => {
    if (authResolving) return;
    if (!firebaseUser) {
      router.replace("/login");
    } else if (role && role !== required) {
      router.replace(getDashboardPath(role));
    }
  }, [authResolving, firebaseUser, role, required, router]);

  if (authResolving) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <LoadingScreen label="Loading your workspace…" />
      </div>
    );
  }

  if (!authed) {
    // Redirect is in-flight; render a spinner rather than flashing content.
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <LoadingScreen label="Redirecting…" />
      </div>
    );
  }

  return <DashboardLayout role={required}>{children}</DashboardLayout>;
}
