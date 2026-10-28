"use client";

import { FormEvent, useState } from "react";
import type { AuditResult } from "@/lib/types";

type Status = "idle" | "sending" | "sent" | "error";

export function LeadForm({ result }: { result: AuditResult }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          name: (form.get("name") as string) || undefined,
          companySite: form.get("companySite"),
          url: result.url,
          strategy: result.strategy,
          scores: result.scores,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Something went wrong.");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
        <p className="font-semibold">Got it.</p>
        <p className="mt-1 text-sm">
          Someone from the Cynbit team will email you a short plan for fixing the issues above.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h3 className="text-lg font-semibold text-slate-900">Want a developer to walk you through this?</h3>
      <p className="mt-1 text-sm text-slate-600">
        Leave your email and we'll send a short written plan covering the fixes, in order of effort.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-800">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base"
          />
        </label>
        <label className="block text-sm font-medium text-slate-800">
          Name <span className="font-normal text-slate-500">(optional)</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base"
          />
        </label>
      </div>

      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Leave this empty
          <input name="companySite" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {status === "error" && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-4 rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send me the plan"}
      </button>
      <p className="mt-3 text-xs text-slate-500">We only use your email to reply about this audit.</p>
    </form>
  );
}
