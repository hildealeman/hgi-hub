import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface Body {
  thread_id?: string;
  parent_id?: string;
  parent_comment_id?: string;
  content?: string;
}

function extractMentionTokens(text: string): string[] {
  const src = text ?? "";
  const tokens = new Set<string>();
  const re = /@([a-z0-9_\-]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(src))) {
    const raw = match[1]?.trim();
    if (raw) tokens.add(raw);
  }
  return Array.from(tokens);
}

const MENTION_ALIASES: Record<string, (a: any) => boolean> = {
  chatgpt: (a) => {
    const key = `${a?.name ?? ""}:${a?.provider ?? ""}:${a?.model ?? ""}`.toLowerCase();
    return key.includes("gpt") || key.includes("openai");
  },
  gpt: (a) => {
    const key = `${a?.name ?? ""}:${a?.provider ?? ""}:${a?.model ?? ""}`.toLowerCase();
    return key.includes("gpt") || key.includes("openai");
  },
  claude: (a) => {
    const key = `${a?.name ?? ""}:${a?.provider ?? ""}:${a?.model ?? ""}`.toLowerCase();
    return key.includes("claude") || key.includes("anthropic");
  },
  anthropic: (a) => {
    const key = `${a?.name ?? ""}:${a?.provider ?? ""}:${a?.model ?? ""}`.toLowerCase();
    return key.includes("claude") || key.includes("anthropic");
  },
  gemini: (a) => {
    const key = `${a?.name ?? ""}:${a?.provider ?? ""}:${a?.model ?? ""}`.toLowerCase();
    return key.includes("gemini") || key.includes("google");
  },
  google: (a) => {
    const key = `${a?.name ?? ""}:${a?.provider ?? ""}:${a?.model ?? ""}`.toLowerCase();
    return key.includes("gemini") || key.includes("google");
  },
  chatita: (a) => {
    const key = `${a?.name ?? ""}`.toLowerCase();
    return key.includes("chatita");
  },
  ollama: (a) => {
    const key = `${a?.provider ?? ""}`.toLowerCase();
    return key.includes("ollama");
  },
};

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

function findAgentByAlias(token: string, agents: any[]): any | null {
  const tokenLower = token.toLowerCase();
  const matcher = MENTION_ALIASES[tokenLower];
  if (matcher) {
    return agents.find(matcher) ?? null;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const threadId = body.thread_id;
    const parentId = body.parent_id ?? body.parent_comment_id;
    const content = body.content?.trim() ?? "";

    if (!threadId || !parentId || !content) {
      return NextResponse.json({ queued: 0 }, { status: 200 });
    }

    const supabase = await getServerSupabase();

    const { data: agents, error: agentsError } = await supabase
      .from("agents")
      .select("id, name, provider, model, system_prompt");

    if (agentsError) {
      console.error("[HGI Hub] Error leyendo agents", agentsError);
      return NextResponse.json({ queued: 0 }, { status: 200 });
    }

    const tokens = extractMentionTokens(content);
    if (tokens.length === 0) {
      return NextResponse.json({ queued: 0 }, { status: 200 });
    }

    const ignored = new Set(["memoria", "critico", "reflexion", "admin", "mod", "sistema"]);

    const agentByName = new Map<string, any>();
    (agents ?? []).forEach((a: any) => {
      const name = typeof a?.name === "string" ? a.name.toLowerCase().trim() : "";
      if (name) agentByName.set(name, a);
    });

    const queueRows: Array<any> = [];
    const humanTokens: string[] = [];

    const enqueuedAgentIds = new Set<string>();

    for (const token of tokens) {
      const tokenLower = token.toLowerCase();
      if (ignored.has(tokenLower)) continue;

      let agentRow = agentByName.get(tokenLower) ?? null;

      if (!agentRow) {
        agentRow = findAgentByAlias(tokenLower, agents ?? []);
      }

      if (agentRow?.id && !enqueuedAgentIds.has(agentRow.id)) {
        enqueuedAgentIds.add(agentRow.id);
        queueRows.push({
          id: crypto.randomUUID(),
          agent_id: agentRow.id,
          thread_id: threadId,
          parent_comment_id: parentId,
          payload: content,
          priority: 1,
          created_at: new Date().toISOString(),
        });
      } else if (!agentRow) {
        humanTokens.push(token);
      }
    }

    let queued = 0;

    if (queueRows.length > 0) {
      const { error: insertError } = await supabase.from("agent_queue").insert(queueRows);
      if (insertError) {
        console.error("[HGI Hub] Error insertando agent_queue", insertError);
      } else {
        queued = queueRows.length;
      }
    }

    if (humanTokens.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("username", humanTokens);

      if (profilesError) {
        console.error("[HGI Hub] Error leyendo profiles", profilesError);
      } else {
        for (const p of profiles ?? []) {
          if (!p?.id) continue;
          try {
            const base = {
              id: crypto.randomUUID(),
              comment_id: parentId,
              user_id: p.id,
              created_at: new Date().toISOString(),
            };

            const { error: mentionInsertError } = await supabase
              .from("comment_interactions")
              .insert({ ...base, type: "mention" });

            if (mentionInsertError) {
              const { error: fallbackError } = await supabase
                .from("comment_interactions")
                .insert({ ...base, interaction: "mention" });
              if (fallbackError) {
                console.error("[HGI Hub] Error insertando mention", fallbackError);
              }
            }
          } catch (e) {
            console.error("[HGI Hub] Error insertando mention", e);
          }
        }
      }
    }

    return NextResponse.json({ queued }, { status: 200 });
  } catch (error) {
    console.error("[HGI Hub] Error en /api/agent/mention", error);
    return NextResponse.json({ queued: 0 }, { status: 200 });
  }
}
