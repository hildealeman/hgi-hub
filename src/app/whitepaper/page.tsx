import { PageContainer } from "@/components/PageContainer";
import { SectionTitle } from "@/components/SectionTitle";
import { Card } from "@/components/Card";

interface WhitepaperSection {
  id: string;
  titulo: string;
  resumen: string;
}

const secciones: WhitepaperSection[] = [
  {
    id: "introduccion",
    titulo: "Introducción",
    resumen:
      "Por qué estamos hablando de HGI ahora, qué problema viene a nombrar y cómo se conecta con la conversación actual sobre IA.",
  },
  {
    id: "problema",
    titulo: "Problema",
    resumen:
      "El gap entre modelos potentes y sistemas realmente útiles para personas reales: desalineación con intención humana, contexto y poder.",
  },
  {
    id: "estado-del-arte",
    titulo: "Estado del arte",
    resumen:
      "Qué ya se ha dicho desde IA, HCI, ética, lingüística y estudios de tecnología sobre estas tensiones, y dónde sigue habiendo huecos.",
  },
  {
    id: "fundamentos-humanos",
    titulo: "Fundamentos humanos",
    resumen:
      "Cómo entendemos a las personas en HGI: no como inputs ruidosos, sino como agentes con historia, límites, emociones y contextos múltiples.",
  },
  {
    id: "fundamentos-linguisticos",
    titulo: "Fundamentos lingüísticos",
    resumen:
      "Por qué el lenguaje no es solo corpus: pragmática, contexto, implicaturas, registro, tono y cómo eso pega directo en el diseño de prompts.",
  },
  {
    id: "etica",
    titulo: "Ética",
    resumen:
      "Qué riesgos vemos si ignoramos HGI: refuerzo de desigualdades, automatización de sesgos y decisiones opacas sobre gente que no puede apelar.",
  },
  {
    id: "arquitectura-hgi",
    titulo: "Arquitectura HGI",
    resumen:
      "Componentes, capas y patrones para integrar HGI en sistemas: desde captura de intención hasta feedback de comunidad.",
  },
  {
    id: "hgi-a-agi",
    titulo: "HGI → AGI",
    resumen:
      "Cómo una práctica seria de HGI puede servir de puente hacia discusiones menos fumadas sobre AGI, con humanos al centro desde el diseño.",
  },
];

export default function WhitepaperPage() {
  return (
    <PageContainer>
      <SectionTitle
        title="Whitepaper HGI v0.1"
        eyebrow="estructura lista, hype no incluido"
      >
        Esta es la columna vertebral del whitepaper de HGI Hub. El contenido aún es
        placeholder, pero la estructura ya está lista para migrar a datos dinámicos y
        versiones futuras.
      </SectionTitle>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {secciones.map((sec) => (
          <Card key={sec.id} title={sec.titulo} subtle>
            <p className="text-sm text-zinc-300">{sec.resumen}</p>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
