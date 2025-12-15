"use client";

import Link from "next/link";
import Image from "next/image";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { SectionTitle } from "@/components/SectionTitle";
import { QueEsHGICard } from "@/components/QueEsHGIDiscussion";
import { TopicDiscussionCard } from "@/components/TopicDiscussionCard";

/**
 * LANDING PAGE — HGI HUB (Actualizada)
 * Esta versión incluye:
 * – Tarjetas 100% clickables
 * – Conexión futura a foros por sección
 * – Navegación hacia manifiesto, whitepaper, prompt101, comunidad
 * – Estilo editorial, oscuro y con intención HGI
 */

export default function Home() {
  return (
    <PageContainer>
      {/* HERO */}
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

          <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl leading-tight">
            Una ruta humana hacia la AGI.
          </h1>

          <p className="max-w-xl text-base text-zinc-300 leading-relaxed">
            Si estás harto de puro humo con IA, este lugar es para ti.  
            HGI Hub es el espacio donde tomamos en serio al humano: su contexto,
            su lenguaje, su cultura y todo lo que los slides suelen ignorar.
          </p>

          {/* CTA BUTTONS */}
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
              Prompt Engineering 101
            </Link>
            <Link
              href="/comunidad"
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-100 transition-colors hover:border-zinc-500 hover:bg-zinc-900/60"
            >
              Comunidad HGI
            </Link>
            <Link
              href="/whitepaper/hgi-chamber"
              className="rounded-full border border-indigo-700 px-4 py-2 text-sm text-indigo-200 transition-colors hover:bg-indigo-900/40 hover:border-indigo-500"
            >
              Conversación en vivo
            </Link>
          </div>

          <p className="text-xs text-zinc-500">
            No prometemos soluciones mágicas.  
            Prometemos rigor, contexto humano y un poco de carrilla sana.
          </p>
        </div>

        {/* Tarjetas laterales */}
        <div className="space-y-4">
          <QueEsHGICard />

          <TopicDiscussionCard
            slug="home-por-que-importa"
            cardTitle="¿Por qué importa?"
            cardEyebrow="poner al humano al centro"
            cardSummary="Razones concretas de por qué HGI no es otra buzzword y sí cambia cómo usamos modelos."
            modalTitle="¿Por qué importa HGI?"
            modalIntro="Este foro es para discutir por qué la intención humana, el contexto y el bias son más importantes que cualquier slide futurista."
          >
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Porque sin entender intención, cualquier modelo parece más tonto.</li>
              <li>Porque el lenguaje no es solo texto: es historia, contexto y relación.</li>
              <li>Ignorar bias no lo elimina; lo esconde bajo la alfombra.</li>
              <li>La AGI sin humanos al centro es ciencia ficción barata.</li>
            </ul>
          </TopicDiscussionCard>
        </div>
      </section>

      {/* GRID PRINCIPAL DE TARJETAS */}
      <section className="grid gap-4 md:grid-cols-3 mt-12">
        {/* MANIFIESTO */}
        <TopicDiscussionCard
          slug="manifiesto"
          cardTitle="Manifiesto"
          cardEyebrow="mapa conceptual HGI"
          cardSummary="Principios y límites para hablar de AGI desde lo humano."
          modalTitle="Manifiesto HGI"
          modalIntro="Discusión de los principios base, límites y acuerdos para no perder el piso hablando de AGI."
        >
          <p>
            El mapa conceptual de HGI: principios, límites y acuerdos básicos para no perder el piso.
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            Si terminas el manifiesto, oficialmente ya no eres parte del hype superficial.
          </p>
        </TopicDiscussionCard>

        {/* PROMPT 101 */}
        <TopicDiscussionCard
          slug="prompt-101"
          cardTitle="Prompt Engineering 101"
          cardEyebrow="versión HGI"
          cardSummary="Cómo hablar con modelos de forma adulta, contextual y seria."
          modalTitle="Prompt Engineering 101"
          modalIntro="Foro dedicado a cómo pedimos cosas a modelos y por qué importa el contexto, rol y consecuencia."
        >
          <p>
            Guía sin humo para hablar con modelos desde el contexto humano real, no desde frases vacías de internet.
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            Spoiler: “haz magia con mi código” no es un prompt.
          </p>
        </TopicDiscussionCard>

        {/* COMUNIDAD */}
        <TopicDiscussionCard
          slug="comunidad"
          cardTitle="Comunidad"
          cardEyebrow="beta humana"
          cardSummary="La banda que construye, critica y define HGI."
          modalTitle="Comunidad HGI"
          modalIntro="Coordinación, ideas, propuestas y visión compartida sin culto a la personalidad."
        >
          <p>
            Gente probando, construyendo y mejorando HGI desde sus trincheras.
          </p>
          <p className="mt-2 text-xs text-zinc-400">
            Aquí nadie es héroe solitario. Aquí compartimos.
          </p>
        </TopicDiscussionCard>
      </section>

      {/* FRASE FINAL */}
      <SectionTitle title="HGI en una frase" eyebrow="resumen rudo">
        HGI es la disciplina que toma en serio a la persona frente al modelo:
        su idioma, su cultura, sus límites y sus sesgos. Todo lo demás son features.
      </SectionTitle>
    </PageContainer>
  );
}
