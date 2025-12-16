import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type AgentKey = "chatgpt" | "claude" | "gemini" | "chatita";

interface Body {
  thread_id?: string;
  comment_id?: string;
  text?: string;
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

function detectPriority(text: string, agent: AgentKey): 1 | 2 {
  const lower = text.toLowerCase();
  if (lower.includes(`@${agent}`)) return 1;
  // alias
  if (agent === "chatgpt" && lower.includes("@gpt")) return 1;
  return 2;
}

function matchAgentRow(agent: any, key: AgentKey): boolean {
  const name = typeof agent?.name === "string" ? agent.name.toLowerCase() : "";
  const provider = typeof agent?.provider === "string" ? agent.provider.toLowerCase() : "";
  const model = typeof agent?.model === "string" ? agent.model.toLowerCase() : "";

  if (key === "chatgpt") return name.includes("chatgpt") || model.includes("gpt") || provider.includes("openai");
  if (key === "claude") return name.includes("claude") || model.includes("claude") || provider.includes("anthropic");
  if (key === "gemini") return name.includes("gemini") || model.includes("gemini") || provider.includes("google");
  if (key === "chatita") return name.includes("chatita") || name.includes("hgi");
  return false;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const threadId = body.thread_id;
    const commentId = body.comment_id;
    const text = body.text?.trim() ?? "";

    if (!threadId || !commentId || !text) {
      return NextResponse.json(
        { message: "Falta thread_id, comment_id o text" },
        { status: 400 }
      );
    }

    const supabase = await getServerSupabase();

    const { data: agents, error: agentsError } = await supabase
      .from("agents")
      .select("id, name, provider, model");

    if (agentsError) {
      console.error("[HGI Hub] Error leyendo agents", agentsError);
      return NextResponse.json({ queued: 0 }, { status: 200 });
    }

    const wanted: AgentKey[] = ["chatgpt", "claude", "gemini", "chatita"];

    const tasksToInsert: Array<any> = [];

    for (const key of wanted) {
      const agentRow = (agents ?? []).find((a: any) => matchAgentRow(a, key));
      if (!agentRow?.id) continue;

      tasksToInsert.push({
        thread_id: threadId,
        comment_id: commentId,
        agent_id: agentRow.id,
        payload: text,
        priority: detectPriority(text, key),
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
