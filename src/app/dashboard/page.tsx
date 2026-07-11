"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user, loading, logOut } = useAuth();

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-3xl font-semibold">Dashboard</h1>
        <p className="mb-4 text-neutral-600">You need to log in first.</p>
        <Link href="/login">
          <Button>Log in</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-semibold">Dashboard</h1>
      <p className="mb-6 text-neutral-700">
        Welcome, <span className="font-medium">{user.email}</span>
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/">Home</Link>
        <Button onPress={() => logOut()}>Log out</Button>
      </div>
    </main>
  );
}
