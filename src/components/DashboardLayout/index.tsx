"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import type { Role } from "@/lib/types";
import { themes } from "@/lib/dashboard";
import { SITE_NAME } from "@/lib/site";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

/**
 * Themed dashboard shell: sidebar (role navigation) + header (credits, bell,
 * user) + route section + footer. Sets the `--accent*` CSS variables inline
 * from the role theme so the whole subtree re-skins per role.
 */
export function DashboardLayout({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const theme = themes[role];
  const [mobileOpen, setMobileOpen] = useState(false);

  const accentStyle = {
    "--accent": theme.accent,
    "--accent-strong": theme.accentStrong,
    "--accent-fg": theme.accentFg,
  } as CSSProperties;

  return (
    <div style={accentStyle} className="min-h-dvh bg-bg">
      <Sidebar role={role} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-h-dvh flex-col lg:pl-64">
        <DashboardHeader role={role} onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          {children}
        </main>
        <footer className="border-t border-border px-4 py-5 text-center text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} {SITE_NAME} · {theme.label} workspace
        </footer>
      </div>
    </div>
  );
}
