import { NextResponse } from "next/server";
import { saveLead } from "@/lib/leads";
import { allow, clientIp } from "@/lib/rate-limit";
import { leadSchema } from "@/lib/validation";

export async function POST(req: Request) {
  if (!allow(`lead:${clientIp(req)}`, 5)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const parsed = leadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const { companySite, ...lead } = parsed.data;
  if (companySite) return NextResponse.json({ ok: true }); // bot: pretend it worked

  try {
    await saveLead(lead);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lead] save failed", err);
    return NextResponse.json({ error: "We couldn't save that. Please try again." }, { status: 502 });
  }
}
