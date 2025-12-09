"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { SectionTitle } from "@/components/SectionTitle";
import { Card } from "@/components/Card";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useUser } from "@/lib/useUser";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useUser();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!/.+@.+\..+/.test(email)) {
      setError("Esto no se ve como un correo válido, eh.");
      return;
    }

    if (!password) {
      setError("Necesitas una contraseña, no leemos mentes todavía.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();

      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(
            "No pudimos iniciar sesión con esos datos. Checa correo/contraseña o crea tu cuenta primero.",
          );
          return;
        }

        router.push("/");
        router.refresh();
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(
            signUpError.message.includes("User already registered")
              ? "Ya existe una cuenta con este correo. Intenta iniciar sesión."
              : "No pudimos crear tu cuenta. Intenta de nuevo o usa otro correo.",
          );
          return;
        }

        if (!data.session) {
          setSuccess(
            "Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.",
          );
        } else {
          setSuccess("Cuenta creada e iniciada. Te mandamos al inicio.");
          router.push("/");
          router.refresh();
        }

        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error(err);
      setError("Algo salió mal… no debería, pero pasó. Intenta de nuevo, porfa.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <SectionTitle
        title={mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        eyebrow="auth sencilla, sin circo y sin humo"
      >
        Este módulo usa Supabase Auth con correo y contraseña. Puedes iniciar sesión
        si ya tienes cuenta o crear una nueva para sumarte a las herramientas HGI.
      </SectionTitle>

      <div className="grid gap-6 md:grid-cols-[3fr,2fr]">
        <Card title="Tu sesión HGI">
          {user ? (
            <p className="text-sm text-emerald-400">
              Ya tienes sesión iniciada con {user.email}. Luego montamos una vista
              /admin para que esto tenga más sentido.
            </p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="inline-flex rounded-full border border-zinc-800 bg-zinc-950 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    mode === "login"
                      ? "bg-zinc-50 text-black"
                      : "text-zinc-300 hover:text-zinc-50"
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                    setSuccess(null);
                  }}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    mode === "signup"
                      ? "bg-zinc-50 text-black"
                      : "text-zinc-300 hover:text-zinc-50"
                  }`}
                >
                  Crear cuenta
                </button>
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-zinc-100">
                  Correo
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.chido"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-zinc-100"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="mínimo algo que no sea 'password'"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
                />
              </div>

              {error && <p className="text-sm text-rose-400">{error}</p>}
              {success && !error && (
                <p className="text-sm text-emerald-400">{success}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-zinc-50 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting
                  ? mode === "login"
                    ? "Entrando..."
                    : "Creando cuenta..."
                  : mode === "login"
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
              </button>
            </form>
          )}
        </Card>

        <Card title="¿Y el /admin qué onda?" subtle>
          <p className="text-sm">
            Más adelante montamos una sección /admin protegida para revisar
            suscripciones, contenido y métricas sin salirnos del browser. Por ahora,
            este login es la puerta de entrada y la estructura para construir sobre
            ella.
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            Tip: crea usuarios desde el panel de Supabase para probar. Luego ya le
            ponemos registro y recuperación de contraseña si hace sentido.
          </p>
        </Card>
      </div>
    </PageContainer>
  );
}
