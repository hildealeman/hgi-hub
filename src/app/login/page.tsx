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

  const handleSignOut = async () => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("No pudimos cerrar tu sesión ahorita. Intenta de nuevo, porfa.");
    } finally {
      setSubmitting(false);
    }
  };

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
        title={user ? "Tu sesión en HGI Hub" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        eyebrow="auth sencilla, sin circo y sin humo"
      >
        {user
          ? "Aquí ves el estado de tu sesión y cómo se conecta con los foros y herramientas HGI. Nada de panel corporativo infinito: solo lo que importa."
          : "Este módulo usa Supabase Auth con correo y contraseña. Puedes iniciar sesión si ya tienes cuenta o crear una nueva para sumarte a las herramientas HGI."}
      </SectionTitle>

      <div className="grid gap-6 md:grid-cols-[3fr,2fr]">
        <Card title="Tu sesión HGI">
          {user ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
                <p className="text-emerald-300" title="Sesión activa con Supabase Auth">
                  Sesión activa con <span className="font-medium text-emerald-200">{user.email}</span>.
                </p>
                <p className="mt-1 text-xs text-emerald-200/80">
                  Desde aquí puedes seguir explorando HGI Hub, participar en foros y luego montamos el /admin bonito.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3" aria-label="Resumen rápido de tu cuenta">
                <div
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 text-xs"
                  title="Conteo aproximado de topics en los que puedes participar"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    Foros HGI
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-50">6+</p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Conversaciones activas sobre HGI, prompts y comunidad.
                  </p>
                </div>

                <div
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 text-xs"
                  title="Aquí más adelante contaremos tus aportes reales"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    Tus aportes
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-50">0</p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Empieza dejando tu primer comentario en cualquier foro.
                  </p>
                </div>

                <div
                  className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 text-xs"
                  title="Indicador simbólico de qué tan metido estás en HGI Hub"
                >
                  <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    Nivel HGI
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-zinc-50">Beta</p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Por ahora todos estamos en fase beta humana, literal.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-100 transition-colors hover:border-zinc-500"
                >
                  Ir al inicio
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/prompt-101")}
                  className="rounded-full border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-100 transition-colors hover:border-zinc-500"
                  title="Explora los nuevos foros de Prompt Engineering HGI"
                >
                  Ver foros de prompts
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={submitting}
                  className="rounded-full bg-zinc-50 px-4 py-2 text-xs font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Cerrando sesión..." : "Cerrar sesión"}
                </button>
              </div>

              {error && (
                <p className="text-sm text-rose-400">{error}</p>
              )}
            </div>
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
            este login y este mini dashboard son la puerta de entrada y el mapa de
            hacia dónde va HGI Hub.
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            Tip: crea usuarios desde el panel de Supabase para probar. Luego le
            vamos poniendo más niveles, métricas reales y vistas de moderación.
          </p>
        </Card>
      </div>
    </PageContainer>
  );
}
