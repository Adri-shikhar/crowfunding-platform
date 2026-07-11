import type { ReactNode } from "react";
import { FaSeedling } from "react-icons/fa6";
import { FiCheck } from "react-icons/fi";

const highlights = [
  "50 free credits for supporters, 20 for creators",
  "Every campaign is admin-reviewed before it's live",
  "Declined pledges are refunded, automatically",
];

/**
 * Split-screen shell for the login / register pages: a branded gradient panel on
 * the left (hidden on small screens) and the form on the right.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-7xl grid-cols-1 gap-0 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-12">
      {/* Brand panel */}
      <div className="hidden items-center lg:flex">
        <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-accent-strong p-10 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">
              <FaSeedling />
            </span>
            <h2 className="mt-8 text-3xl font-extrabold leading-tight">
              Fund the ideas that make tomorrow better.
            </h2>
            <p className="mt-4 max-w-md text-white/85">
              FundSpring connects everyday supporters with creators building
              real, reviewed projects. Join a community that turns credits into
              change.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <FiCheck />
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold tracking-tight text-heading">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
