import { PageContainer } from "@/components/PageContainer";
import { SectionTitle } from "@/components/SectionTitle";
import { Card } from "@/components/Card";
import type { RoadmapItem } from "@/types";

const roadmap: RoadmapItem[] = [
  {
    id: "fase-0",
    fase: "Fase 0",
    titulo: "Concepto y manifiesto",
    descripcion:
      "Aterrizar HGI como idea clara: manifiesto, principios y lenguaje compartido para no perdernos en buzzwords.",
    estado: "done",
  },
  {
    id: "fase-1",
    fase: "Fase 1",
    titulo: "Infraestructura básica",
    descripcion:
      "Repo, sitio, comunidad inicial y canales para coordinar. Nada de mega plataforma aún, solo cimientos sólidos.",
    estado: "wip",
  },
  {
    id: "fase-2",
    fase: "Fase 2",
    titulo: "Marco académico",
    descripcion:
      "Conectar HGI con literatura seria: lingüística, ciencias cognitivas, HCI, ética, estudios sociales de la tecnología.",
    estado: "planned",
  },
  {
    id: "fase-3",
    fase: "Fase 3",
    titulo: "Herramientas y protocolos",
    descripcion:
      "Definir prácticas, plantillas, patrones y tooling para construir sistemas HGI-ready sin reinventar cada vez.",
    estado: "planned",
  },
  {
    id: "fase-4",
    fase: "Fase 4",
    titulo: "Comunidad global",
    descripcion:
      "Red de personas y proyectos aplicando HGI en contextos reales, compartiendo aprendizajes y metiendo presión al hype vacío.",
    estado: "planned",
  },
];

const estadoLabel: Record<RoadmapItem["estado"], string> = {
  done: "Listo",
  wip: "En curso",
  planned: "Planeado",
};

const estadoColor: Record<RoadmapItem["estado"], string> = {
  done: "bg-emerald-500",
  wip: "bg-amber-500",
  planned: "bg-zinc-500",
};

export default function RoadmapPage() {
  return (
    <PageContainer>
      <SectionTitle title="Roadmap HGI" eyebrow="sin prometer la luna, pero con rumbo">
        No es una profecía, es un mapa de trabajo. Las fechas pueden moverse, pero
        la dirección es clara: menos humo, más cosas concretas que cuidan al humano.
      </SectionTitle>

      <ol className="relative mt-4 space-y-4 border-l border-zinc-800 pl-4">
        {roadmap.map((item) => (
          <li key={item.id} className="ml-2">
            <div className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border border-zinc-900 bg-zinc-950" />
            <Card subtle>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                    {item.fase}
                  </p>
                  <p className="text-sm font-semibold text-zinc-50">{item.titulo}</p>
                  <p className="mt-1 text-sm text-zinc-300">{item.descripcion}</p>
                </div>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-black ${estadoColor[item.estado]}`}
                >
                  {estadoLabel[item.estado]}
                </span>
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </PageContainer>
  );
}
