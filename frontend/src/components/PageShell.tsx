"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function PageShell({ title, subtitle, children }: PageShellProps) {
  const router = useRouter();

  return (
    <section className="min-h-screen p-8 page-shell-enter">
      <button
        type="button"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:-translate-x-0.5 hover:text-slate-900"
        onClick={() => router.back()}
      >
        <span aria-hidden="true">←</span> Back
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
      </div>

      {children}

      <style jsx global>{`
        @keyframes pageShellEnter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-shell-enter {
          animation: pageShellEnter 0.28s ease-out;
        }
      `}</style>
    </section>
  );
}