"use client";

import { useCallback, useEffect, useState } from "react";
import { apiReq } from "@/lib/api";

/**
 * Thin client hook over apiReq for GET requests. Returns the data plus loading
 * / error state and a `refetch` for after mutations. Pass `null` as the path to
 * skip fetching (e.g. while auth is still resolving).
 */
export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!path) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await apiReq<T>(path);
    // setState after an await is intentional (async data load), not a sync cascade.
    if (res.error) setError(res.error);
    else setError(null);
    setData(res.data ?? null);
    setLoading(false);
  }, [path]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
