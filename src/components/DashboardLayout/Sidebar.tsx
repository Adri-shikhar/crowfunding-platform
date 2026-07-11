"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiExternalLink, FiLogOut, FiX } from "react-icons/fi";
import type { Role } from "@/lib/types";
import { sidebarLinks, themes } from "@/lib/dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { cx } from "@/lib/utils";

function SidebarContent({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logOut } = useAuth();
  const links = sidebarLinks[role];
  const theme = themes[role];

  async function handleLogout() {
    onNavigate?.();
    await logOut();
    router.push("/");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo />
      </div>

      <div className="px-4 py-4">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: theme.accent }}
        >
          {theme.label} workspace
        </span>
        <p className="mt-2 px-1 text-xs text-muted">{theme.tagline}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              data-active={active}
              className={cx(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-fg shadow-sm"
                  : "text-label hover:bg-surface-2 hover:text-heading",
              )}
            >
              <link.icon className="text-lg" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-label transition-colors hover:bg-surface-2 hover:text-heading"
        >
          <FiExternalLink className="text-lg" /> Back to site
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-500 transition-colors hover:bg-rose-500/10"
        >
          <FiLogOut className="text-lg" /> Log out
        </button>
      </div>
    </div>
  );
}

export function Sidebar({
  role,
  mobileOpen,
  onClose,
}: {
  role: Role;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-surface lg:block">
        <SidebarContent role={role} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-surface shadow-2xl">
            <button
              onClick={onClose}
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-heading"
              aria-label="Close menu"
            >
              <FiX />
            </button>
            <SidebarContent role={role} onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
