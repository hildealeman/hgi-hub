import "server-only";

import { createServerClient } from "@supabase/ssr";
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

function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[HGI Hub] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno."
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get() {
        return undefined;
      },
      set() {
        // no-op (esta ruta no depende de auth)
      },
      remove() {
        // no-op
      },
    },
  });
}

export const db: DB = {
  suscripciones: {
    async create(input) {
      const supabase = getServerSupabase();
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
