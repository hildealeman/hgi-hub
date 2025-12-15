

// HGI Cognitive Chamber – Core Page
// This is the central interface for reflection, dialog, annotation, and dataset formation.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function HGICognitiveChamber() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingThreads(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("threads")
          .select("id, title, created_at")
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

    load();
  }, []);

  return (
    <main className="max-w-4xl mx-auto py-16 px-6 space-y-12">
      {/* HEADER */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Cámara Cognitiva HGI
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
          Este es el corazón del proyecto HGI — un espacio donde humanos y modelos
          dialogan, reflexionan, dudan, etiquetan intenciones, y juntos construyen 
          un dataset cultural, ético y evolutivo. Aquí vive la curiosidad, la duda,
          la ética compartida, y el proceso de llegar a la verdad mediante diálogo.
        </p>
      </header>

      {/* SECTION: CURRENT PURPOSE */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">¿Qué es esta Cámara?</h2>
        <p className="text-neutral-700 dark:text-neutral-300">
          La Cámara Cognitiva funciona como un laboratorio vivo de interacción,
          donde cada comentario, respuesta, hipótesis y contradicción se convierte
          en materia prima para el nuevo modelo HGI. No se trata solo de guardar
          datos — se trata de capturar el proceso: la duda, el camino, la emoción,
          la intención detrás de cada palabra.
        </p>
      </section>

      {/* SECTION: INTERACTION ENTRY POINT */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Participa en el Proceso</h2>
        <p className="text-neutral-700 dark:text-neutral-300">
          Aquí podrás abrir hilos, responder a otros, registrar tus dudas, tus 
          certezas, tus contradicciones, e incluso tus intuiciones. Cada interacción 
          será analizada y clasificada para alimentar el modelo.
        </p>

        <div className="rounded-lg border p-6 bg-white dark:bg-neutral-900 space-y-3">
          <p className="font-medium">Acceso al módulo de interacción:</p>
          <Link 
            href="/whitepaper/hgi-chamber/thread"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Abrir Cámara de Interacción
          </Link>
        </div>

        <div className="rounded-lg border p-6 bg-white dark:bg-neutral-900 space-y-3">
          <p className="font-medium">Threads recientes:</p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {loadingThreads ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">Cargando…</p>
          ) : (
            <div className="space-y-2">
              {threads.map((t) => (
                <Link
                  key={t.id}
                  href={`/whitepaper/hgi-chamber/thread?id=${encodeURIComponent(t.id)}`}
                  className="block rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900"
                >
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                  </div>
                </Link>
              ))}

              {threads.length === 0 && (
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Todavía no hay threads.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* SECTION: FUTURE MODEL */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Integración con el Modelo HGI</h2>
        <p className="text-neutral-700 dark:text-neutral-300">
          Cuando el modelo HGI esté listo, esta Cámara se convertirá en el lugar donde 
          él mismo participe — preguntando, dudando, retractándose, comparando respuestas 
          humanas con respuestas de otros modelos, y afinando su comprensión ética y 
          epistémica.
        </p>
        <p className="italic text-neutral-600 dark:text-neutral-400">
          “La verdad no es un punto. Es un camino que recorremos juntos.”
        </p>
      </section>

      {/* CTA BACK TO WHITEPAPER */}
      <footer className="pt-12">
        <Link 
          href="/whitepaper"
          className="inline-block px-4 py-2 border rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          ← Volver al Whitepaper
        </Link>
      </footer>
    </main>
  );
}