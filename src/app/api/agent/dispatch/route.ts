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
  const name = typeof agent?.name === "string" && agent.name.trim() ? agent.name.trim() : "Modelo";
  const payload = typeof task?.payload === "string" ? task.payload : "";
  return `(${name}) ${payload}`;
}

export async function POST() {
  try {
    const supabase = await getServerSupabase();

    const { data: tasks, error } = await supabase
      .from("agent_queue")
      .select(
        "id, thread_id, parent_id, parent_comment_id, agent_id, payload, priority, status, created_at"
      )
      .eq("status", "pending")
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

    const parentId = (task.parent_id ?? task.parent_comment_id ?? null) as string | null;
    if (!parentId) {
      const { error: deleteError } = await supabase.from("agent_queue").delete().eq("id", task.id);
      if (deleteError) {
        console.error("[HGI Hub] Error borrando task inválido", deleteError);
      }
      return NextResponse.json({ processed: false }, { status: 200 });
    }

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("id, name, provider, model, system_prompt")
      .eq("id", task.agent_id)
      .maybeSingle();

    if (agentError) {
      console.error("[HGI Hub] Error leyendo agent", agentError);
    }

    const reply = await generateReplyText(task, agent ?? null);

    // Ensure the agent has a profile with role="agent".
    try {
      const { data: existingProfile, error: profileReadError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", task.agent_id)
        .maybeSingle();

      if (profileReadError) {
        console.error("[HGI Hub] Error leyendo profile del agente", profileReadError);
      }

      if (!existingProfile?.id) {
        const username = typeof agent?.name === "string" ? agent.name : "agent";
        const { error: profileInsertError } = await supabase.from("profiles").insert({
          id: task.agent_id,
          username,
          role: "agent",
        });

        if (profileInsertError) {
          console.error(
            "[HGI Hub] Error creando profile del agente",
            profileInsertError
          );
        }
      }
    } catch (e) {
      console.error("[HGI Hub] Error asegurando profile del agente", e);
    }

    const replyId = crypto.randomUUID();

    const { error: insertError } = await supabase.from("comments").insert({
      id: replyId,
      thread_id: task.thread_id,
      parent_id: parentId,
      author_id: task.agent_id,
      content: reply,
    });

    if (insertError) {
      console.error("[HGI Hub] Error insertando reply", insertError);
      return NextResponse.json({ processed: false }, { status: 200 });
    }

    try {
      const { error: voteError } = await supabase.from("comment_interactions").insert({
        id: crypto.randomUUID(),
        comment_id: replyId,
        user_id: task.agent_id,
        type: "auto",
      });

      if (voteError) {
        const { error: fallbackError } = await supabase.from("comment_interactions").insert({
          id: crypto.randomUUID(),
          comment_id: replyId,
          user_id: task.agent_id,
          interaction: "like",
        });
        if (fallbackError) {
          console.error("[HGI Hub] Error insertando auto-vote", fallbackError);
        }
      }
    } catch (e) {
      console.error("[HGI Hub] Error en auto-vote", e);
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
