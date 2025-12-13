"use client";

import Link from "next/link";
import Image from "next/image";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { SectionTitle } from "@/components/SectionTitle";
import { QueEsHGICard } from "@/components/QueEsHGIDiscussion";
import { TopicDiscussionCard } from "@/components/TopicDiscussionCard";

export default function Home() {
  return (
    <PageContainer>
      <section className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-zinc-800 bg-zinc-950/60">
              <Image
                src="/hgi-logo.png"
                alt="Logo de HGI Hub"
                fill
                sizes="32px"
                className="object-cover"
                priority
              />
            </div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">
              Human-Grounded Intelligence
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            Una ruta humana hacia la AGI.
          </h1>
          <p className="max-w-xl text-sm text-zinc-300 sm:text-base">
            Si estás harto de puro humo con IA, este lugar es para ti. HGI Hub es el
            espacio donde tomamos en serio al humano: su contexto, su lenguaje, su
            cultura y todo lo que los slides suelen ignorar.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/manifiesto"
              className="rounded-full bg-zinc-50 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Leer el manifiesto
            </Link>
            <Link
              href="/whitepaper"
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-900/60"
            >
              Leer el whitepaper
            </Link>
            <Link
              href="/prompt-101"
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-900/60"
            >
              Ver Prompt Engineering 101
            </Link>
            <Link
              href="/comunidad"
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-900/60"
            >
              Unirme a la comunidad
            </Link>
          </div>
          <p className="text-xs text-zinc-500">
            No prometemos soluciones mágicas. Prometemos rigor, contexto humano y un
            poco de carrilla sana en el camino.
          </p>
        </div>
        <div className="space-y-4">
          <QueEsHGICard />
          <TopicDiscussionCard
            slug="home-por-que-importa"
            cardTitle="¿Por qué importa?"
            cardEyebrow="poner al humano al centro"
            cardSummary="Razones concretas de por qué HGI no es otra buzzword y sí cambia cómo usamos modelos."
            modalTitle="¿Por qué importa HGI?"
            modalIntro="Este foro es para discutir por qué la intención humana, el contexto y el bias importan más que cualquier slide de AGI futurista."
          >
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Porque sin entender intención, cualquier modelo parece más tonto.</li>
              <li>
                Porque el lenguaje no es solo texto: es historia, contexto y relación.
              </li>
              <li>
                Porque ignorar bias no lo desaparece; solo lo hace más peligroso.
              </li>
              <li>
                Porque la AGI sin humanos al centro es básicamente ciencia ficción barata.
              </li>
            </ul>
          </TopicDiscussionCard>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <TopicDiscussionCard
          slug="home-manifiesto"
          cardTitle="Manifiesto"
          cardEyebrow="mapa conceptual HGI"
          cardSummary="Principios y límites para hablar de AGI sin volarnos la barda."
          modalTitle="Manifiesto HGI"
          modalIntro="Aquí discutimos el mapa conceptual de HGI: qué sí, qué no, y por qué la base humana importa más que el hype de AGI."
        >
          <p>
            El mapa conceptual de HGI: principios, límites y acuerdos básicos para no
            perder el piso cuando hablemos de AGI.
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            Si llegas al final del manifiesto, estás oficialmente fuera del hype
            superficial.
          </p>
        </TopicDiscussionCard>

        <TopicDiscussionCard
          slug="home-prompt-101"
          cardTitle="Prompt Engineering 101"
          cardEyebrow="versión HGI"
          cardSummary="Cómo hablar con modelos como adulto funcional, no como post motivacional."
          modalTitle="Prompt Engineering 101 (HGI)"
          modalIntro="Este foro es para bajar a tierra cómo pedimos cosas a los modelos: rol, contexto, restricciones y consecuencias."
        >
          <p>
            Guía sin humo para hablar con modelos como adulto funcional, no como post
            motivacional de LinkedIn.
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            Spoiler: "haz magia con mi código" no es un buen prompt.
          </p>
        </TopicDiscussionCard>

        <TopicDiscussionCard
          slug="home-comunidad"
          cardTitle="Comunidad"
          cardEyebrow="beta humana"
          cardSummary="La banda que está probando, criticando y construyendo HGI Hub."
          modalTitle="Comunidad HGI"
          modalIntro="Espacio para coordinar, proponer y tirar ideas sobre cómo debería funcionar esta comunidad sin culto a la personalidad."
        >
          <p>
            Gente construyendo, probando y tirando ideas sin culto a la personalidad.
            Menos héroes solitarios, más banda que comparte.
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            Te apuntas con tu correo, sin dramas. Si te vas, tampoco hacemos drama.
          </p>
        </TopicDiscussionCard>
      </section>

      <SectionTitle title="HGI en una frase" eyebrow="resumen rudo">
        HGI es la disciplina que se toma en serio a la persona que está frente al
        modelo: su idioma, su cultura, sus límites y sus sesgos. Todo lo demás son
        features.
      </SectionTitle>
    </PageContainer>
  );
}
