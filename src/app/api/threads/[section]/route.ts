import { NextRequest, NextResponse } from "next/server";
import { addComment, getThreadFor } from "@/lib/threads";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ section: string }> }
) {
  const { section } = await context.params;

  try {
    const thread = await getThreadFor(section);
    return NextResponse.json(thread, { status: 200 });
  } catch (error) {
    console.error("[HGI Hub] Error leyendo thread", error);
    return NextResponse.json(
      { message: "No pudimos cargar el thread ahorita." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ section: string }> }
) {
  const { section } = await context.params;

  try {
    const body = (await request.json()) as { content?: string; authorType?: "human" | "model" };
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json(
        { message: "Falta contenido" },
        { status: 400 }
      );
    }

    const created = await addComment(section, {
      content,
      authorType: body.authorType ?? "human",
    });

    return NextResponse.json(created, { status: 200 });
  } catch (error) {
    console.error("[HGI Hub] Error agregando comentario", error);
    return NextResponse.json(
      {
        message:
          "No pudimos guardar tu comentario (posible FS read-only en deploy).",
      },
      { status: 500 }
    );
  }
}
