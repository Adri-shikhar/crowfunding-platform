"use client";

import { FcGoogle } from "react-icons/fc";
import { cx } from "@/lib/utils";
import { Spinner } from "@/components/ui";

export function GoogleButton({
  onClick,
  loading,
  disabled,
  label = "Continue with Google",
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cx(
        "inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-border-strong bg-surface px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {loading ? <Spinner size={18} /> : <FcGoogle className="text-lg" />}
      {label}
    </button>
  );
}
