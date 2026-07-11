"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";

/**
 * Campaign / banner cover image with a themed gradient fallback. Plain <img> so
 * any remote host works without next/image config.
 */
export function CoverImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={cx(
          "flex items-center justify-center bg-gradient-to-br from-accent/25 to-accent/5 text-accent",
          className,
        )}
        aria-label={alt}
      >
        <span className="px-4 text-center text-sm font-semibold opacity-70">
          {alt}
        </span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cx("object-cover", className)}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
