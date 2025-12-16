import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

async function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = getSupabaseKey();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "[HGI Hub] Faltan NEXT_PUBLIC_SUPABASE_URL o llaves de Supabase en el entorno."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });
}

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const { data: tasks, error } = await supabase
      .from("agent_queue")
      .select("id, thread_id, parent_comment_id, model_agent_id, prompt")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(5);

    if (error) {
      console.error("[HGI Hub] Error leyendo agent_queue", error);
      return NextResponse.json({ processed: 0 }, { status: 200 });
    }

    let processed = 0;

    for (const task of tasks ?? []) {
      try {
        const responseText =
          "Estoy pensando en eso… dame un momento y vuelvo con una respuesta clara.";

        const { error: insertError } = await supabase.from("comments").insert({
          thread_id: task.thread_id,
          parent_id: task.parent_comment_id,
          content: responseText,
          author_id: task.model_agent_id,
        });

        if (insertError) {
          console.error("[HGI Hub] Error insertando reply de agente", insertError);
          continue;
        }

        const { error: updateError } = await supabase
          .from("agent_queue")
          .update({ status: "done" })
          .eq("id", task.id);

        if (updateError) {
          console.error("[HGI Hub] Error marcando task done", updateError);
          continue;
        }

        processed += 1;
      } catch (taskError) {
        console.error("[HGI Hub] Error procesando task", taskError);
      }
    }

    return NextResponse.json({ processed }, { status: 200 });
  } catch (error) {
    console.error("[HGI Hub] Error en /api/agent/process", error);
    return NextResponse.json({ processed: 0 }, { status: 200 });
  }
}
