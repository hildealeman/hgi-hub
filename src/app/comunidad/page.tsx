"use client";

import { useState, FormEvent } from "react";
import { PageContainer } from "@/components/PageContainer";
import { SectionTitle } from "@/components/SectionTitle";
import { Card } from "@/components/Card";
import type { RolSuscripcion } from "@/types";

interface FormState {
  email: string;
  nombre: string;
  rol: RolSuscripcion | "";
}

export default function ComunidadPage() {
  const [form, setForm] = useState<FormState>({
    email: "",
    nombre: "",
    rol: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!/.+@.+\..+/.test(form.email)) {
      setError("Esto no se ve como un correo válido, eh.");
      return;
    }

    if (!form.rol) {
      setError("Elige un rol para saber más o menos por dónde vas.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/suscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          nombre: form.nombre || undefined,
          rol: form.rol,
        }),
      });

      const data = (await res.json()) as { message?: string };

      if (!res.ok) {
        setError(
          data.message ??
            "Algo salió mal… no debería, pero pasó. Intenta de nuevo, porfa.",
        );
        return;
      }

      setSuccess(
        data.message ??
          "Listo, te apuntamos. No prometemos spam, prometemos cosas chidas.",
      );
      setForm({ email: "", nombre: "", rol: "" });
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
        title="Comunidad HGI"
        eyebrow="sin culto al héroe, con banda de verdad"
      >
        Aquí se junta la gente que quiere construir IA con los pies en la tierra: devs,
        investigadores, educadores, curiosos y quienes todavía no saben cómo llamarse.
        Déjanos tu correo y rol para mandarte avances, experimentos y convocatorias.
      </SectionTitle>

      <div className="grid gap-6 md:grid-cols-[3fr,2fr]">
        <Card title="Unirte a la comunidad">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-zinc-100">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="tu@correo.chido"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition-colors placeholder:text-zinc-500 focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="nombre" className="text-sm font-medium text-zinc-100">
                Nombre (opcional)
              </label>
              <input
                id="nombre"
                type="text"
                autoComplete="name"
                value={form.nombre}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nombre: e.target.value }))
                }
                placeholder="como te guste que te digan"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition-colors placeholder:text-zinc-500 focus:border-zinc-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="rol" className="text-sm font-medium text-zinc-100">
                Rol
              </label>
              <select
                id="rol"
                value={form.rol}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, rol: e.target.value as RolSuscripcion }))
                }
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 outline-none ring-0 transition-colors focus:border-zinc-500"
              >
                <option value="">Elige tu trinchera</option>
                <option value="dev">Dev</option>
                <option value="investigador">Investigador/a</option>
                <option value="educador">Educador/a</option>
                <option value="curioso">Curioso/a</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {error && (
              <p className="text-sm text-rose-400">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-emerald-400">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-zinc-50 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Guardando..." : "Va, mándame eso"}
            </button>
          </form>
        </Card>

        <Card title="¿Qué puedes esperar?" subtle>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            <li>Updates sobre el whitepaper, el manifiesto y nuevos recursos HGI.</li>
            <li>
              Invitaciones a sesiones de revisión, talleres y pruebas de herramientas.
            </li>
            <li>
              Nada de spam vacío ni promesas de "hazte experto en IA en 7 días".
            </li>
            <li>
              Espacios para traer tus casos reales y destrozar hype con argumentos.
            </li>
          </ul>
          <p className="mt-3 text-xs text-zinc-400">
            Si en algún punto ya no te hace sentido, te bajas y listo. Sin dramas, sin
            mails pasivo-agresivos.
          </p>
        </Card>
      </div>
    </PageContainer>
  );
}
