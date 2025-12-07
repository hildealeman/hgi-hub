export type BibliografiaTipo =
  | "articulo"
  | "libro"
  | "reporte"
  | "video"
  | "otro";

export interface BibliografiaItem {
  id: string;
  titulo: string;
  autor: string;
  anio: number;
  tipo: BibliografiaTipo;
  enlace: string;
}

export type RoadmapEstado = "done" | "wip" | "planned";

export interface RoadmapItem {
  id: string;
  fase: string;
  titulo: string;
  descripcion: string;
  estado: RoadmapEstado;
}

export type RolSuscripcion =
  | "dev"
  | "investigador"
  | "educador"
  | "curioso"
  | "otro";

export interface Suscripcion {
  id: string;
  email: string;
  nombre: string | null;
  rol: RolSuscripcion;
  created_at: string;
}
