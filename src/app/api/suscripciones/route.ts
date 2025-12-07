import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { RolSuscripcion } from "@/types";

interface Body {
  email?: string;
  nombre?: string;
  rol?: RolSuscripcion;
}

function isValidEmail(email: string): boolean {
  return /.+@.+\..+/.test(email);
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

    await db.suscripciones.create({
      email,
      nombre,
      rol,
    });

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
