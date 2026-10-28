import type { CategoryKey } from "./types";

// Maps each audit category to the Cynbit service that would own the fix.
export const SERVICE_FOR_CATEGORY: Record<CategoryKey, { name: string; href: string }> = {
  performance: { name: "Cloud systems & performance", href: "https://www.cynbit.in/services" },
  accessibility: { name: "Software development", href: "https://www.cynbit.in/services" },
  "best-practices": { name: "Software development", href: "https://www.cynbit.in/services" },
  seo: { name: "Technical SEO", href: "https://www.cynbit.in/services" },
};
