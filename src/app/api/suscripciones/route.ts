import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { RolSuscripcion } from "@/types";

interface Body {
  email?: string;
  nombre?: string;
  rol?: RolSuscripcion;
}

function isValidEmail(email: string): boolean {
  return /.+@.+\..+/.test(email);
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const { email, nombre, rol } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { message: "Esto no se ve como un correo válido, eh." },
        { status: 400 }
      );
    }

    if (!rol) {
      return NextResponse.json(
        { message: "Elige un rol para saber más o menos por dónde vas." },
        { status: 400 }
      );
    }

    const supabase = getServerSupabase();
    const { error } = await supabase.from("suscripciones").insert({
      email,
      nombre: nombre ?? null,
      rol,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        message:
          "Listo, te apuntamos. No prometemos spam, prometemos cosas chidas.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[HGI Hub] Error creando suscripción", error);
    return NextResponse.json(
      {
        message:
          "Algo salió mal… no debería, pero pasó. Intenta de nuevo, porfa.",
      },
      { status: 500 },
    );
  }
}
