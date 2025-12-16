import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type AgentKey = "chatgpt" | "claude" | "gemini" | "chatita";

interface Body {
  thread_id?: string;
  parent_id?: string;
  parent_comment_id?: string;
  content?: string;
}

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

function isDirectMention(text: string, agent: AgentKey): boolean {
  const lower = text.toLowerCase();
  if (lower.includes(`@${agent}`)) return true;
  if (agent === "chatgpt" && lower.includes("@gpt")) return true;
  return false;
}

function matchAgentRow(agent: any, key: AgentKey): boolean {
  const name = typeof agent?.name === "string" ? agent.name.toLowerCase().trim() : "";
  return name.includes(key);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const threadId = body.thread_id;
    const parentId = body.parent_id ?? body.parent_comment_id;
    const content = body.content?.trim() ?? "";

    if (!threadId || !parentId || !content) {
      return NextResponse.json(
        { message: "Falta thread_id, parent_id o content" },
        { status: 400 }
      );
    }

    const supabase = await getServerSupabase();

    const { data: agents, error: agentsError } = await supabase
      .from("agents")
      .select("id, name, provider, model, system_prompt");

    if (agentsError) {
      console.error("[HGI Hub] Error leyendo agents", agentsError);
      return NextResponse.json({ queued: 0 }, { status: 200 });
    }

    const wanted: AgentKey[] = ["chatgpt", "claude", "gemini"];

    const mentioned = wanted.filter((k) => isDirectMention(content, k));
    const targetAgents = mentioned.length > 0 ? mentioned : wanted;
    const priority = mentioned.length > 0 ? 1 : 2;

    const tasksToInsert: Array<any> = [];

    for (const key of targetAgents) {
      const agentRow = (agents ?? []).find((a: any) => matchAgentRow(a, key));
      if (!agentRow?.id) continue;

      tasksToInsert.push({
        id: crypto.randomUUID(),
        thread_id: threadId,
        parent_comment_id: parentId,
        agent_id: agentRow.id,
        payload: content,
        priority,
        status: "pending",
      });
    }

    if (tasksToInsert.length === 0) {
      return NextResponse.json({ queued: 0 }, { status: 200 });
    }

    const { error: insertError } = await supabase
      .from("agent_queue")
      .insert(tasksToInsert);

    if (insertError) {
      console.error("[HGI Hub] Error insertando agent_queue", insertError);
      return NextResponse.json({ queued: 0 }, { status: 200 });
    }

    return NextResponse.json({ queued: tasksToInsert.length }, { status: 200 });
  } catch (error) {
    console.error("[HGI Hub] Error en /api/agent/mention", error);
    return NextResponse.json({ queued: 0 }, { status: 200 });
  }
}
