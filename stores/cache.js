"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Simple key-value cache with persistence in localStorage.
// Each entry stores { value, updatedAt } so callers can decide staleness.
export const useCacheStore = create(
  persist(
    (set, get) => ({
      cache: {},

      setData: (key, value) =>
        set((state) => ({
          cache: {
            ...state.cache,
            [key]: { value, updatedAt: Date.now() },
          },
        })),

      getData: (key) => get().cache?.[key]?.value ?? null,

      getMeta: (key) => get().cache?.[key] ?? null,

      hasData: (key) => Boolean(get().cache?.[key]),

      removeData: (key) =>
        set((state) => {
          const c = { ...state.cache };
          delete c[key];
          return { cache: c };
        }),

      clearAll: () => set({ cache: {} }),
    }),
    {
      name: "mentora-cache",
      getStorage: () => localStorage,
    },
  ),
);
