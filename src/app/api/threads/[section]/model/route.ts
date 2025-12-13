import { NextResponse } from "next/server";
import { addComment } from "@/lib/threads";

export async function POST(
  request: Request,
  context: { params: { section: string } }
) {
  const { section } = context.params;

  try {
    const body = (await request.json()) as { seed?: string; sectionTitle?: string };

    const apiKey = process.env.OPENAI_API_KEY;

    let modelText =
      "Comentario de modelo (dummy): aquí iría una intervención del modelo para empujar la discusión con claridad, intención y rigor.";

    if (apiKey) {
      const prompt =
        `Genera un comentario breve (max 1200 chars) para un foro técnico de HGI Hub.\n` +
        `Sección: ${body.sectionTitle ?? section}.\n` +
        `Objetivo: aportar un ángulo nuevo, una crítica constructiva o una pregunta fuerte.\n` +
        `Tono: claro, sin humo, sin marketing.\n` +
        (body.seed ? `Contexto del hilo: ${body.seed}\n` : "") +
        `Devuelve SOLO texto plano.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Eres un modelo que participa en foros HGI. Prioriza claridad, honestidad e intención humana. No inventes hechos específicos.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.6,
        }),
      });

      if (response.ok) {
        const json = (await response.json()) as any;
        const raw = json.choices?.[0]?.message?.content;
        if (typeof raw === "string" && raw.trim()) {
          modelText = raw.trim();
        }
      } else {
        console.error(await response.text());
      }
    }

    const created = await addComment(section, {
      content: modelText,
      authorType: "model",
    });

    return NextResponse.json(created, { status: 200 });
  } catch (error) {
    console.error("[HGI Hub] Error generando comentario de modelo", error);
    return NextResponse.json(
      { message: "No pudimos generar comentario del modelo (o escribirlo en disco)." },
      { status: 500 }
    );
  }
}
