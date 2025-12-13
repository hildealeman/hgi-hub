import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { SectionTitle } from "@/components/SectionTitle";
import { Card } from "@/components/Card";
import { ThreadDiscussion } from "@/components/ThreadDiscussion";
import { getWhitepaperSectionMetaBySlug } from "@/lib/whitepaperSections";
import { getWhitepaperSectionBySlug } from "@/lib/whitepaperContent";

function renderParagraphs(text: string) {
  const blocks = text.split(/\n\n+/g);
  return blocks.map((block, idx) => (
    <p key={idx} className="text-base leading-relaxed text-zinc-200 sm:text-lg">
      {block}
    </p>
  ));
}

export default async function WhitepaperSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const { section } = params;

  const meta = await getWhitepaperSectionMetaBySlug(section);
  const content = getWhitepaperSectionBySlug(section);

  if (!meta || !content) {
    notFound();
  }

  return (
    <PageContainer>
      <SectionTitle title={meta.title} eyebrow="foro por sección">
        <div className="space-y-2">
          <p className="text-sm text-zinc-300">{meta.description}</p>
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
          <ThreadDiscussion section={meta.slug} sectionTitle={meta.title} />

          <Card title="Notas" subtle>
            <p className="text-sm text-zinc-300">
              Este foro guarda comentarios/votos en JSON bajo <code className="text-zinc-100">data/threads/{meta.slug}.json</code>.
              En algunos deploys (serverless) el filesystem puede ser read-only; en ese caso el API regresa error controlado.
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
