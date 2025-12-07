import { PageContainer } from "@/components/PageContainer";
import { SectionTitle } from "@/components/SectionTitle";
import { Card } from "@/components/Card";
import type { BibliografiaItem } from "@/types";

const referencias: BibliografiaItem[] = [
  {
    id: "hgi-origen",
    titulo: "Human-Grounded Intelligence: hacia sistemas que entienden personas",
    autor: "Equipo HGI",
    anio: 2024,
    tipo: "reporte",
    enlace: "https://example.com/hgi-origen",
  },
  {
    id: "bowker-star-sorting",
    titulo: "Sorting Things Out: Classification and Its Consequences",
    autor: "Geoffrey C. Bowker, Susan Leigh Star",
    anio: 1999,
    tipo: "libro",
    enlace: "https://example.com/sorting-things-out",
  },
  {
    id: "lucy-suchman-plans",
    titulo: "Plans and Situated Actions: The Problem of Human-Machine Communication",
    autor: "Lucy A. Suchman",
    anio: 1987,
    tipo: "libro",
    enlace: "https://example.com/plans-and-situated-actions",
  },
  {
    id: "bender-linguistic-data",
    titulo: "On the Dangers of Stochastic Parrots: Can Language Models Be Too Big?",
    autor: "Emily M. Bender et al.",
    anio: 2021,
    tipo: "articulo",
    enlace: "https://example.com/stochastic-parrots",
  },
  {
    id: "ethics-ai",
    titulo: "Ethics of Artificial Intelligence",
    autor: "Nick Bostrom, Eliezer Yudkowsky",
    anio: 2014,
    tipo: "reporte",
    enlace: "https://example.com/ethics-ai",
  },
];

const tipoLabel: Record<BibliografiaItem["tipo"], string> = {
  articulo: "Artículo",
  libro: "Libro",
  reporte: "Reporte",
  video: "Video",
  otro: "Otro",
};

export default function BibliografiaPage() {
  return (
    <PageContainer>
      <SectionTitle
        title="Bibliografía HGI"
        eyebrow="esto no sale solo de hilos de twitter"
      >
        Esta lista es un punto de partida para entender de dónde viene HGI: estudios
        sobre lenguaje, interacción humano&#x2011;máquina, ética de IA y diseño centrado en
        personas. Más adelante estas referencias vendrán directo de la base de datos.
      </SectionTitle>

      <div className="grid gap-4 md:grid-cols-2">
        {referencias.map((ref) => (
          <Card key={ref.id} subtle>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-zinc-50">{ref.titulo}</p>
              <p className="text-xs text-zinc-400">
                {ref.autor} · {ref.anio} · {tipoLabel[ref.tipo]}
              </p>
              <a
                href={ref.enlace}
                target="_blank"
                rel="noreferrer"
                className="mt-1 text-xs text-zinc-300 underline underline-offset-2 hover:text-zinc-100"
              >
                Ver referencia
              </a>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
