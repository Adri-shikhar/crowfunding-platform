import Link from "next/link";
import { FaSeedling } from "react-icons/fa6";
import { cx } from "@/lib/utils";
import { SITE_NAME } from "@/lib/site";

export function Logo({
  href = "/",
  className,
  compact = false,
}: {
  href?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cx("group inline-flex items-center gap-2.5", className)}
      aria-label={`${SITE_NAME} home`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-strong text-white shadow-sm transition-transform group-hover:scale-105">
        <FaSeedling className="text-lg" />
      </span>
      {!compact && (
        <span className="text-lg font-extrabold tracking-tight text-heading">
          Fund<span className="text-accent">Spring</span>
        </span>
      )}
    </Link>
  );
}
