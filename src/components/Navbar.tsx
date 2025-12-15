"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/lib/useUser";

const navItems: { href: string; label: string }[] = [
  { href: "/", label: "Inicio" },
  { href: "/manifiesto", label: "Manifiesto" },
  { href: "/prompt-101", label: "Prompt 101" },
  { href: "/bibliografia", label: "Bibliografía" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/whitepaper", label: "Whitepaper" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setMobileOpen(false);
  };

  return (
    <header className="border-b border-zinc-800 bg-black/80 text-zinc-50 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="text-zinc-50">HGI Hub</span>
          <span className="ml-2 text-xs text-zinc-400">beta humana</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-xs text-zinc-200 transition-colors hover:border-zinc-600 sm:hidden"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            <span className="sr-only">Menú</span>
            <span className="block h-3 w-4">
              <span
                className={`block h-[2px] w-full rounded bg-current transition-transform duration-200 ${
                  mobileOpen ? "translate-y-[5px] rotate-45" : "" 
                }`}
              />
              <span
                className={`mt-[3px] block h-[2px] w-full rounded bg-current transition-opacity duration-200 ${
                  mobileOpen ? "opacity-0" : "opacity-100" 
                }`}
              />
              <span
                className={`mt-[3px] block h-[2px] w-full rounded bg-current transition-transform duration-200 ${
                  mobileOpen ? "-translate-y-[5px] -rotate-45" : "" 
                }`}
              />
            </span>
          </button>

          <ul className="hidden items-center gap-3 text-sm sm:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`rounded-full px-3 py-1 transition-colors hover:bg-zinc-800/80 ${
                    isActive ? "bg-zinc-800 text-zinc-50" : "text-zinc-300"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          {!loading && !user && (
            <>
              <li>
                <Link
                  href="/login?mode=login"
                  className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-100 transition-colors hover:border-zinc-500"
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  href="/login?mode=signup"
                  className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-zinc-200"
                >
                  Crear cuenta
                </Link>
              </li>
            </>
          )}

          {!loading && user && (
            <li className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden max-w-[180px] truncate text-xs text-zinc-300 hover:text-zinc-50 sm:inline"
                title={user.email ?? "Sesión activa"}
              >
                {user.email ?? "Sesión activa"}
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-100 transition-colors hover:border-zinc-500"
              >
                Cerrar sesión
              </button>
            </li>
          )}
        </ul>
      </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-zinc-800 bg-black/90 sm:hidden">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <div className="grid gap-2">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-zinc-800 text-zinc-50"
                        : "text-zinc-200 hover:bg-zinc-800/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="mt-2 flex flex-col gap-2 border-t border-zinc-800 pt-3">
                {!loading && !user && (
                  <>
                    <Link
                      href="/login?mode=login"
                      className="rounded-full border border-zinc-700 px-4 py-2 text-center text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-500"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      href="/login?mode=signup"
                      className="rounded-full bg-zinc-50 px-4 py-2 text-center text-sm font-medium text-black transition-colors hover:bg-zinc-200"
                    >
                      Crear cuenta
                    </Link>
                  </>
                )}

                {!loading && user && (
                  <>
                    <Link
                      href="/login"
                      className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-200"
                      title={user.email ?? "Sesión activa"}
                    >
                      {user.email ?? "Sesión activa"}
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="rounded-full border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition-colors hover:border-zinc-500"
                    >
                      Cerrar sesión
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
