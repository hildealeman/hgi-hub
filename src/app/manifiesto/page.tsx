import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { SectionTitle } from "@/components/SectionTitle";

export default function ManifiestoPage() {
  return (
    <PageContainer>
      <SectionTitle title="Manifiesto HGI" eyebrow="esto no es otro buzzword deck">
        Human-Grounded Intelligence (HGI) es una capa entre los modelos actuales y la
        idea de AGI. No prometemos conciencia artificial, prometemos sistemas que
        respetan al humano que está del otro lado.
      </SectionTitle>

      <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
        <Card title="HGI como capa intermedia">
          <p>
            Hoy ya tenemos modelos enormes capaces de completar texto, escribir código
            y hacer cosas que hace diez años parecían ciencia ficción. Pero entre eso y
            una AGI confiable hay un hueco enorme: el humano.
          </p>
          <p className="mt-3">
            HGI vive justo ahí: en la capa donde entendemos intención, contexto,
            lenguaje, cultura y límites humanos. No intentamos arreglar el modelo desde
            adentro, sino la relación humano&#x2011;modelo desde afuera.
          </p>
        </Card>

        <Card title="Sin humano entendido, la AGI nace rota" subtle>
          <p>
            Una AGI que no entiende al humano no es súper inteligencia, es solo otra
            máquina optimizando métricas mal diseñadas. Si el sistema no ve el contexto
            social, el lenguaje cotidiano, el bias estructural y las asimetrías de
            poder, cualquier decisión "inteligente" puede ser daño elegante.
          </p>
          <p className="mt-3 text-sm text-zinc-400">
            En corto: si no modelas al humano real, tu AGI es un fanfic caro.
          </p>
        </Card>
      </div>

      <SectionTitle title="Principios HGI" eyebrow="lineas que no queremos cruzar (otra vez)">
        No son mandamientos grabados en piedra, pero sí son filtros para todo lo que
        construyamos encima de HGI.
      </SectionTitle>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Humanos multidimensionales" subtle>
          <p>
            Las personas no son solo "usuarios" ni "segmentos". Tienen historia,
            contradicciones, límites y contextos que cambian. Tratar a la gente como
            métricas planas produce sistemas que funcionan en dashboards y fallan en la
            vida real.
          </p>
        </Card>
        <Card title="El lenguaje es relación" subtle>
          <p>
            El lenguaje no es solo datos para el modelo. Es confianza, negociación,
            conflicto y cooperación. Diseñar prompts, interfaces y flujos sin ver esa
            capa relacional es receta para respuestas técnicamente correctas y
            humanamente inútiles.
          </p>
        </Card>
        <Card title="El bias existe, hay que verlo" subtle>
          <p>
            Fingir que no hay sesgos no los borra; los oculta. HGI parte de admitir que
            hay asimetrías y estereotipos incrustados en datos, modelos y equipos.
            Nombrar el bias es el primer paso; el segundo es diseñar alrededor, no
            encima.
          </p>
        </Card>
        <Card title="Intención &gt; instrucción" subtle>
          <p>
            No basta con entender la instrucción literal del prompt. Hay que leer la
            intención detrás: qué está tratando de resolver la persona, desde qué
            contexto, con qué riesgo. Un gran modelo sin lectura de intención es como
            un becario muy rápido pero cero crítico.
          </p>
        </Card>
        <Card title="No asumir, preguntar" subtle>
          <p>
            Antes de rellenar huecos con supuestos elegantes, preferimos preguntar.
            Pedir aclaraciones, ofrecer opciones, mostrar límites. Un sistema que nunca
            pregunta probablemente está inventando cosas sin decirte.
          </p>
        </Card>
        <Card title="Comunidad &gt; héroes" subtle>
          <p>
            No estamos buscando al genio solitario que "resuelva" la AGI. HGI es un
            esfuerzo de comunidad: devs, investigadores, educadores y gente curiosa que
            construye y critica en voz alta.
          </p>
        </Card>
      </div>

      <Card title="Si llegaste hasta acá&#x2026;" subtle>
        <p>
          Si llegaste leyendo hasta acá, ya estás más profundo que el 90% del hype de
          LinkedIn. Bienvenido. Aquí la idea no es impresionar al timeline, sino
          construir cosas que no se rompan cuando las usa gente real.
        </p>
      </Card>
    </PageContainer>
  );
}
