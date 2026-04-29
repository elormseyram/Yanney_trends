import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX = 6;

interface RecentlyViewedStore {
  slugs: string[];
  push: (slug: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      slugs: [],
      push: (slug) =>
        set((s) => {
          const rest = s.slugs.filter((x) => x !== slug);
          return { slugs: [slug, ...rest].slice(0, MAX) };
        }),
    }),
    { name: "yanney-recent" },
  ),
);
