import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Website Audit | Cynbit Technologies",
  description:
    "Paste your URL and get Lighthouse scores for speed, accessibility, best practices and SEO, plus the fixes that matter most.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <a href="https://www.cynbit.in" className="text-lg font-bold tracking-tight text-slate-900">
              Cynbit<span className="text-brand-600">.</span>
            </a>
            <nav aria-label="Main" className="flex items-center gap-5 text-sm font-medium text-slate-700">
              <a href="https://www.cynbit.in/services" className="hover:text-brand-700">Services</a>
              <a href="https://www.cynbit.in/case-studies" className="hover:text-brand-700">Case studies</a>
              <a
                href="https://www.cynbit.in/contact"
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
              >
                Contact
              </a>
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="mt-20 border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
          <p>Prototype built for the Cynbit Full Stack Developer Intern assessment by Aman Chouhan.</p>
          <p className="mt-1">Scores come from Google PageSpeed Insights (Lighthouse).</p>
        </footer>
      </body>
    </html>
  );
}
