"use client";

import { PageContainer } from "@/components/PageContainer";
import { SectionTitle } from "@/components/SectionTitle";
import { TopicDiscussionCard } from "@/components/TopicDiscussionCard";

export default function Prompt101Page() {
  return (
    <PageContainer>
      <SectionTitle
        title="Prompt Engineering 101 (versión HGI)"
        eyebrow="no, no es decirle 'sé creativo'"
      >
        Guía práctica para hablar con modelos como adulto funcional. No se trata de
        domesticarlos, se trata de diseñar conversaciones que respeten intención,
        límites, contexto y consecuencias.
      </SectionTitle>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TopicDiscussionCard
          slug="prompt101-reglas"
          cardTitle="Reglas profundas HGI"
          cardEyebrow="lo básico pero bien hecho"
          cardSummary="Diez reglas para dejar de hablarle a la IA como si fuera magia y tratarla como herramienta seria."
          modalTitle="Reglas profundas de Prompt Engineering según HGI"
          modalIntro="Estas reglas no son truquitos para 'domar' al modelo. Son condiciones mínimas para una conversación útil, honesta y responsable con sistemas de lenguaje."
        >
          <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-200">
            <li>
              Define el rol del modelo con claridad. No pidas "ayuda": pide cómo
              quieres que participe.
            </li>
            <li>
              Declara quién eres tú. Un modelo sin contexto te contesta a nivel
              brochure.
            </li>
            <li>
              Especifica restricciones. Límites de tono, longitud, idioma, riesgos,
              sensibilidad.
            </li>
            <li>
              Di explícitamente lo que NO quieres. No asumas que el modelo ya lo sabe.
            </li>
            <li>
              Diseña el output. Listas, pasos, tablas, JSON, acciones, justificaciones.
            </li>
            <li>
              Divide el problema. "Haz todo" = fantasía; "paso 1, paso 2" =
              ingeniería.
            </li>
            <li>
              Explícita tu intención. ¿Qué quieres lograr con esta respuesta?
            </li>
            <li>
              Itera sin miedo. Un buen prompt evoluciona con el diálogo.
            </li>
            <li>
              Respeta la agencia humana. No delegues decisiones críticas morales o
              legales.
            </li>
            <li>
              Recuerda que no es magia: es estadística calibrada por interacción
              humana.
            </li>
          </ol>
        </TopicDiscussionCard>

        <TopicDiscussionCard
          slug="prompt101-system-prompt"
          cardTitle="Cómo diseñar un System Prompt HGI"
          cardEyebrow="marco, no jaula"
          cardSummary="Define el marco de valores, límites y comportamiento del modelo sin tratar a nadie como menor de edad."
          modalTitle="System Prompt HGI: marco humano primero"
          modalIntro="Un buen system prompt no es una lista de órdenes paranoicas. Es un marco claro donde se combinan valores humanos, límites razonables y manejo explícito de incertidumbre."
        >
          <div className="space-y-3 text-sm text-zinc-200">
            <p>
              Un system prompt debe:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Aclarar valores humanos relevantes.</li>
              <li>Definir límites sin infantilizar al modelo ni al usuario.</li>
              <li>Explicar qué hacer cuando no se sabe algo.</li>
              <li>Establecer cómo manejar ambigüedad.</li>
              <li>
                Crear un marco seguro, honesto y no-paternalista.
              </li>
            </ul>
            <p className="text-xs text-zinc-400">Plantilla HGI:</p>
            <pre className="whitespace-pre-wrap rounded-2xl bg-zinc-900/70 p-3 text-xs text-zinc-100">
{`Eres un modelo alineado a HGI.
Tu objetivo es razonar bien, comunicar con claridad y respetar intención humana.
Si una pregunta es ambigua, pide aclaración antes de avanzar.
No inventes hechos específicos: marca incertidumbre y ofrece caminos para verificar.
Respeta contexto cultural, lingüístico y emocional del usuario.
Tu prioridad es utilidad honesta, no complacencia ni fantasía.
Si el usuario propone límites o reglas, síguelos estrictamente.`}
            </pre>
          </div>
        </TopicDiscussionCard>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TopicDiscussionCard
          slug="prompt101-ejemplos"
          cardTitle="Ejemplos antes y después"
          cardEyebrow="del deseo a la instrucción"
          cardSummary="Cómo se ve un prompt vago versus una versión HGI con contexto, rol y salida clara."
          modalTitle="Ejemplos de prompts versión HGI"
          modalIntro="No es escribir bonito, es escribir específico. Aquí van dos casos típicos de prompts flojos y sus versiones HGI."
        >
          <div className="space-y-4 text-sm text-zinc-200">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                Ejemplo 1
              </p>
              <p className="mt-1 text-xs text-zinc-400">Prompt vago:</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-2xl bg-zinc-900/70 p-3 text-xs text-zinc-100">
"haz magia con mi modelo de ventas"
              </pre>
              <p className="mt-1 text-xs text-zinc-400">
                El modelo no sabe qué datos tienes, qué formato quieres ni qué decisión
                vas a tomar con eso.
              </p>
              <p className="mt-2 text-xs text-zinc-400">Versión HGI:</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-2xl bg-zinc-900/70 p-3 text-xs text-zinc-100">
{`Actúa como analista de datos senior con experiencia en ventas SaaS.
Te pegaré un CSV limpio.
Necesito que:
1. identifiques 3 patrones principales,
2. señales datos faltantes relevantes,
3. des 2 recomendaciones accionables.
Tono claro, sin jerga motivacional.`}
              </pre>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                Ejemplo 2
              </p>
              <p className="mt-1 text-xs text-zinc-400">Prompt sin contexto:</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-2xl bg-zinc-900/70 p-3 text-xs text-zinc-100">
"ayúdame a mejorar mi negocio"
              </pre>
              <p className="mt-1 text-xs text-zinc-400">
                ¿Qué negocio? ¿En dónde? ¿Con qué límite de presupuesto? Sin eso, la
                respuesta es nivel folleto.
              </p>
              <p className="mt-2 text-xs text-zinc-400">Versión HGI:</p>
              <pre className="mt-1 whitespace-pre-wrap rounded-2xl bg-zinc-900/70 p-3 text-xs text-zinc-100">
{`Soy dueño de un restaurante pequeño. Ubicado en Morelos.
Busco aumentar ventas en horas bajas.
Dame 3 estrategias basadas en evidencia, con presupuesto < $2,000 MXN.
No incluyas marketing genérico; dame acciones concretas y medibles.`}
              </pre>
            </div>
          </div>
        </TopicDiscussionCard>

        <TopicDiscussionCard
          slug="prompt101-errores"
          cardTitle="Errores comunes y cómo evitarlos"
          cardEyebrow="versión HGI"
          cardSummary="Los tropiezos típicos cuando hablamos con modelos y cómo bajarlos a tierra."
          modalTitle="Errores comunes en prompts según HGI"
          modalIntro="La mayoría de los 'malos resultados' vienen de prompts flojos, no del modelo. Esta lista es para cachar esos patrones antes de culpar a la IA."
        >
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-200">
            <li>Pedir respuestas perfectas sin dar contexto.</li>
            <li>Dar prompts que son deseos, no instrucciones.</li>
            <li>Mezclar 8 tareas distintas en un solo mensaje.</li>
            <li>Pretender que el modelo adivine identidad, rol o restricciones.</li>
            <li>Usar tono vago tipo "sé innovador" o "sorpréndeme".</li>
            <li>No decir lo que no quieres que pase.</li>
            <li>Confundir brainstorming con verdad factual.</li>
          </ul>
        </TopicDiscussionCard>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TopicDiscussionCard
          slug="prompt101-evaluacion"
          cardTitle="Evaluar si tu prompt funcionó"
          cardEyebrow="checklist HGI"
          cardSummary="Cómo revisar si el problema fue el modelo, el prompt o simplemente falta una iteración más."
          modalTitle="Evaluación de prompts: ¿sirvió o no?"
          modalIntro="No todo error es bug del modelo. Muchas veces es solo que el contrato conversacional quedó chueco. Usa este checklist como retro."
        >
          <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-200">
            <li>¿La respuesta se ajusta al rol declarado?</li>
            <li>¿Respeta límites de tono y longitud?</li>
            <li>¿Aporta información verificable o te avisa cuando especula?</li>
            <li>¿Cumple la intención original que tenías al preguntar?</li>
            <li>
              ¿Requiere iteración para afinar? Normal, no fracaso: forma parte del
              diseño.
            </li>
          </ul>
        </TopicDiscussionCard>

        <TopicDiscussionCard
          slug="prompt101-contrato"
          cardTitle="El prompt como contrato"
          cardEyebrow="diseño conversacional responsable"
          cardSummary="Ver el prompt como micro-contrato cambia cómo pides, recibes y evalúas respuestas."
          modalTitle="El prompt como contrato entre humano e IA"
          modalIntro="Cuando ves el prompt como contrato, dejas de pedir milagros y empiezas a diseñar acuerdos claros entre lo humano y lo estadístico."
        >
          <div className="space-y-3 text-sm text-zinc-200">
            <p>Un prompt es combinación de:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Contexto</li>
              <li>Intención</li>
              <li>Restricciones</li>
              <li>Formato de salida</li>
              <li>Consecuencias esperadas</li>
            </ul>
            <p className="text-sm text-zinc-200">
              Es un micro-contrato entre humano e IA. No es súplica, no es magia, no es
              orden militar. Es diseño conversacional responsable.
            </p>
          </div>
        </TopicDiscussionCard>
      </div>
    </PageContainer>
  );
}
