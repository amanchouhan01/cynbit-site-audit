"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { AuditResult, Strategy } from "@/lib/types";
import { CATEGORY_LABELS, type CategoryKey } from "@/lib/types";
import { FindingsList } from "./FindingsList";
import { LeadForm } from "./LeadForm";
import { ScoreRing } from "./ScoreRing";

const STEPS = ["Loading your page", "Running Lighthouse", "Scoring each category", "Ranking the fixes"];
const CATEGORY_ORDER: CategoryKey[] = ["performance", "accessibility", "best-practices", "seo"];

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: AuditResult };

export function AuditTool() {
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<Strategy>("mobile");
  const [state, setState] = useState<State>({ status: "idle" });
  const [step, setStep] = useState(0);
  const resultsHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.status !== "loading") return;
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 7000);
    return () => clearInterval(timer);
  }, [state.status]);

  useEffect(() => {
    if (state.status === "done") resultsHeading.current?.focus();
  }, [state.status]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (state.status === "loading") return;
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, strategy }),
        signal: AbortSignal.timeout(65_000),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error ?? "Something went wrong. Please try again.");
      setState({ status: "done", result: body as AuditResult });
    } catch (err) {
      const timedOut = err instanceof DOMException && err.name === "TimeoutError";
      setState({
        status: "error",
        message: timedOut
          ? "That took longer than a minute. Try again, or test a lighter page."
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  const loading = state.status === "loading";

  return (
    <section aria-labelledby="audit-heading" className="mx-auto w-full max-w-4xl px-4">
      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 id="audit-heading" className="sr-only">
          Run an audit
        </h2>
        <label htmlFor="url" className="block text-sm font-medium text-slate-800">
          Website address
        </label>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row">
          <input
            id="url"
            name="url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="yourcompany.com"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-describedby="url-hint"
            className="w-full flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-base"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Auditing…" : "Run free audit"}
          </button>
        </div>
        <p id="url-hint" className="mt-2 text-xs text-slate-500">
          Public pages only. Takes 20 to 40 seconds.
        </p>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-slate-800">Test as</legend>
          <div className="mt-2 inline-flex rounded-lg border border-slate-300 p-0.5">
            {(["mobile", "desktop"] as const).map((s) => (
              <label
                key={s}
                className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium capitalize has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-600 ${
                  strategy === s ? "bg-brand-600 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <input
                  type="radio"
                  name="strategy"
                  value={s}
                  checked={strategy === s}
                  onChange={() => setStrategy(s)}
                  className="sr-only"
                />
                {s}
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      <div aria-live="polite" className="mt-6">
        {loading && (
          <div role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <div
              className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600 motion-reduce:animate-none"
              aria-hidden="true"
            />
            <p className="mt-4 font-medium text-slate-900">{STEPS[step]}…</p>
            <p className="mt-1 text-sm text-slate-500">Lighthouse runs on Google's servers, so this can take a moment.</p>
          </div>
        )}

        {state.status === "error" && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900">
            <p className="font-semibold">The audit didn't finish</p>
            <p className="mt-1 text-sm">{state.message}</p>
          </div>
        )}

        {state.status === "done" && <Results result={state.result} headingRef={resultsHeading} />}
      </div>
    </section>
  );
}

function Results({
  result,
  headingRef,
}: {
  result: AuditResult;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 ref={headingRef} tabIndex={-1} className="break-all text-lg font-semibold text-slate-900 outline-none">
          Results for {result.url}
        </h3>
        <p className="text-sm text-slate-500 capitalize">{result.strategy} test</p>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {CATEGORY_ORDER.map((c) => (
            <ScoreRing key={c} label={CATEGORY_LABELS[c]} score={result.scores[c]} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900">Load metrics</h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {result.metrics.map((m) => (
            <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <dt className="text-xs text-slate-500">{m.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900">{m.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900">What to fix first</h3>
        <div className="mt-3">
          <FindingsList findings={result.findings} />
        </div>
      </div>

      <LeadForm result={result} />
    </div>
  );
}
