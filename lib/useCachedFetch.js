"use client";

import { useEffect, useState, useRef } from "react";
import { useCacheStore } from "@/stores/cache";

// Generic hook: cache-first, with optional staleTime (ms)
export function useCachedFetch(key, fetcher, opts = {}) {
  const { staleTime = 1000 * 60 * 5 } = opts; // default 5 minutes
  const cache = useCacheStore();
  const mountedRef = useRef(true);

  const meta = cache.getMeta(key);
  const initial = meta?.value ?? null;

  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const meta = cache.getMeta(key);
    if (meta && Date.now() - meta.updatedAt < staleTime) {
      setData(meta.value);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    Promise.resolve()
      .then(() => fetcher())
      .then((res) => {
        if (cancelled) return;
        cache.setData(key, res);
        if (mountedRef.current) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mountedRef.current) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    const res = await fetcher();
    cache.setData(key, res);
    if (mountedRef.current) {
      setData(res);
      setLoading(false);
    }
    return res;
  };

  return { data, loading, error, refresh };
}
