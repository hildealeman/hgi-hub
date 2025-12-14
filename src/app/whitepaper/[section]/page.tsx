import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { SectionTitle } from "@/components/SectionTitle";
import { Card } from "@/components/Card";
import { ThreadDiscussion } from "@/components/ThreadDiscussion";
import { getWhitepaperSectionMetaBySlug } from "@/lib/whitepaperSections";
import { getWhitepaperSectionBySlug, whitepaperSections } from "@/lib/whitepaperContent";
import { getWhitepaperForumSeed } from "@/lib/whitepaperForumSeeds";

function renderParagraphs(text: string) {
  const blocks = text.split(/\n\n+/g);
  return blocks.map((block, idx) => (
    <p key={idx} className="text-base leading-relaxed text-zinc-200 sm:text-lg">
      {block}
    </p>
  ));
}

export async function generateStaticParams(): Promise<Array<{ section: string }>> {
  return whitepaperSections.map((s) => ({ section: s.slug }));
}

export default async function WhitepaperSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const sectionSlug = decodeURIComponent(params.section).trim().toLowerCase();

  const content = getWhitepaperSectionBySlug(sectionSlug);
  const meta = await getWhitepaperSectionMetaBySlug(sectionSlug);

  if (!content) {
    return (
      <PageContainer>
        <SectionTitle title="Sección no encontrada" eyebrow="whitepaper">
          <div className="space-y-2">
            <p className="text-sm text-zinc-300">
              Slug solicitado: <span className="font-medium text-zinc-100">{sectionSlug}</span>
            </p>
            <Link
              href="/whitepaper"
              className="text-xs text-zinc-300 underline underline-offset-4 hover:text-zinc-50"
            >
              ← Volver al whitepaper completo
            </Link>
          </div>
        </SectionTitle>

        <Card title="Slugs disponibles" subtle>
          <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-300">
            {whitepaperSections
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((s) => (
                <li key={s.slug}>
                  <Link href={`/whitepaper/${s.slug}`} className="underline underline-offset-4 hover:text-zinc-50">
                    {s.slug}
                  </Link>
                </li>
              ))}
          </ul>
        </Card>
      </PageContainer>
    );
  }

  const resolvedMeta =
    meta ??
    ({
      slug: content.slug,
      title: content.title,
      description: content.description,
    } as const);

  const forumSeed = getWhitepaperForumSeed(content.slug);

  return (
    <PageContainer>
      <SectionTitle title={resolvedMeta.title} eyebrow="foro por sección">
        <div className="space-y-2">
          <p className="text-sm text-zinc-300">{resolvedMeta.description}</p>
          <Link
            href="/whitepaper"
            className="text-xs text-zinc-300 underline underline-offset-4 hover:text-zinc-50"
          >
            ← Volver al whitepaper completo
          </Link>
        </div>
      </SectionTitle>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-4">
          <Card title="Texto de la sección" subtle>
            <div className="space-y-4 whitespace-pre-wrap">
              {renderParagraphs(content.content)}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {forumSeed && (
            <Card title={forumSeed.openingPostTitle} subtle>
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-zinc-200">{forumSeed.openingPostBody}</p>
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Preguntas guía</p>
                  <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-300">
                    {forumSeed.guidingQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          <ThreadDiscussion section={content.slug} sectionTitle={resolvedMeta.title} />

          <Card title="Notas" subtle>
            <p className="text-sm text-zinc-300">
              Este foro guarda comentarios/votos en JSON bajo <code className="text-zinc-100">data/threads/{content.slug}.json</code>.
              En algunos deploys (serverless) el filesystem puede ser read-only; en ese caso el API regresa error controlado.
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
