"use client";

import { useEffect, useState } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { cx } from "@/lib/utils";

export const THEME_KEY = "theme";

/**
 * Toggles the `.dark` class on <html> and persists the choice. The initial
 * class is applied by the inline no-flash script in the root layout, so this
 * only needs to sync its own display state on mount.
 */
export function DarkModeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync display state from the class the no-flash script already applied.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      /* ignore storage errors */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cx(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-body transition-colors hover:bg-surface-2 hover:text-heading",
        className,
      )}
    >
      {/* Avoid a hydration mismatch: render nothing until mounted. */}
      {mounted ? dark ? <FiSun /> : <FiMoon /> : <span className="h-4 w-4" />}
    </button>
  );
}
