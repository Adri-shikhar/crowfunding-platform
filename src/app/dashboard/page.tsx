"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/lib/dashboard";
import { LoadingScreen } from "@/components/ui";

/**
 * Entry point for /dashboard — sends the user to their role's home. Never
 * redirects while Firebase auth is still resolving (survives a page reload).
 */
export default function DashboardIndex() {
  const { firebaseUser, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/login");
    } else if (role) {
      router.replace(getDashboardPath(role));
    }
  }, [firebaseUser, role, loading, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <LoadingScreen label="Opening your dashboard…" />
    </div>
  );
}
