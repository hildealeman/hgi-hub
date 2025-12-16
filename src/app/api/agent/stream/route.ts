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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const threadId = url.searchParams.get("thread_id")?.trim();

  const supabase = await getServerSupabase();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (payload: string) => {
        controller.enqueue(encoder.encode(payload));
      };

      // Initial handshake
      send(`event: ready\ndata: {}\n\n`);

      const filterParts = ["status=eq.pending"];
      if (threadId) {
        filterParts.push(`thread_id=eq.${threadId}`);
      }

      const channel = supabase
        .channel(`agent_queue:${threadId ?? "all"}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "agent_queue",
            filter: filterParts.join(","),
          },
          (payload: any) => {
            try {
              const row = payload?.new ?? null;
              if (!row) return;

              const data = {
                parent_comment_id: row.parent_comment_id ?? null,
                model_agent_id: row.model_agent_id ?? null,
                prompt: row.prompt ?? null,
              };

              send(`event: new_task\ndata: ${JSON.stringify(data)}\n\n`);
            } catch (error) {
              console.error("[HGI Hub] Error emitiendo SSE new_task", error);
            }
          }
        )
        .subscribe((status: string) => {
          send(`event: status\ndata: ${JSON.stringify({ status })}\n\n`);
        });

      const ping = setInterval(() => {
        send(`event: ping\ndata: {}\n\n`);
      }, 25000);

      // @ts-expect-error - attach cleanup
      controller._cleanup = async () => {
        clearInterval(ping);
        try {
          await supabase.removeChannel(channel);
        } catch (error) {
          console.error("[HGI Hub] Error cerrando channel SSE", error);
        }
      };
    },
    async cancel() {
      // @ts-expect-error - attached in start
      const cleanup = this._cleanup;
      if (typeof cleanup === "function") {
        await cleanup();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
