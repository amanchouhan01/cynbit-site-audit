import { AuditTool } from "@/components/AuditTool";

const STEPS = [
  { title: "Paste a URL", body: "Any public page. Your homepage is a good start." },
  { title: "We run Lighthouse", body: "Mobile or desktop, through Google's PageSpeed Insights API." },
  { title: "Get a ranked fix list", body: "Scores, load metrics, and the issues costing you the most." },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-14 text-center sm:pt-20">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Free website audit</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          How fast and findable is your website?
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Get Lighthouse scores for speed, accessibility, best practices and SEO, plus the specific fixes that would
          move them. No sign-up needed to see the results.
        </p>
      </section>

      <AuditTool />

      <section aria-labelledby="how-heading" className="mx-auto mt-20 max-w-4xl px-4">
        <h2 id="how-heading" className="text-2xl font-bold text-slate-900">
          How it works
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-4">
        <div className="rounded-2xl bg-slate-900 p-8 text-white">
          <h2 className="text-2xl font-bold">Found something you'd rather not fix yourself?</h2>
          <p className="mt-2 max-w-2xl text-slate-300">
            Cynbit's team handles technical SEO, cloud performance and custom builds. Tell us what the audit turned up
            and we'll scope the work.
          </p>
          <a
            href="https://www.cynbit.in/contact"
            className="mt-5 inline-block rounded-lg bg-white px-5 py-2.5 font-medium text-slate-900 hover:bg-slate-100"
          >
            Start a discovery call
          </a>
        </div>
      </section>
    </>
  );
}
