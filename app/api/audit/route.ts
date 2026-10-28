import { NextResponse } from "next/server";
import { logRun } from "@/lib/leads";
import { AuditError, runAudit } from "@/lib/psi";
import { allow, clientIp } from "@/lib/rate-limit";
import { auditSchema, normalizeUrl } from "@/lib/validation";

// Lighthouse runs can take 20-40s. Vercel needs this to allow it.
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!allow(`audit:${clientIp(req)}`, 5)) {
    return NextResponse.json(
      { error: "You've run a few audits already. Please wait about ten minutes and try again." },
      { status: 429 },
    );
  }

  const parsed = auditSchema.safeParse(await req.json().catch(() => null));
  const url = parsed.success ? normalizeUrl(parsed.data.url) : null;
  if (!parsed.success || !url) {
    return NextResponse.json({ error: "Enter a public website address, like example.com." }, { status: 400 });
  }

  const started = Date.now();
  try {
    const result = await runAudit(url, parsed.data.strategy);
    await logRun({
      host: new URL(result.url).hostname,
      strategy: result.strategy,
      scores: result.scores,
      ms: Date.now() - started,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AuditError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[audit] unexpected failure", err);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
  }
}
