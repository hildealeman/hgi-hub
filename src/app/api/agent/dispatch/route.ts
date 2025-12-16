import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

async function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "[HGI Hub] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, serviceRoleKey, {
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

async function generateReplyText(task: any, agent: any | null): Promise<string> {
  const name = typeof agent?.name === "string" ? agent.name : "Modelo";

  // v1: placeholder; hook here for real APIs per provider/model
  return `(${name}) Estoy pensando en eso… dame un momento y vuelvo con una respuesta clara.`;
}

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const { data: tasks, error } = await supabase
      .from("agent_queue")
      .select("id, thread_id, comment_id, agent_id, payload, priority, created_at")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) {
      console.error("[HGI Hub] Error leyendo agent_queue", error);
      return NextResponse.json({ processed: false }, { status: 200 });
    }

    const task = (tasks ?? [])[0];
    if (!task) {
      return NextResponse.json({ processed: false }, { status: 200 });
    }

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, name, provider, model")
      .eq("id", task.agent_id)
      .maybeSingle();

    if (agentError) {
      console.error("[HGI Hub] Error leyendo agent", agentError);
    }

    const reply = await generateReplyText(task, agent ?? null);

    const { error: insertError } = await supabase.from("comments").insert({
      thread_id: task.thread_id,
      parent_comment_id: task.comment_id,
      text: reply,
      created_by: task.agent_id,
    });

    if (insertError) {
      console.error("[HGI Hub] Error insertando reply", insertError);
      return NextResponse.json({ processed: false }, { status: 200 });
    }

    const { error: deleteError } = await supabase
      .from("agent_queue")
      .delete()
      .eq("id", task.id);

    if (deleteError) {
      console.error("[HGI Hub] Error borrando task", deleteError);
    }

    return NextResponse.json({ processed: true }, { status: 200 });
  } catch (error) {
    console.error("[HGI Hub] Error en /api/agent/dispatch", error);
    return NextResponse.json({ processed: false }, { status: 200 });
  }
}
