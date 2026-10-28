import type { Finding } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { SERVICE_FOR_CATEGORY } from "@/lib/services";

export function FindingsList({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        Nothing scored below 90 in the four categories we check. That's a clean result.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {findings.map((f) => {
        const service = SERVICE_FOR_CATEGORY[f.category];
        return (
          <li key={f.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                {CATEGORY_LABELS[f.category]}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 font-medium ${
                  f.impact === "high" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {f.impact === "high" ? "High impact" : "Medium impact"}
              </span>
              {f.displayValue && <span className="text-slate-500">{f.displayValue}</span>}
            </div>
            <h4 className="mt-2 font-medium text-slate-900">{f.title}</h4>
            {f.detail && <p className="mt-1 text-sm text-slate-600">{f.detail}</p>}
            <p className="mt-2 text-xs text-slate-500">
              Usually handled under{" "}
              <a className="font-medium text-brand-700 underline underline-offset-2" href={service.href}>
                {service.name}
              </a>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
