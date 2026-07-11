"use client";

import type { ReactNode } from "react";
import { RoleGuard } from "@/components/RoleGuard";

export default function SupporterLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="supporter">{children}</RoleGuard>;
}
