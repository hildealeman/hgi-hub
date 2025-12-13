"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/Card";

interface ThreadComment {
  id: string;
  authorType: "human" | "model";
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

interface ThreadData {
  section: string;
  comments: ThreadComment[];
}

interface ThreadDiscussionProps {
  section: string;
  sectionTitle: string;
}

export function ThreadDiscussion({ section, sectionTitle }: ThreadDiscussionProps) {
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [modelLoading, setModelLoading] = useState(false);

  const ordered = useMemo(() => {
    if (!thread) return [];
    return [...thread.comments].sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  }, [thread]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/threads/${section}`, { method: "GET" });
      if (!res.ok) {
        throw new Error("No pudimos cargar el thread");
      }
      const json = (await res.json()) as ThreadData;
      setThread(json);
    } catch (e) {
      console.error(e);
      setError("No pudimos cargar la discusión ahorita.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const handlePost = async () => {
    const content = draft.trim();
    if (!content) return;

    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/threads/${section}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, authorType: "human" }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        setError(data?.message ?? "No pudimos guardar tu comentario.");
        return;
      }

      setDraft("");
      await load();
    } catch (e) {
      console.error(e);
      setError("No pudimos guardar tu comentario.");
    } finally {
      setPosting(false);
    }
  };

  const handleVote = async (id: string, direction: "up" | "down") => {
    if (votingId) return;
    setVotingId(id);
    setError(null);

    try {
      const res = await fetch(`/api/threads/${section}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, direction }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        setError(data?.message ?? "No pudimos registrar tu voto.");
        return;
      }

      await load();
    } catch (e) {
      console.error(e);
      setError("No pudimos registrar tu voto.");
    } finally {
      setVotingId(null);
    }
  };

  const handleModelComment = async () => {
    if (modelLoading) return;
    setModelLoading(true);
    setError(null);

    try {
      const seed = ordered.slice(0, 3).map((c) => c.content).join("\n---\n");
      const res = await fetch(`/api/threads/${section}/model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed, sectionTitle }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        setError(data?.message ?? "No pudimos generar comentario del modelo.");
        return;
      }

      await load();
    } catch (e) {
      console.error(e);
      setError("No pudimos generar comentario del modelo.");
    } finally {
      setModelLoading(false);
    }
  };

  return (
    <Card title="Foro de esta sección" subtle>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-zinc-400">
            Thread: <span className="font-medium text-zinc-200">{section}</span>
          </p>
          <button
            type="button"
            onClick={handleModelComment}
            disabled={modelLoading}
            className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200 transition-colors hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {modelLoading ? "Generando comentario…" : "Pedir comentario del modelo"}
          </button>
        </div>

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Tu comentario</p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            className="mt-2 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
            placeholder="Trae una crítica, una pregunta o un contraejemplo. Sin humo."
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePost}
              disabled={posting || !draft.trim()}
              className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {posting ? "Publicando…" : "Publicar"}
            </button>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200 transition-colors hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Refrescando…" : "Refrescar"}
            </button>
          </div>
        </div>

        {thread && ordered.length === 0 && (
          <p className="text-xs text-zinc-500">Aún no hay comentarios. Abre la conversación.</p>
        )}

        <div className="space-y-2">
          {thread &&
            ordered.map((c) => (
              <div key={c.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-zinc-200">
                      {c.authorType === "model" ? "Modelo HGI" : "Humano"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-xs text-zinc-100 sm:text-sm">{c.content}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-[11px] text-zinc-500">
                      ▲ {c.upvotes} · ▼ {c.downvotes}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleVote(c.id, "up")}
                        disabled={!!votingId}
                        className="rounded-full border border-zinc-700 px-2 py-1 text-[11px] text-zinc-200 transition-colors hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Upvote
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVote(c.id, "down")}
                        disabled={!!votingId}
                        className="rounded-full border border-zinc-700 px-2 py-1 text-[11px] text-zinc-200 transition-colors hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Downvote
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
}
