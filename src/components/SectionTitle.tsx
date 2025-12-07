import type { ReactNode } from "react";

interface SectionTitleProps {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
}

export function SectionTitle({ title, eyebrow, children }: SectionTitleProps) {
  return (
    <section className="space-y-2">
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
        {title}
      </h1>
      {children ? (
        <div className="text-sm text-zinc-300 sm:text-base">{children}</div>
      ) : null}
    </section>
  );
}
