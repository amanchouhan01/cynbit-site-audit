import { createClient } from "@supabase/supabase-js";
import type { CategoryKey, Strategy } from "./types";

interface LeadInput {
  email: string;
  name?: string;
  url: string;
  strategy: Strategy;
  scores: Record<CategoryKey, number>;
}

function client() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function saveLead(lead: LeadInput): Promise<{ stored: boolean }> {
  const db = client();
  if (!db) {
    console.warn("[leads] Supabase env not set; lead not persisted:", lead.email);
    return { stored: false };
  }
  const { error } = await db.from("audit_leads").insert({
    email: lead.email,
    name: lead.name ?? null,
    audited_url: lead.url,
    strategy: lead.strategy,
    scores: lead.scores,
  });
  if (error) throw new Error(error.message);
  return { stored: true };
}

/** Best-effort analytics row. Never throws, never blocks the response on failure. */
export async function logRun(run: { host: string; strategy: Strategy; scores: Record<CategoryKey, number>; ms: number }) {
  const db = client();
  if (!db) return;
  const { error } = await db.from("audit_runs").insert({
    host: run.host,
    strategy: run.strategy,
    scores: run.scores,
    duration_ms: run.ms,
  });
  if (error) console.warn("[leads] audit_runs insert failed:", error.message);
}
