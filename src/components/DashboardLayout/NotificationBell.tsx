"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import type { AppNotification } from "@/lib/types";
import { apiReq } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { timeAgo } from "@/lib/utils";

/**
 * Bell icon that opens a floating popup listing notifications addressed to the
 * current user (toEmail === email), newest first. Clicking anywhere outside
 * closes it; opening marks them read.
 */
export function NotificationBell() {
  const { firebaseUser } = useAuth();
  const email = firebaseUser?.email ?? "";
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    if (!email) return;
    const { data } = await apiReq<AppNotification[]>(
      `/notifications?email=${encodeURIComponent(email)}`,
    );
    setItems(data ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // Light polling so approvals/pledges surface without a manual refresh.
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((n) => !n.read).length;

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0 && email) {
      await apiReq(`/notifications/read?email=${encodeURIComponent(email)}`, {
        method: "PATCH",
      });
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        aria-label="Notifications"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-body transition-colors hover:bg-surface-2 hover:text-heading"
      >
        <FiBell />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold text-heading">Notifications</h3>
            <span className="text-xs text-muted">{items.length} total</span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                You&apos;re all caught up.
              </p>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.actionRoute}
                  onClick={() => setOpen(false)}
                  className="flex flex-col gap-1 border-b border-border px-4 py-3 last:border-none transition-colors hover:bg-surface-2"
                >
                  <p className="text-sm text-body">{n.message}</p>
                  <span className="text-xs text-muted">{timeAgo(n.time)}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
