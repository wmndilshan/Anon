/** Aligned with Next.js `CategorySection` / website horizontal category strip */
export type CategoryItem = {
  slug: string;
  title: string;
  countLabel: string;
  /** Ionicons name — maps website SVG categories to familiar glyphs */
  icon: string;
};

export const CATEGORIES: CategoryItem[] = [
  { slug: "dress", title: "Dress & frock", countLabel: "(53)", icon: "shirt-outline" },
  { slug: "winter", title: "Winter wear", countLabel: "(58)", icon: "cloud-outline" },
  { slug: "glasses", title: "Glasses & lens", countLabel: "(68)", icon: "glasses-outline" },
  { slug: "shorts", title: "Shorts & jeans", countLabel: "(84)", icon: "cut-outline" },
  { slug: "tee", title: "T-shirts", countLabel: "(35)", icon: "shirt-outline" },
  { slug: "jacket", title: "Jacket", countLabel: "(16)", icon: "body-outline" },
  { slug: "watch", title: "Watch", countLabel: "(27)", icon: "watch-outline" },
  { slug: "hat", title: "Hat & caps", countLabel: "(39)", icon: "ribbon-outline" },
];
