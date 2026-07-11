"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, loading, logOut } = useAuth();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Crowdfunding Platform
      </h1>

      {loading ? (
        <p className="text-neutral-600">Checking auth...</p>
      ) : user ? (
        <div className="flex flex-col gap-3">
          <p className="text-neutral-700">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/explore-campaigns">Explore Campaigns</Link>
            <Link href="/available-credits">Available Credits</Link>
            <Button onPress={() => logOut()}>Log out</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Link href="/login">
            <Button>Log in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="secondary">Sign up</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
