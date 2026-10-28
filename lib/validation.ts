import { z } from "zod";

/** Returns a clean public http(s) URL, or null if the input isn't one we should audit. */
export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const isPrivate =
    host === "localhost" ||
    host === "0.0.0.0" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host.includes(":") ||
    /^(127|10)\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);

  if (!host.includes(".") || isPrivate) return null;
  return url.toString();
}

export const auditSchema = z.object({
  url: z.string().min(3).max(2048),
  strategy: z.enum(["mobile", "desktop"]).default("mobile"),
});

const score = z.number().min(0).max(100);

export const leadSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().trim().max(100).optional(),
  url: z.string().max(2048),
  strategy: z.enum(["mobile", "desktop"]),
  scores: z.object({
    performance: score,
    accessibility: score,
    "best-practices": score,
    seo: score,
  }),
  // Honeypot: real users never see or fill this field.
  companySite: z.string().optional(),
});
