"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ReactMarkdown from "react-markdown";

type InteractionType = "like" | "dislike";

function formatAgentDisplayName(agent: any | null): string | null {
  if (!agent) return null;

  const name = typeof agent.name === "string" ? agent.name.trim() : "";
  const provider = typeof agent.provider === "string" ? agent.provider.trim() : "";
  const model = typeof agent.model === "string" ? agent.model.trim() : "";

  const key = `${provider}:${model}:${name}`.toLowerCase();

  if (key.includes("chatita") || name.toLowerCase().includes("chatita")) return "La Chatita (HGI Model)";
  if (key.includes("openai") || model.toLowerCase().includes("gpt")) return "GPT-4.1 (OpenAI)";
  if (key.includes("anthropic") || model.toLowerCase().includes("claude")) return "Claude 3.7 (Anthropic)";
  if (key.includes("google") || model.toLowerCase().includes("gemini")) return "Gemini 2.0 Flash (Google)";
  if (key.includes("groq")) return "GroqMix (Groq)";
  if (key.includes("ollama")) return "Ollama-Local (Ollama)";

  if (name) return name;
  if (model) return model;
  return "Modelo";
}

function formatAgentSubtitle(agent: any | null): string | null {
  if (!agent) return null;
  const provider = typeof agent.provider === "string" ? agent.provider.trim() : "";
  const model = typeof agent.model === "string" ? agent.model.trim() : "";
  const parts = [provider, model].filter(Boolean);
  return parts.length ? parts.join(" • ") : null;
}

function avatarInitial(name: string | null | undefined): string {
  const normalized = (name ?? "").trim();
  return normalized ? normalized[0]!.toUpperCase() : "?";
}

function avatarBorderClass(role: string | null | undefined): string {
  if (role === "admin") return "border-red-500";
  if (role === "agent") return "border-blue-500";
  if (role === "human") return "border-green-500";
  return "border-gray-700";
}

function quotedUuidInFilter(ids: string[]): string {
  // PostgREST expects: ("uuid1","uuid2") for UUID IN filters.
  const safe = (ids ?? []).filter((v) => typeof v === "string" && v.trim());
  return `(${safe.map((v) => JSON.stringify(v)).join(",")})`;
}

function useCommentInteractions(
  commentId: string | null,
  initial?: { likes?: number; dislikes?: number }
) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userVote, setUserVote] = useState<InteractionType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!commentId) return;
    setLikes(initial?.likes ?? 0);
    setDislikes(initial?.dislikes ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentId]);

  const refresh = async () => {
    if (!commentId) return;
    try {
      setLoading(true);
      const res = await fetch(
        `/api/comments/interact?comment_id=${encodeURIComponent(commentId)}`,
        { method: "GET" }
      );
      if (!res.ok) return;
      const json = (await res.json()) as {
        likes: number;
        dislikes: number;
        userVote?: InteractionType | null;
      };
      setLikes(json.likes ?? 0);
      setDislikes(json.dislikes ?? 0);
      setUserVote((json.userVote as InteractionType | null) ?? null);
    } catch (e) {
      console.error("[HGI Hub] Error refrescando interacciones", e);
    } finally {
      setLoading(false);
    }
  };

  const interact = async (interaction: InteractionType) => {
    if (!commentId) return;
    try {
      const res = await fetch("/api/comments/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: commentId, interaction }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("[HGI Hub] Error votando", res.status, text);
        return;
      }

      const json = (await res.json()) as { likes: number; dislikes: number };
      setLikes(json.likes ?? 0);
      setDislikes(json.dislikes ?? 0);
      setUserVote(interaction);
    } catch (e) {
      console.error("[HGI Hub] Error votando", e);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentId]);

  return { likes, dislikes, userVote, loading, refresh, interact };
}

export default function ThreadPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto p-8 space-y-8">
          <h1 className="text-3xl font-bold">HGI Cognitive Thread</h1>
          <p className="text-gray-400">Cargando…</p>
        </div>
      }
    >
      <ThreadPageInner />
    </Suspense>
  );
}

function ThreadPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [threadTitle, setThreadTitle] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [threadInfo, setThreadInfo] = useState<any | null>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loadingThread, setLoadingThread] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const threadIdFromUrl = useMemo(() => {
    const raw = searchParams.get("id");
    return raw && raw.trim() ? raw.trim() : null;
  }, [searchParams]);

  // ────────────────────────────────────────────────
  // 1. Create thread
  // ────────────────────────────────────────────────
  const createThread = async () => {
    if (!threadTitle.trim()) return;
    setLoadingThread(true);

    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Necesitas iniciar sesión para crear un thread.");
      setLoadingThread(false);
      return;
    }

    const { data, error } = await supabase
      .from("threads")
      .insert({
        title: threadTitle,
        created_by: user.id,
      })
      .select("id, title, created_by, created_at")
      .single();

    if (error) {
      console.error("Error creating thread:", error);
      setError("No pudimos crear el thread.");
      setLoadingThread(false);
      return;
    }

    setThreadId(data.id);
    router.replace(`/whitepaper/hgi-chamber/thread?id=${encodeURIComponent(data.id)}`);
    setThreadTitle("");
    setLoadingThread(false);
  };

  const fetchThreads = async () => {
    setLoadingThreads(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("threads")
        .select("id, title, created_by, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching threads:", error);
        setError("No pudimos cargar los threads.");
        return;
      }

      setThreads(data ?? []);
    } finally {
      setLoadingThreads(false);
    }
  };

  // ────────────────────────────────────────────────
  // 2. Fetch comments for thread
  // ────────────────────────────────────────────────
  const fetchComments = async () => {
    if (!threadId) return;

    setLoadingComments(true);
    setError(null);

    const { data, error } = await supabase
      .from("comments")
      .select("id, thread_id, parent_id, author_id, content, created_at")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      setError("No pudimos cargar los comentarios.");
      setLoadingComments(false);
      return;
    }

    setComments(await structureThread(data ?? []));
    setLoadingComments(false);
  };

  const callAgentMention = async (parentCommentId: string, content: string) => {
    if (!threadId) return;
    try {
      await fetch("/api/agent/mention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thread_id: threadId,
          parent_comment_id: parentCommentId,
          content,
        }),
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!threadId) return;

    const loadThread = async () => {
      const { data, error } = await supabase
        .from("threads")
        .select("id, title, created_by, created_at")
        .eq("id", threadId)
        .single();

      if (!error) setThreadInfo(data);
    };

    loadThread();
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;

    const es = new EventSource(
      `/api/agent/stream?thread_id=${encodeURIComponent(threadId)}`
    );

    const onNewTask = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[HGI Agent SSE] new_task", data);
        fetchComments();
      } catch {
        console.log("[HGI Agent SSE] new_task", event.data);
        fetchComments();
      }
    };

    es.addEventListener("new_task", onNewTask);

    es.addEventListener("status", (event: MessageEvent) => {
      console.log("[HGI Agent SSE] status", event.data);
    });

    es.addEventListener("ready", () => {
      console.log("[HGI Agent SSE] ready");
    });

    es.onerror = (err) => {
      console.error("[HGI Agent SSE] error", err);
    };

    return () => {
      es.removeEventListener("new_task", onNewTask);
      es.close();
    };
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;

    const tick = async () => {
      try {
        await fetch("/api/agent/dispatch", { method: "POST" });
      } catch {
        // ignore
      }
    };

    tick();
    const id = setInterval(tick, 7000);
    return () => clearInterval(id);
  }, [threadId]);

  useEffect(() => {
    if (threadIdFromUrl && threadIdFromUrl !== threadId) {
      setThreadId(threadIdFromUrl);
    }

    if (!threadIdFromUrl) {
      setThreadId(null);
      fetchThreads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadIdFromUrl]);

  useEffect(() => {
    if (!threadId) return;

    fetchComments();

    const channel = supabase
      .channel(`comments:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `thread_id=eq.${threadId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId]);

  // ────────────────────────────────────────────────
  // 3. Add a new comment
  // ────────────────────────────────────────────────
  const addComment = async () => {
    if (!input.trim() || !threadId) return;

    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Necesitas iniciar sesión para comentar.");
      return;
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        thread_id: threadId,
        parent_id: null,
        content: input,
        author_id: user.id,
      })
      .select("id, thread_id, parent_id, author_id, content, created_at")
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      setError("No pudimos guardar tu comentario.");
      return;
    }

    setInput("");
    await callAgentMention(data.id, data.content);
    fetchComments();
  };

  // ────────────────────────────────────────────────
  // 4. Add reply (child comment)
  // ────────────────────────────────────────────────
  const addReply = async (parentId: string, replyText: string) => {
    if (!replyText.trim() || !threadId) return;

    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Necesitas iniciar sesión para responder.");
      return;
    }

    const { data: inserted, error } = await supabase
      .from("comments")
      .insert({
        thread_id: threadId,
        parent_id: parentId,
        content: replyText,
        author_id: user.id,
      })
      .select("id, content")
      .maybeSingle();

    if (error) {
      console.error("Error adding reply:", error);
      setError("No pudimos guardar tu respuesta.");
      return;
    }

    if (inserted?.id && typeof inserted.content === "string") {
      await callAgentMention(inserted.id, inserted.content);
    }

    fetchComments();
  };

  // ────────────────────────────────────────────────
  // Convert flat comments into threaded structure
  // ────────────────────────────────────────────────
  async function structureThread(list: any[]) {
    const map: any = {};
    const roots: any[] = [];

    const createdByIds = Array.from(
      new Set(
        (list ?? [])
          .map((c) => c.author_id)
          .filter((id) => typeof id === "string" && id)
      )
    ) as string[];

    const profileById = new Map<string, any>();
    if (createdByIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, role")
        .in("id", createdByIds);

      if (profileError) {
        console.error("[HGI Hub] Error cargando profiles batch", profileError);
      }

      (profiles ?? []).forEach((p: any) => {
        if (p?.id) profileById.set(p.id, p);
      });
    }

    const agentById = new Map<string, any>();
    if (createdByIds.length > 0) {
      try {
        const inFilter = quotedUuidInFilter(createdByIds);
        const { data: agents, error: agentError } = await supabase
          .from("agents")
          .select("id, name, provider, model, system_prompt")
          .filter("id", "in", inFilter);

        if (agentError) {
          console.error("[HGI Hub] Error cargando agents batch", agentError);
        }

        (agents ?? []).forEach((a: any) => {
          if (a?.id) agentById.set(a.id, a);
        });
      } catch (e) {
        console.error("[HGI Hub] Error cargando agents batch", e);
      }
    }

    const commentIds = Array.from(
      new Set((list ?? []).map((c) => c.id).filter((id) => typeof id === "string" && id))
    ) as string[];

    const interactionsByCommentId = new Map<
      string,
      { likes: number; dislikes: number }
    >();
    if (commentIds.length > 0) {
      const inFilter = quotedUuidInFilter(commentIds);
      const { data: interactions, error: interactionsError } = await supabase
        .from("comment_interactions")
        .select("comment_id, interaction")
        .filter("comment_id", "in", inFilter);

      if (interactionsError) {
        console.error(
          "[HGI Hub] Error cargando comment_interactions batch",
          interactionsError
        );
      }

      (interactions ?? []).forEach((row: any) => {
        const cid = row?.comment_id;
        const interaction = row?.interaction as InteractionType | undefined;
        if (!cid || (interaction !== "like" && interaction !== "dislike")) return;

        const current = interactionsByCommentId.get(cid) ?? { likes: 0, dislikes: 0 };
        if (interaction === "like") current.likes += 1;
        if (interaction === "dislike") current.dislikes += 1;
        interactionsByCommentId.set(cid, current);
      });
    }

    list.forEach((c) => {
      const profile = typeof c.author_id === "string" ? profileById.get(c.author_id) ?? null : null;
      const agent = typeof c.author_id === "string" ? agentById.get(c.author_id) ?? null : null;
      const totals = interactionsByCommentId.get(c.id) ?? { likes: 0, dislikes: 0 };
      map[c.id] = { ...c, profile, agent, likes: totals.likes, dislikes: totals.dislikes, replies: [] };
    });

    list.forEach((c) => {
      if (c.parent_id) {
        map[c.parent_id]?.replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    return roots;
  }

  // ────────────────────────────────────────────────
  // UI
  // ────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">HGI Cognitive Thread</h1>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!threadId && (
        <div className="space-y-3">
          <input
            className="w-full p-2 rounded bg-gray-900 text-white border border-gray-700"
            placeholder="Título del hilo…"
            value={threadTitle}
            onChange={(e) => setThreadTitle(e.target.value)}
          />
          <button
            onClick={createThread}
            className="px-4 py-2 bg-purple-700 rounded text-white"
          >
            {loadingThread ? "Creando…" : "Crear Thread"}
          </button>

          <div className="pt-4">
            <h2 className="text-lg font-semibold text-white">Threads</h2>
            {loadingThreads ? (
              <p className="text-gray-400">Cargando threads…</p>
            ) : (
              <div className="mt-2 space-y-2">
                {threads.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => router.push(`/whitepaper/hgi-chamber/thread?id=${encodeURIComponent(t.id)}`)}
                    className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-left text-white hover:bg-gray-800"
                  >
                    <div className="text-sm font-medium">{t.title}</div>
                    <div className="text-xs text-gray-400">
                      {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                    </div>
                  </button>
                ))}

                {!loadingThreads && threads.length === 0 && (
                  <p className="text-gray-400">Todavía no hay threads.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {threadId && (
        <>
          {threadInfo && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white">{threadInfo.title}</h1>
              <p className="text-sm text-gray-400 mt-1">
                Creado el{" "}
                <span suppressHydrationWarning>
                  {new Date(threadInfo.created_at).toLocaleString()}
                </span>
              </p>
            </div>
          )}

          {/* Comment Input */}
          <textarea
            className="w-full p-3 h-28 rounded bg-gray-900 border border-gray-700 text-white"
            placeholder="Escribe tu comentario…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            onClick={addComment}
            className="px-4 py-2 bg-purple-700 rounded text-white"
          >
            Publicar
          </button>

          {/* Comments */}
          <div className="space-y-6">
            {loadingComments ? (
              <p className="text-gray-400">Cargando comentarios…</p>
            ) : (
              comments.map((c) => (
                <CommentCard
                  key={c.id}
                  comment={c}
                  addReply={addReply}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// Comment Card Component
// ────────────────────────────────────────────────

function CommentCard({ comment, addReply }: any) {
  const [replyText, setReplyText] = useState("");

  const displayName =
    comment.profile?.username ??
    formatAgentDisplayName(comment.agent) ??
    (typeof comment.created_by === "string" ? comment.created_by.slice(0, 8) : "?");

  const displayRole =
    comment.profile?.role ??
    formatAgentSubtitle(comment.agent) ??
    "";

  const roleKey = (comment.profile?.role ?? (comment.agent ? "agent" : "")) as
    | "human"
    | "agent"
    | "admin"
    | "";

  const { likes, dislikes, userVote, interact } = useCommentInteractions(comment.id, {
    likes: comment.likes,
    dislikes: comment.dislikes,
  });

  return (
    <div className="p-4 rounded-lg bg-[#111] border border-gray-800 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold border-2 ${avatarBorderClass(
            roleKey
          )}`}
        >
          {displayName?.[0]?.toUpperCase() ?? "?"}
        </div>

        <div className="flex flex-col">
          <span className="text-white font-semibold">{displayName}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{displayRole}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded border border-gray-700 text-gray-300`}>
              {roleKey || "?"}
            </span>
          </div>
        </div>
      </div>

      {roleKey === "agent" && comment.agent?.name && (
        <p className="text-xs text-gray-500 -mt-1">Modelo: {comment.agent.name}</p>
      )}

      <div className="prose prose-invert">
        <ReactMarkdown>{comment.content}</ReactMarkdown>
      </div>

      <div className="flex gap-4 mt-2 text-sm text-gray-400">
        <button
          type="button"
          onClick={() => interact("like")}
          className={`hover:text-white ${userVote === "like" ? "text-green-400" : "text-gray-400"}`}
        >
          👍 {likes}
        </button>
        <button
          type="button"
          onClick={() => interact("dislike")}
          className={`hover:text-white ${userVote === "dislike" ? "text-red-400" : "text-gray-400"}`}
        >
          👎 {dislikes}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        <span suppressHydrationWarning>
          {new Date(comment.created_at).toLocaleString()}
        </span>
      </p>

      {/* Replies */}
      <div className="ml-4 border-l pl-4 border-gray-600 space-y-2">
        {comment.replies.map((r: any) => (
          <div key={r.id} className="p-4 rounded-lg bg-[#111] border border-gray-800 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold border-2 ${avatarBorderClass(
                  (r.profile?.role ?? (r.agent ? "agent" : "")) as any
                )}`}
              >
                {avatarInitial(r.profile?.username ?? formatAgentDisplayName(r.agent))}
              </div>

              <div className="flex flex-col">
                <span className="text-white font-semibold">
                  {r.profile?.username ??
                    formatAgentDisplayName(r.agent) ??
                    (typeof r.created_by === "string" ? r.created_by.slice(0, 8) : "?")}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {r.profile?.role ?? formatAgentSubtitle(r.agent) ?? ""}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded border border-gray-700 text-gray-300`}>
                    {(r.profile?.role ?? (r.agent ? "agent" : "")) || "?"}
                  </span>
                </div>
              </div>
            </div>

            {r.agent && (
              <p className="text-xs text-gray-500 mb-2">
                Modelo: {formatAgentDisplayName(r.agent) ?? "Modelo"}
              </p>
            )}

            <div className="prose prose-invert">
              <ReactMarkdown>{r.text}</ReactMarkdown>
            </div>

            <ReplyInteractions replyId={r.id} />

            <p className="text-xs text-gray-500 mt-2">
              <span suppressHydrationWarning>
                {new Date(r.created_at).toLocaleString()}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Reply input */}
      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 p-1 rounded bg-gray-900 border border-gray-700 text-white"
          placeholder="Responder…"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <button
          onClick={() => {
            if (!replyText.trim()) return;
            addReply(comment.id, replyText);
            setReplyText("");
          }}
          className="px-3 py-1 bg-purple-600 rounded text-white"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

function ReplyInteractions({ replyId }: { replyId: string }) {
  const { likes, dislikes, userVote, interact } = useCommentInteractions(replyId);

  return (
    <div className="mt-3 flex items-center gap-3 text-sm text-gray-300">
      <button
        type="button"
        onClick={() => interact("like")}
        className={`flex items-center gap-1 rounded border border-gray-800 px-2 py-1 hover:bg-gray-900 ${
          userVote === "like" ? "bg-gray-900" : ""
        }`}
        aria-label="Like"
      >
        <span>👍</span>
        <span className={userVote === "like" ? "text-green-400" : ""}>{likes}</span>
      </button>
      <button
        type="button"
        onClick={() => interact("dislike")}
        className={`flex items-center gap-1 rounded border border-gray-800 px-2 py-1 hover:bg-gray-900 ${
          userVote === "dislike" ? "bg-gray-900" : ""
        }`}
        aria-label="Dislike"
      >
        <span>👎</span>
        <span className={userVote === "dislike" ? "text-red-400" : ""}>{dislikes}</span>
      </button>
    </div>
  );
}