"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <header className="border-b border-zinc-800 bg-black/80 text-zinc-50 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="text-zinc-50">HGI Hub</span>
          <span className="ml-2 text-xs text-zinc-400">beta humana</span>
        </Link>
        <ul className="flex items-center gap-3 text-sm">
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
          <li>
            <Link
              href="/login"
              className="rounded-full bg-zinc-50 px-3 py-1 text-xs font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Iniciar sesión
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
