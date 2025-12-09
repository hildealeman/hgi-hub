"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/Card";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useUser } from "@/lib/useUser";

type Origin = "original" | "ai_accepted" | "edited_after_ai" | "debated_with_ai";

interface Post {
  id: number;
  content: string;
  upvotes: number;
  downvotes: number;
  origin: Origin;
  author_type: "human" | "model";
}

function getOutlineClass(origin: Origin) {
  switch (origin) {
    case "original":
      return "ring-1 ring-sky-500/70"; // azul
    case "ai_accepted":
      return "ring-1 ring-emerald-500/70"; // verde
    case "edited_after_ai":
      return "ring-1 ring-amber-400/70"; // amarillo
    case "debated_with_ai":
      return "ring-2 ring-offset-2 ring-offset-zinc-950 ring-fuchsia-400"; // arcoíris simplificado
  }
}

export function QueEsHGICard() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [originChoice, setOriginChoice] = useState<Origin>("original");

  const { user } = useUser();

  const orderedPosts = useMemo(() => {
    const positive = [...posts].sort((a, b) => b.upvotes - a.upvotes);
    const negative = [...posts]
      .filter((p) => p.downvotes > 0)
      .sort((a, b) => b.downvotes - a.downvotes);
    return { positive, negative };
  }, [posts]);

  useEffect(() => {
    if (!open) return;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      setError(null);
      try {
        const supabase = getSupabaseClient();

        // Buscar topic por slug
        const { data: topic, error: topicError } = await supabase
          .from("topics")
          .select("id")
          .eq("slug", "home-que-es-hgi")
          .single();

        if (topicError || !topic) {
          setError("No pudimos cargar el topic de HGI.");
          return;
        }

        const { data, error: postsError } = await supabase
          .from("posts")
          .select("id, content, upvotes, downvotes, origin, author_type")
          .eq("topic_id", topic.id)
          .order("upvotes", { ascending: false });

        if (postsError) {
          console.error("Error cargando posts", postsError);
          setError("No pudimos cargar los comentarios todavía.");
          return;
        }

        setPosts((data as Post[]) ?? []);
      } catch (err) {
        console.error(err);
        setError("Algo se rompió al cargar la conversación.");
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [open]);

  const handleAskAI = async () => {
    if (!draft.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);
    setAiExplanation(null);
    try {
      const res = await fetch("/api/moderar-comentario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft }),
      });

      if (!res.ok) {
        throw new Error("Respuesta no OK de la IA");
      }

      const json = await res.json();
      setAiSuggestion(json.suggested ?? null);
      setAiExplanation(json.explanation ?? null);
      setOriginChoice("ai_accepted");
    } catch (err) {
      console.error(err);
      setError("La IA no pudo revisar tu comentario ahorita.");
    } finally {
      setAiLoading(false);
    }
  };

  const handlePublish = async (mode: Origin) => {
    if (!draft.trim() && !(mode === "ai_accepted" && aiSuggestion)) return;
    if (!user) {
      setError("Necesitas iniciar sesión para comentar.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();

      const { data: topic, error: topicError } = await supabase
        .from("topics")
        .select("id")
        .eq("slug", "home-que-es-hgi")
        .single();

      if (topicError || !topic) {
        setError("No encontramos el topic para guardar tu comentario.");
        return;
      }

      const finalContent = mode === "ai_accepted" && aiSuggestion ? aiSuggestion : draft;

      const { error: insertError } = await supabase.from("posts").insert({
        topic_id: topic.id,
        author_id: user.id,
        author_type: "human",
        content: finalContent,
        origin: mode,
      });

      if (insertError) {
        console.error(insertError);
        setError("No pudimos guardar tu comentario.");
        return;
      }

      // reload posts
      const { data, error: postsError } = await supabase
        .from("posts")
        .select("id, content, upvotes, downvotes, origin, author_type")
        .eq("topic_id", topic.id)
        .order("upvotes", { ascending: false });

      if (!postsError && data) {
        setPosts(data as Post[]);
      }

      setDraft("");
      setAiSuggestion(null);
      setAiExplanation(null);
      setOriginChoice("original");
    } catch (err) {
      console.error(err);
      setError("Algo se rompió al publicar tu comentario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left"
      >
        <Card title="¿Qué es HGI?">
          <p>
            Human-Grounded Intelligence es una capa entre los modelos actuales y la
            idea de AGI. No es otra buzzword: es una postura. Creamos sistemas que
            parten del humano real, no de un usuario imaginario perfecto.
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            Traducción libre: dejamos de tratar al humano como un input ruidoso y lo
            ponemos al centro del diseño.
          </p>
          <p className="mt-4 text-xs text-zinc-500">
            Haz clic para abrir la conversación alrededor de esta idea.
          </p>
        </Card>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="fixed inset-0 z-[-1] bg-black/70"
              onClick={() => setOpen(false)}
            />

            <motion.div
              layout
              className="relative flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/95 shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ type: "spring", stiffness: 210, damping: 24 }}
            >
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 sm:px-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                    Conversación HGI
                  </p>
                  <h2 className="text-sm font-semibold text-zinc-50 sm:text-base">
                    ¿Qué es HGI?
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-50"
                >
                  Cerrar
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 sm:flex-row sm:p-6">
                <div className="sm:w-1/2 space-y-3 overflow-y-auto pr-1">
                  <p className="text-sm text-zinc-200">
                    Human-Grounded Intelligence es una capa entre los modelos actuales
                    y la idea de AGI. No es otra buzzword: es una postura. Creamos
                    sistemas que parten del humano real, no de un usuario imaginario
                    perfecto.
                  </p>
                  <p className="text-xs text-zinc-400">
                    Traducción libre: dejamos de tratar al humano como un input ruidoso
                    y lo ponemos al centro del diseño.
                  </p>
                  <p className="text-xs text-zinc-500">
                    Aquí se junta lo que digan humanos y modelos sobre esta pregunta.
                    Tus comentarios ayudan a definir qué significa HGI en la práctica.
                  </p>
                </div>

                <div className="sm:w-1/2 flex flex-1 flex-col gap-3 overflow-y-auto">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Conversación en vivo</span>
                    {loadingPosts && <span>Cargando comentarios…</span>}
                  </div>

                  {error && (
                    <p className="text-xs text-rose-400">{error}</p>
                  )}

                  {!loadingPosts && orderedPosts.positive.length === 0 && (
                    <p className="text-xs text-zinc-500">
                      Nadie ha abierto la conversación todavía. Tu comentario puede ser
                      el primero.
                    </p>
                  )}

                  {orderedPosts.positive.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                        Comentarios más útiles
                      </p>
                      {orderedPosts.positive.map((comment) => (
                        <div
                          key={comment.id}
                          className={`rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-100 ${getOutlineClass(
                            comment.origin,
                          )}`}
                        >
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-medium text-zinc-200">
                              {comment.author_type === "model"
                                ? "Modelo HGI"
                                : "Alguien de la comunidad"}
                            </span>
                            <span className="text-zinc-500">
                              ▲ {comment.upvotes} · ▼ {comment.downvotes}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-200 sm:text-sm">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {orderedPosts.negative.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                        Comentarios más cuestionados
                      </p>
                      {orderedPosts.negative.map((comment) => (
                        <div
                          key={comment.id}
                          className={`rounded-2xl border border-zinc-900 bg-zinc-950/60 p-3 text-sm text-zinc-100 ${getOutlineClass(
                            comment.origin,
                          )}`}
                        >
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-medium text-zinc-200">
                              {comment.author_type === "model"
                                ? "Modelo HGI"
                                : "Alguien de la comunidad"}
                            </span>
                            <span className="text-zinc-500">
                              ▲ {comment.upvotes} · ▼ {comment.downvotes}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-200 sm:text-sm">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-200">
                    <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                      Tu comentario
                    </p>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                      placeholder="¿Cómo explicarías tú qué es HGI, desde tu trinchera?"
                    />

                    {aiExplanation && (
                      <p className="text-[11px] text-emerald-400">
                        IA: {aiExplanation}
                      </p>
                    )}

                    {aiSuggestion && (
                      <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/5 p-2 text-[11px] text-zinc-100">
                        <p className="mb-1 font-medium text-emerald-300">
                          Versión sugerida por la IA
                        </p>
                        <p>{aiSuggestion}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                      <button
                        type="button"
                        onClick={handleAskAI}
                        disabled={aiLoading || !draft.trim()}
                        className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-200 transition-colors hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {aiLoading ? "Pidiendo ayuda a la IA…" : "Pedir sugerencia a la IA"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePublish("original")}
                        disabled={loading || !draft.trim()}
                        className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Publicar tal cual (azul)
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePublish("ai_accepted")}
                        disabled={loading || !aiSuggestion}
                        className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Publicar versión IA (verde)
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePublish("edited_after_ai")}
                        disabled={loading || !draft.trim()}
                        className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Publicar nueva versión (amarillo)
                      </button>
                    </div>

                    <p className="pt-1 text-[10px] text-zinc-500">
                      Más adelante activamos el modo arcoíris, donde puedes debatir con
                      la IA sobre cómo decirlo antes de publicar.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
