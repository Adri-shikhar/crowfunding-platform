"use client";

import { FiMenu } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import type { Role } from "@/lib/types";
import { themes } from "@/lib/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Image";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { formatCredits } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";

export function DashboardHeader({
  role,
  onMenu,
}: {
  role: Role;
  onMenu: () => void;
}) {
  const { firebaseUser, dbUser, credits } = useAuth();
  const theme = themes[role];

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenu}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-body lg:hidden"
            aria-label="Open menu"
          >
            <FiMenu />
          </button>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-heading">
              {theme.label} dashboard
            </p>
            <p className="text-xs text-muted">Welcome back, {dbUser?.name?.split(" ")[0] ?? "there"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Available credits */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent">
            <HiOutlineSparkles />
            {formatCredits(credits)}
            <span className="hidden font-medium text-accent/80 sm:inline">credits</span>
          </span>

          <NotificationBell />
          <DarkModeToggle />

          <div className="flex items-center gap-2.5 border-l border-border pl-2 sm:pl-3">
            <Avatar
              src={dbUser?.photoURL || firebaseUser?.photoURL}
              name={dbUser?.name || firebaseUser?.displayName}
              email={firebaseUser?.email}
              size={36}
            />
            <div className="hidden text-right sm:block">
              <p className="max-w-[9rem] truncate text-sm font-semibold text-heading">
                {dbUser?.name || firebaseUser?.displayName || "Member"}
              </p>
              <p className="text-xs capitalize text-muted">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
