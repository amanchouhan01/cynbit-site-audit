import type { AuditResult, CategoryKey, Finding, Metric, Strategy } from "./types";

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const CATEGORIES: CategoryKey[] = ["performance", "accessibility", "best-practices", "seo"];
const METRICS: [id: string, label: string][] = [
  ["first-contentful-paint", "First Contentful Paint"],
  ["largest-contentful-paint", "Largest Contentful Paint"],
  ["total-blocking-time", "Total Blocking Time"],
  ["cumulative-layout-shift", "Layout Shift"],
  ["speed-index", "Speed Index"],
];
const METRIC_IDS = new Set(METRICS.map(([id]) => id));
const FINDINGS_PER_CATEGORY = 3;
const CACHE_TTL_MS = 10 * 60_000;

interface LhAudit {
  title: string;
  description?: string;
  score: number | null;
  scoreDisplayMode: string;
  displayValue?: string;
  details?: { overallSavingsMs?: number };
}
interface LhResult {
  finalUrl?: string;
  categories: Record<string, { score: number | null; auditRefs: { id: string; weight: number; group?: string }[] }>;
  audits: Record<string, LhAudit>;
}

export class AuditError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

const cache = new Map<string, { at: number; result: AuditResult }>();

export async function runAudit(url: string, strategy: Strategy): Promise<AuditResult> {
  const cacheKey = `${strategy}:${url}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.result;

  const params = new URLSearchParams({ url, strategy });
  CATEGORIES.forEach((c) => params.append("category", c));
  if (process.env.PAGESPEED_API_KEY) params.set("key", process.env.PAGESPEED_API_KEY);

  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}?${params}`, { signal: AbortSignal.timeout(55_000) });
  } catch {
    throw new AuditError("The audit took too long. Try again, or test a lighter page.", 504);
  }

  if (res.status === 429) {
    throw new AuditError("Google's PageSpeed quota is used up for the moment. Try again in a minute.", 429);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message: string = body?.error?.message ?? "";
    if (res.status === 400 || message.includes("FAILED_DOCUMENT_REQUEST")) {
      throw new AuditError("We couldn't load that page. Check the address and make sure it's public.", 422);
    }
    throw new AuditError("The audit service returned an error. Try again shortly.", 502);
  }

  const data = (await res.json()) as { lighthouseResult?: LhResult };
  if (!data.lighthouseResult) throw new AuditError("The audit came back empty. Try again.", 502);

  const result = normalize(url, strategy, data.lighthouseResult);
  if (cache.size > 100) cache.clear();
  cache.set(cacheKey, { at: Date.now(), result });
  return result;
}

const clean = (text = "") =>
  text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`/g, "")
    .split(/\s+(?=See |Learn )/)[0]
    .trim()
    .slice(0, 200);

function normalize(url: string, strategy: Strategy, lh: LhResult): AuditResult {
  const scores = Object.fromEntries(
    CATEGORIES.map((c) => [c, Math.round((lh.categories[c]?.score ?? 0) * 100)]),
  ) as Record<CategoryKey, number>;

  const metrics: Metric[] = METRICS.map(([id, label]) => ({
    id,
    label,
    value: lh.audits[id]?.displayValue ?? "n/a",
    score: lh.audits[id]?.score ?? 0,
  }));

  // Take the biggest misses per category so one noisy category can't crowd out the rest.
  const findings: Finding[] = CATEGORIES.flatMap((category) => {
   const failing = (lh.categories[category]?.auditRefs ?? []).flatMap((ref) => {
  const audit = lh.audits[ref.id];
  if (!audit || audit.score === null) return [];
  if (["notApplicable", "manual", "informative"].includes(audit.scoreDisplayMode)) return [];
  if (audit.score >= 0.9) return [];

  // Performance: show actionable opportunities/diagnostics, not the metrics themselves.
  const isPerf = category === "performance";
  const actionable = isPerf
    ? !METRIC_IDS.has(ref.id) && (ref.group === "load-opportunities" || ref.group === "diagnostics")
    : ref.weight > 0;
  if (!actionable) return [];

  const rank = isPerf
    ? (audit.details?.overallSavingsMs ?? 0) + (1 - audit.score) * 100
    : ref.weight * (1 - audit.score);
  return [{ ref, audit, rank }];
});

    return failing
      .sort((a, b) => b.rank - a.rank)
      .slice(0, FINDINGS_PER_CATEGORY)
      .map(({ ref, audit }) => ({
        id: `${category}:${ref.id}`,
        title: audit.title,
        detail: clean(audit.description),
        category,
        impact: (audit.score ?? 0) < 0.5 ? ("high" as const) : ("medium" as const),
        displayValue: audit.displayValue,
      }));
  });

  return { url: lh.finalUrl ?? url, strategy, fetchedAt: new Date().toISOString(), scores, metrics, findings };
}
