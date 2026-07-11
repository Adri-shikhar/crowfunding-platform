"use client";

import { useState } from "react";
import { avatarColor, cx, initials } from "@/lib/utils";

/**
 * Avatar image with a graceful initials fallback. Renders a plain <img> (so any
 * remote host — imgBB, Google, gravatar — works without next/image domain
 * config) and swaps to a colored initials badge if the src is missing or fails.
 */
export function Avatar({
  src,
  name,
  email,
  size = 40,
  className,
}: {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  const label = initials(name, email);

  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: showImage ? undefined : avatarColor(name || email || label),
        fontSize: Math.max(11, size * 0.4),
      }}
      aria-label={name || email || "User avatar"}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name || email || "User avatar"}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
        />
      ) : (
        label
      )}
    </span>
  );
}
