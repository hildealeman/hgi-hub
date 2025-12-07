import { supabase } from "./supabaseClient";
import type { RolSuscripcion, Suscripcion } from "@/types";

export interface CreateSuscripcionInput {
  email: string;
  nombre?: string;
  rol: RolSuscripcion;
}

interface DB {
  suscripciones: {
    create(input: CreateSuscripcionInput): Promise<Suscripcion>;
  };
}

export const db: DB = {
  suscripciones: {
    async create(input) {
      const { data, error } = await supabase
        .from("suscripciones")
        .insert({
          email: input.email,
          nombre: input.nombre ?? null,
          rol: input.rol,
        })
        .select("id, email, nombre, rol, created_at")
        .single();

      if (error) {
        throw error;
      }

      return data as Suscripcion;
    },
  },
};
