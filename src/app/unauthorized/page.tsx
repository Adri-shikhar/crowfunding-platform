"use client";

import Link from "next/link";
import { FiLock } from "react-icons/fi";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/lib/dashboard";
import { Button } from "@/components/ui";

export default function UnauthorizedPage() {
  const { role } = useAuth();
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-2xl text-rose-500">
        <FiLock />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-heading">
        Access denied
      </h1>
      <p className="mt-3 text-muted">
        You don&apos;t have permission to view that page. If you think this is a
        mistake, head back to your dashboard.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href={role ? getDashboardPath(role) : "/"}>
          <Button>Go to my dashboard</Button>
        </Link>
        <Link href="/">
          <Button variant="outline">Back home</Button>
        </Link>
      </div>
    </div>
  );
}
