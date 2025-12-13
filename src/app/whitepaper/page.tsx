import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { SectionTitle } from "@/components/SectionTitle";
import { Card } from "@/components/Card";
import {
  whitepaperSections,
  whitepaperSubtitle,
  whitepaperTagline,
  whitepaperTitle,
  whitepaperVersion,
} from "@/lib/whitepaperContent";
import { getWhitepaperSectionsMeta } from "@/lib/whitepaperSections";

function renderParagraphs(text: string) {
  const blocks = text.split(/\n\n+/g);
  return blocks.map((block, idx) => {
    return (
      <p key={idx} className="text-base leading-relaxed text-zinc-200 sm:text-lg">
        {block}
      </p>
    );
  });
}

export default async function WhitepaperPage() {
  const sectionsMeta = await getWhitepaperSectionsMeta();

  return (
    <PageContainer>
      <SectionTitle title={whitepaperTitle} eyebrow="whitepaper fundacional">
        <div className="space-y-2">
          <p className="text-sm text-zinc-200 sm:text-base">{whitepaperSubtitle}</p>
          <p className="text-sm text-zinc-300">{whitepaperVersion}</p>
          <p className="text-sm text-zinc-400">{whitepaperTagline}</p>
        </div>
      </SectionTitle>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card title="Secciones" subtle>
            <p className="text-sm text-zinc-300">
              Cada sección tiene su mini-foro. Puedes leer aquí el documento completo y
              abrir discusión por sección.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {sectionsMeta.map((sec) => (
                <Link
                  key={sec.slug}
                  href={`/whitepaper/${sec.slug}`}
                  className="block rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 transition-colors hover:border-zinc-600"
                >
                  <p className="text-sm font-semibold text-zinc-50">{sec.title}</p>
                  <p className="mt-1 text-xs text-zinc-400">{sec.description}</p>
                  <p className="mt-3 text-[11px] text-zinc-500">Abrir foro →</p>
                </Link>
              ))}
            </div>
          </Card>

          <article className="space-y-8">
            {whitepaperSections
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((sec) => (
                <section
                  key={sec.slug}
                  id={sec.slug}
                  className="scroll-mt-24 space-y-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
                      {sec.title}
                    </h2>
                    <Link
                      href={`/whitepaper/${sec.slug}`}
                      className="text-xs text-zinc-300 underline underline-offset-4 hover:text-zinc-50"
                    >
                      Abrir foro de esta sección
                    </Link>
                  </div>
                  <div className="space-y-4 whitespace-pre-wrap">{renderParagraphs(sec.content)}</div>
                </section>
              ))}
          </article>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Card title="Índice" subtle>
              <nav className="space-y-2">
                {whitepaperSections
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((sec) => (
                    <a
                      key={sec.slug}
                      href={`#${sec.slug}`}
                      className="block text-xs text-zinc-300 hover:text-zinc-50"
                    >
                      {sec.title}
                    </a>
                  ))}
              </nav>
            </Card>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
