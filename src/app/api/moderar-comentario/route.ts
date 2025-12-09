import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { content } = (await req.json()) as { content?: string };

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Falta contenido" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Si no hay API key, regresamos una "IA" muy tonta pero funcional
    if (!apiKey) {
      return NextResponse.json({
        suggested: content,
        explanation:
          "Aquí iría una sugerencia real de la IA. Por ahora usamos tu texto tal cual para no bloquearte.",
      });
    }

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
              "Eres un asistente que ayuda a reformular comentarios para HGI Hub: mantienes la intención del humano pero evitas ataques personales, odio directo y desinformación obvia. Devuelves JSON con campos 'suggested' y 'explanation'.",
          },
          {
            role: "user",
            content:
              "Comentario original:\n" +
              content +
              "\n\nDevuelve JSON plano con 'suggested' (texto reformulado) y 'explanation' (por qué lo cambiaste).",
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error(await response.text());
      return NextResponse.json(
        { error: "Error al llamar a OpenAI" },
        { status: 500 },
      );
    }

    const json = (await response.json()) as any;
    const raw = json.choices?.[0]?.message?.content ?? "";

    let parsed: { suggested?: string; explanation?: string } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { suggested: raw, explanation: "La IA no devolvió JSON estricto." };
    }

    return NextResponse.json({
      suggested: parsed.suggested ?? content,
      explanation:
        parsed.explanation ??
        "La IA hizo algunos ajustes para sonar más clara y constructiva.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error inesperado en moderar-comentario" },
      { status: 500 },
    );
  }
}
