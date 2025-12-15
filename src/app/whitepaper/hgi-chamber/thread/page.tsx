"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
      .select("id, thread_id, parent_comment_id, created_by, text, created_at")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      setError("No pudimos cargar los comentarios.");
      setLoadingComments(false);
      return;
    }

    setComments(structureThread(data));
    setLoadingComments(false);
  };

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
        parent_comment_id: null,
        text: input,
        created_by: user.id,
      })
      .select("id, thread_id, parent_comment_id, created_by, text, created_at")
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      setError("No pudimos guardar tu comentario.");
      return;
    }

    setInput("");
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

    const { error } = await supabase.from("comments").insert({
      thread_id: threadId,
      parent_comment_id: parentId,
      text: replyText,
      created_by: user.id,
    });

    if (error) {
      console.error("Error adding reply:", error);
      setError("No pudimos guardar tu respuesta.");
      return;
    }

    fetchComments();
  };

  // ────────────────────────────────────────────────
  // Convert flat comments into threaded structure
  // ────────────────────────────────────────────────
  function structureThread(list: any[]) {
    const map: any = {};
    const roots: any[] = [];

    list.forEach((c) => {
      map[c.id] = { ...c, replies: [] };
    });

    list.forEach((c) => {
      if (c.parent_comment_id) {
        map[c.parent_comment_id]?.replies.push(map[c.id]);
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

  return (
    <div className="border border-gray-700 p-4 rounded bg-gray-800 space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-white">{comment.text}</p>
      </div>

      <div className="text-xs text-gray-400">
        {new Date(comment.created_at).toLocaleString()}
      </div>

      {/* Replies */}
      <div className="ml-4 border-l pl-4 border-gray-600 space-y-2">
        {comment.replies.map((r: any) => (
          <div key={r.id} className="text-gray-300 text-sm">
            {r.text}
            <div className="text-xs text-gray-500">
              {new Date(r.created_at).toLocaleString()}
            </div>
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