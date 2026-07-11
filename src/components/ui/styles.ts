/**
 * Pure styling helpers — no "use client" — so both server and client components
 * can call them (e.g. a server component styling a <Link> like a button).
 */
import { cx } from "@/lib/utils";

export type Variant = "accent" | "soft" | "outline" | "ghost" | "danger" | "success";
export type Size = "sm" | "md" | "lg";

export const VARIANTS: Record<Variant, string> = {
  accent: "bg-accent text-accent-fg hover:bg-accent-strong",
  soft: "bg-accent/10 text-accent hover:bg-accent/20",
  outline:
    "border border-border-strong text-heading hover:border-accent hover:text-accent",
  ghost: "text-body hover:bg-surface-2",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
};

export const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

export function buttonClasses(variant: Variant = "accent", size: Size = "md") {
  return cx(
    "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors",
    "disabled:opacity-55 disabled:cursor-not-allowed active:translate-y-px cursor-pointer",
    VARIANTS[variant],
    SIZES[size],
  );
}
