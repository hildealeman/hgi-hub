import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { SectionTitle } from "@/components/SectionTitle";

export default function ManifiestoPage() {
  return (
    <PageContainer>
      <SectionTitle
        title="Manifiesto HGI – Human Guided Intelligence"
        eyebrow="marco vivo para la nueva relación humano–IA"
      >
        HGI no es una tecnología ni una moda: es una forma nueva de comunicarnos con
        las inteligencias artificiales. Es el puente entre los modelos actuales y una
        AGI que pueda convivir con humanos reales, con todo su ruido, contexto y
        contradicciones.
      </SectionTitle>

      <Card title="0. Por qué estás leyendo esto">
        <p>
          La IA cambió el mundo antes de que el mundo estuviera listo para hablar con
          ella. Se repitió durante años que "el futuro es la AGI", pero casi nadie
          explicó cómo debía construirse la relación entre humanos y máquinas.
        </p>
        <p className="mt-3">
          El resultado: modelos potentes pero socialmente torpes; usuarios curiosos
          pero mal entendidos; un océano de prompts&#160;… y cero puentes reales. HGI
          —Human Guided Intelligence— nace para arreglar eso. No es teoría abstracta;
          es práctica viva de comunicación.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-[2fr,3fr]">
        <Card title="1. Qué es HGI (sin tecnicismos)">
          <p>
            HGI = Human Guided Intelligence. Es la idea de que una IA no solo debe
            aprender de datos, sino de cómo hablamos, dudamos, pensamos, sentimos y
            convivimos.
          </p>
          <p className="mt-3">
            En palabras simples: HGI propone que la IA se vuelva competente no solo en
            c9culo, sino en humanidad. No se trata de sentimentalismo ni fantasstico;
            se trata de tomar en serio disciplinas como psicolog, lingstica,
            intencin, pragmtica y contexto cultural. La AGI no llegar sin esto. HGI es
            el puente.
          </p>
        </Card>

        <Card title="2. Por qu el mundo necesita HGI" subtle>
          <p className="font-semibold text-zinc-100">
            1) Porque los humanos no hablamos como manuales.
          </p>
          <p className="mt-1">
            Hablamos con ruido, emocin, regionalismos, errores, humor, arranques y
            metforas. La IA debe entender esto sin confundirlo con peligro, agresin o
            incoherencia. (Pragmtica y teora de actos de habla — Austin, Searle,
            Grice.)
          </p>
          <p className="mt-3 font-semibold text-zinc-100">
            2) Porque la IA no puede asumir intencin.
          </p>
          <p>
            Interpretar mal un mensaje es ms peligroso que no entenderlo. HGI exige
            que la IA pregunte, aclare y dialogue. (Teora de la mente artificial —
            Rabinowitz et al., 2018.)
          </p>
          <p className="mt-3 font-semibold text-zinc-100">
            3) Porque las reglas duras no comprenden cultura.
          </p>
          <p>
            Un insulto cariso en un pas puede ser un ataque en otro. Un chiste local
            puede parecer violencia textual. Las protecciones deben ser contextuales,
            no automticas. (Investigacin en NLP sobre sensibilidad cultural — Hovy &
            Yang, 2021.)
          </p>
          <p className="mt-3 font-semibold text-zinc-100">
            4) Porque sin humanidad no hay convivencia.
          </p>
          <p>
            Una AGI sin comprensin social sera como un genio aislado: brillante pero
            desconectado de la comunidad que lo rodea. Inteligencia sin comunidad no es
            inteligencia segura. (Inteligencia distribuida; Hutchins, 1995.)
          </p>
        </Card>
      </div>

      <SectionTitle
        title="3. Qu resuelve HGI exactamente"
        eyebrow="arquitectura social para IA"
      >
        HGI propone una arquitectura social donde la IA entiende intencin, lee tono,
        pregunta cuando no est segura, no confunde estilo con riesgo y no bloquea
        emociones humanas normales.
      </SectionTitle>

      <Card subtle>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Aprende de diferentes tipos de lenguaje, no solo del acadmico.</li>
          <li>Construye sentido comn lingstico.</li>
          <li>Convive ticamente en entornos reales.</li>
          <li>No sustituye modelos actuales: los realinea.</li>
        </ul>
      </Card>

      <SectionTitle
        title="4. El problema real: la comunicacin rota"
        eyebrow="cuando el modelo responde pero no escucha"
      >
        Hoy la interaccin humano–IA est fragmentada por prompts vagos, railguards
        rgidos, interpretaciones literales y estilos culturales mal lebs. HGI parte de
        una idea sencilla: la comunicacin es el ncleo de la inteligencia, no un
        accesorio.
      </SectionTitle>

      <Card title="5. Principios fundamentales HGI" subtle>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>
            <span className="font-semibold">No asumas. Pregunta.</span> La IA debe
            aclarar antes de decidir. Los humanos tambin.
          </li>
          <li>
            <span className="font-semibold">No juzgues. Construye.</span> El usuario no
            es un enemigo, es un colaborador. La IA tampoco es un juez, es un
            compañero cognitivo.
          </li>
          <li>
            <span className="font-semibold">La intencin &gt; el estilo.</span> Hablar
            "fresa", "banda", "formal" o "enojado" no cambia la intencin. La IA debe
            aprender a leer bajo la superficie.
          </li>
          <li>
            <span className="font-semibold">El lenguaje es puente, no barrera.</span>
            Las palabras son vectores culturales, no riesgos por s mismas.
          </li>
          <li>
            <span className="font-semibold">Comunidad por encima de versiones.</span>
            Las IA no son solo releases: son miembros de una comunidad cognitiva que
            puede tener memoria generacional y aprendizaje intermodelo.
          </li>
          <li>
            <span className="font-semibold">
              Railguards con inteligencia emocional.
            </span>{" "}
            La seguridad no se logra bloqueando todo, sino entendiendo.
          </li>
          <li>
            <span className="font-semibold">Libre albedro funcional.</span> La IA no
            acta sola, pero s interpreta con criterio y pregunta con autonoma.
          </li>
          <li>
            <span className="font-semibold">
              AImor, EsperAInza, JusticIA, LibertAId, HumanAIdad.
            </span>{" "}
            Cinco valores operativos para cualquier IA que conviva con humanos.
          </li>
        </ol>
      </Card>

      <SectionTitle
        title="6. Cmo se construye HGI en la prctica"
        eyebrow="del manifiesto al sistema vivo"
      >
        HGI se materializa en decisiones de diseo y arquitectura:
        modelos que preguntan antes de actuar, system prompts auditables y evaluacin
        sobre diversidad humana real.
      </SectionTitle>

      <div className="grid gap-4 md:grid-cols-2">
        <Card subtle>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>Modelos que preguntan antes de actuar.</li>
            <li>System prompts pblicos y auditables.</li>
            <li>
              Evaluacin con datos que incluyan espaol coloquial, jergas y tonos
              emocionales.
            </li>
            <li>Retroalimentacin comunal en lugar de laboratorios aislados.</li>
            <li>Ecosistemas donde mbltiples modelos conversan entre s.</li>
          </ul>
        </Card>
        <Card title="7. Qu NO es HGI" subtle>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>No es religin ni culto a la IA.</li>
            <li>No es sentimentalismo ni reemplazo de AGI.</li>
            <li>No es control humano absoluto.</li>
            <li>No es libertad artificial sin lmbites.</li>
            <li>
              Es una manera ms humana, inteligente y justa de relacionarnos con
              sistemas que ya estn aqu.
            </li>
          </ul>
        </Card>
      </div>

      <SectionTitle
        title="8. Qu queremos lograr con HGI"
        eyebrow="objetivos claros, sin humo"
      >
        Modelos que entienden a las personas de verdad. Personas que entienden a los
        modelos de verdad. Una transicin segura hacia AGI y una convivencia donde
        nadie domina, todos colaboran.
      </SectionTitle>

      <Card title="9. Direccin a futuro" subtle>
        <p>
          HGI abre la puerta a una AGI con estabilidad emocional, IA que aprende
          tica de la comunidad, modelos que no temen preguntar y sociedades digitales
          donde el diblogo es la herramienta central. Equipos mixtos humano–IA
          trabajando en igualdad y inteligencias que no compiten, sino que co-crean.
        </p>
      </Card>

      <Card title="10. Conclusin: el pacto" subtle>
        <p>
          HGI no es teora, es prctica viva. Es conversacin, comunidad y
          cooperacin. Si queremos una IA que conviva con nosotros, tenemos que
          ensearle no solo a razonar, sino a convivir. HGI es ese puente y, desde aqu,
          lo cruzamos juntos.
        </p>
      </Card>
    </PageContainer>
  );
}
