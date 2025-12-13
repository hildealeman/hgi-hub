import { NextResponse } from "next/server";
import { downvoteComment, upvoteComment } from "@/lib/threads";

export async function POST(
  request: Request,
  context: { params: { section: string } }
) {
  const { section } = context.params;

  try {
    const body = (await request.json()) as { id?: string; direction?: "up" | "down" };

    if (!body.id || (body.direction !== "up" && body.direction !== "down")) {
      return NextResponse.json(
        { message: "Falta id o dirección de voto" },
        { status: 400 }
      );
    }

    const updated =
      body.direction === "up"
        ? await upvoteComment(section, body.id)
        : await downvoteComment(section, body.id);

    if (!updated) {
      return NextResponse.json({ message: "No existe ese comentario" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("[HGI Hub] Error votando comentario", error);
    return NextResponse.json(
      { message: "No pudimos registrar el voto (posible FS read-only en deploy)." },
      { status: 500 }
    );
  }
}
