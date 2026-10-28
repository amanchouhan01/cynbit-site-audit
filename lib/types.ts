export type CategoryKey = "performance" | "accessibility" | "best-practices" | "seo";
export type Strategy = "mobile" | "desktop";

export interface Metric {
  id: string;
  label: string;
  value: string;
  score: number;
}

export interface Finding {
  id: string;
  title: string;
  detail: string;
  category: CategoryKey;
  impact: "high" | "medium";
  displayValue?: string;
}

export interface AuditResult {
  url: string;
  strategy: Strategy;
  fetchedAt: string;
  scores: Record<CategoryKey, number>;
  metrics: Metric[];
  findings: Finding[];
}

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  performance: "Performance",
  accessibility: "Accessibility",
  "best-practices": "Best practices",
  seo: "SEO",
};
