import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { SectionTitle } from "@/components/SectionTitle";

export default function Prompt101Page() {
  return (
    <PageContainer>
      <SectionTitle
        title="Prompt Engineering 101 HGI"
        eyebrow="no, no es solo decirle 'sé creativo'"
      >
        Esta guía es para hablar con modelos como adulto funcional, no como post
        motivacional. No se trata de "domar" a la IA, sino de diseñar conversaciones
        claras, honestas y aterrizadas al contexto humano.
      </SectionTitle>

      <Card title="Reglas básicas" subtle>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>
            Sé explícito con el rol del modelo. No digas "ayúdame", di qué tipo de
            ayuda esperas.
          </li>
          <li>
            Da contexto mínimo vital: quién eres, para quién es la salida y qué
            restricciones hay.
          </li>
          <li>
            Pide formato de salida claro (lista, tabla, pasos) para no pelearte después
            con la edición.
          </li>
          <li>
            Rompe problemas grandes en pasos. "Resuélvelo todo" es pedir magia.
          </li>
          <li>
            Di qué NO quieres que pase (alucinar datos, sonar genérico, ignorar
            limitaciones, etc.).
          </li>
          <li>
            Itera: un buen prompt casi nunca sale a la primera. Ajustar es parte del
            juego, no fracaso.
          </li>
        </ol>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Ejemplo 1: prompt vago">
          <p className="font-mono text-sm text-zinc-300">
            "haz magia con mi código"
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Bro&#x2026; no. El modelo no es mentalista, solo estadística con esteroides.
          </p>
        </Card>
        <Card title="Ejemplo 1: versión HGI" subtle>
          <p className="font-mono text-sm text-zinc-300">
            "Actúa como revisor de código senior en TypeScript. Te voy a pegar un
            archivo y quiero que:
            <br />
            1) señales posibles bugs,
            <br />
            2) comentes problemas de legibilidad,
            <br />
            3) propongas máximo 3 mejoras concretas.
            <br />
            No reescribas todo el archivo, solo señala fragmentos críticos."
          </p>
        </Card>

        <Card title="Ejemplo 2: prompt sin contexto">
          <p className="font-mono text-sm text-zinc-300">
            "explícame HGI en sencillo"
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            ¿Sencillo para quién? ¿Para dev junior, para comité ético, para tu tía?
            Sin contexto, la respuesta va a ser genérica nivel folleto corporativo.
          </p>
        </Card>
        <Card title="Ejemplo 2: versión HGI" subtle>
          <p className="font-mono text-sm text-zinc-300">
            "Explícame Human-Grounded Intelligence para una persona que programa pero
            no es experta en IA. Usa ejemplos cercanos a desarrollo web. Máximo 4
            párrafos y luego una lista de 3 ideas clave. No uses frases tipo 'revolución
            tecnológica' ni palabras vacías como 'innovador'."
          </p>
        </Card>
      </div>

      <Card title="Checklist rápido antes de mandar un prompt" subtle>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>¿Dijiste quién eres y qué necesitas realmente?</li>
          <li>¿Aclaraste para quién es la salida?</li>
          <li>¿Especificaste formato y límites (longitud, tono, idioma)?</li>
          <li>¿Marcaste cosas que NO quieres que haga el modelo?</li>
          <li>
            ¿Estás listo para iterar o sigues esperando la respuesta perfecta a la
            primera?
          </li>
        </ul>
      </Card>
    </PageContainer>
  );
}
