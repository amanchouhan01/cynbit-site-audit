"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Something broke on our end</h1>
      <p className="mt-2 text-slate-600">Reload the page and try again.</p>
      <button onClick={reset} className="mt-5 rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white">
        Try again
      </button>
    </div>
  );
}
