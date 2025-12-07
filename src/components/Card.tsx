import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  subtle?: boolean;
}

export function Card({ title, children, subtle }: CardProps) {
  return (
    <article
      className={`rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 ${
        subtle
          ? "border-zinc-800/80 bg-zinc-900/60"
          : "border-zinc-800 bg-zinc-900/80 shadow-[0_0_0_1px_rgba(24,24,27,0.7)]"
      }`}
    >
      {title ? (
        <h2 className="mb-2 text-base font-semibold tracking-tight text-zinc-50 sm:text-lg">
          {title}
        </h2>
      ) : null}
      <div className="text-sm leading-relaxed text-zinc-300 sm:text-[15px]">
        {children}
      </div>
    </article>
  );
}
