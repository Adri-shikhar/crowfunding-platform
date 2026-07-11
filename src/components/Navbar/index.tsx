"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  FiCompass,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiCode,
  FiX,
} from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/lib/dashboard";
import { LINKS } from "@/lib/site";
import { formatCredits } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/Image";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Button, buttonClasses } from "@/components/ui";

function CreditPill({ credits }: { credits: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent">
      <HiOutlineSparkles />
      {formatCredits(credits)}
      <span className="hidden sm:inline font-medium text-accent/80">credits</span>
    </span>
  );
}

export function Navbar() {
  const { firebaseUser, dbUser, loading, role, credits, logOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const dashboardPath = role ? getDashboardPath(role) : "/dashboard";
  const loggedIn = !!firebaseUser;

  // Close the mobile menu whenever the route changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    setProfileOpen(false);
    setMenuOpen(false);
    await logOut();
    router.push("/");
  }

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          <Link
            href="/explore-campaigns"
            data-active={isActive("/explore-campaigns")}
            className="nav-link inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-label transition-colors hover:bg-surface-2 hover:text-heading data-[active=true]:bg-accent/10 data-[active=true]:text-accent"
          >
            <FiCompass /> Explore Campaigns
          </Link>
          {loggedIn && (
            <Link
              href={dashboardPath}
              data-active={pathname.startsWith("/dashboard")}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-label transition-colors hover:bg-surface-2 hover:text-heading data-[active=true]:bg-accent/10 data-[active=true]:text-accent"
            >
              <FiGrid /> Dashboard
            </Link>
          )}
          <a
            href={LINKS.developerRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-label transition-colors hover:bg-surface-2 hover:text-heading"
          >
            <FiCode /> Join as Developer
          </a>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <DarkModeToggle className="hidden sm:inline-flex" />

          {!loading && loggedIn && (
            <Link href={dashboardPath} className="hidden sm:block">
              <CreditPill credits={credits} />
            </Link>
          )}

          {!loading && !loggedIn && (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className={buttonClasses("ghost", "md")}>
                Login
              </Link>
              <Link href="/signup" className={buttonClasses("accent", "md")}>
                Register
              </Link>
            </div>
          )}

          {!loading && loggedIn && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center rounded-full ring-2 ring-transparent transition hover:ring-accent/40"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                <Avatar
                  src={dbUser?.photoURL || firebaseUser?.photoURL}
                  name={dbUser?.name || firebaseUser?.displayName}
                  email={firebaseUser?.email}
                  size={38}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-2xl">
                  <div className="flex items-center gap-3 px-3 py-3">
                    <Avatar
                      src={dbUser?.photoURL || firebaseUser?.photoURL}
                      name={dbUser?.name || firebaseUser?.displayName}
                      email={firebaseUser?.email}
                      size={42}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-heading">
                        {dbUser?.name || firebaseUser?.displayName || "Member"}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {firebaseUser?.email}
                      </p>
                    </div>
                  </div>
                  <div className="mx-2 mb-1.5 flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                    <span className="text-xs font-medium capitalize text-label">
                      {role ?? "member"}
                    </span>
                    <CreditPill credits={credits} />
                  </div>
                  <Link
                    href={dashboardPath}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-body transition-colors hover:bg-surface-2 hover:text-heading"
                  >
                    <FiGrid /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-500 transition-colors hover:bg-rose-500/10"
                  >
                    <FiLogOut /> Log out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-body lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {menuOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            <Link href="/explore-campaigns" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-body hover:bg-surface-2">
              <FiCompass /> Explore Campaigns
            </Link>
            {loggedIn && (
              <Link href={dashboardPath} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-body hover:bg-surface-2">
                <FiGrid /> Dashboard
              </Link>
            )}
            <a
              href={LINKS.developerRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-body hover:bg-surface-2"
            >
              <FiCode /> Join as Developer
            </a>

            <div className="my-2 h-px bg-border" />

            <div className="flex items-center justify-between px-1">
              <DarkModeToggle />
              {loggedIn ? (
                <CreditPill credits={credits} />
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" className={buttonClasses("outline", "sm")}>
                    Login
                  </Link>
                  <Link href="/signup" className={buttonClasses("accent", "sm")}>
                    Register
                  </Link>
                </div>
              )}
            </div>
            {loggedIn && (
              <Button variant="ghost" className="mt-2 justify-start text-rose-500" onClick={handleLogout}>
                <FiLogOut /> Log out
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
