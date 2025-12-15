"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client (client-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ThreadPage() {
  const [threadTitle, setThreadTitle] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [loadingThread, setLoadingThread] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const emotions = [
    { key: "love", label: "❤️ Love" },
    { key: "doubt", label: "❓ Doubt" },
    { key: "anger", label: "🔥 Anger" },
    { key: "support", label: "🤝 Support" },
    { key: "insight", label: "💡 Insight" },
    { key: "clarity", label: "✨ Clarity" },
  ];

  // ────────────────────────────────────────────────
  // 1. Create thread
  // ────────────────────────────────────────────────
  const createThread = async () => {
    if (!threadTitle.trim()) return;
    setLoadingThread(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("threads")
      .insert({
        title: threadTitle,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating thread:", error);
      setLoadingThread(false);
      return;
    }

    setThreadId(data.id);
    setLoadingThread(false);
  };

  // ────────────────────────────────────────────────
  // 2. Fetch comments for thread
  // ────────────────────────────────────────────────
  const fetchComments = async () => {
    if (!threadId) return;

    setLoadingComments(true);

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      setLoadingComments(false);
      return;
    }

    setComments(structureThread(data));
    setLoadingComments(false);
  };

  useEffect(() => {
    fetchComments();
  }, [threadId]);

  // ────────────────────────────────────────────────
  // 3. Add a new comment
  // ────────────────────────────────────────────────
  const addComment = async () => {
    if (!input.trim() || !threadId) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const start = Date.now();

    const { data, error } = await supabase
      .from("comments")
      .insert({
        thread_id: threadId,
        text: input,
        emotion: selectedEmotion || null,
        created_by: user?.id || null,
        response_time_ms: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      return;
    }

    // Update response time
    const rt = Date.now() - start;
    await supabase
      .from("comments")
      .update({ response_time_ms: rt })
      .eq("id", data.id);

    setInput("");
    setSelectedEmotion("");
    fetchComments();
  };

  // ────────────────────────────────────────────────
  // 4. Add reply (child comment)
  // ────────────────────────────────────────────────
  const addReply = async (parentId: string, replyText: string) => {
    if (!replyText.trim() || !threadId) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const start = Date.now();

    await supabase.from("comments").insert({
      thread_id: threadId,
      parent_comment_id: parentId,
      text: replyText,
      created_by: user?.id || null,
      response_time_ms: 0,
    });

    const rt = Date.now() - start;

    await supabase
      .from("comments")
      .update({ response_time_ms: rt })
      .eq("parent_comment_id", parentId);

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

          <div className="flex flex-wrap gap-2">
            {emotions.map((emo) => (
              <button
                key={emo.key}
                onClick={() => setSelectedEmotion(emo.key)}
                className={`px-3 py-1 rounded border ${
                  selectedEmotion === emo.key
                    ? "bg-purple-600 border-purple-400"
                    : "bg-gray-800 border-gray-600"
                }`}
              >
                {emo.label}
              </button>
            ))}
          </div>

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
                <CommentCard key={c.id} comment={c} addReply={addReply} />
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
        {comment.emotion && (
          <span className="text-lg">{emotionToEmoji(comment.emotion)}</span>
        )}
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

// Emotion mapping
function emotionToEmoji(e: string) {
  const map: any = {
    love: "❤️",
    doubt: "❓",
    anger: "🔥",
    support: "🤝",
    insight: "💡",
    clarity: "✨",
  };
  return map[e] || "💭";
}