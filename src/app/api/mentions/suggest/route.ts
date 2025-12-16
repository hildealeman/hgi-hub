import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

async function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "[HGI Hub] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, serviceRoleKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });
}

const SYSTEM_ENTITIES: Array<{ key: string; label: string }> = [
  { key: "memoria", label: "Memoria" },
  { key: "critico", label: "Crítico" },
  { key: "reflexion", label: "Reflexión" },
  { key: "admin", label: "Admin" },
  { key: "mod", label: "Moderación" },
  { key: "sistema", label: "Sistema" },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawPrefix = url.searchParams.get("prefix") ?? "";

    if (!rawPrefix || typeof rawPrefix !== "string") {
      return NextResponse.json(
        { message: "Falta prefix" },
        { status: 400 }
      );
    }

    if (!/^@[A-Za-z0-9_\-]*$/.test(rawPrefix)) {
      return NextResponse.json(
        { message: "prefix inválido" },
        { status: 400 }
      );
    }

    const prefix = rawPrefix.replace(/^@/, "").trim();
    if (!prefix) {
      return NextResponse.json(
        {
          agents: [],
          humans: [],
          system: SYSTEM_ENTITIES,
        },
        { status: 200 }
      );
    }

    const supabase = await getServerSupabase();

    const [agentsRes, profilesRes] = await Promise.all([
      supabase
        .from("agents")
        .select("id, name")
        .ilike("name", `${prefix}%`)
        .order("name", { ascending: true })
        .limit(10),
      supabase
        .from("profiles")
        .select("id, username")
        .ilike("username", `${prefix}%`)
        .order("username", { ascending: true })
        .limit(10),
    ]);

    const system = SYSTEM_ENTITIES.filter((e) =>
      e.key.toLowerCase().startsWith(prefix.toLowerCase())
    );

    return NextResponse.json(
      {
        agents: (agentsRes.data ?? []).filter((a: any) => a?.id && a?.name),
        humans: (profilesRes.data ?? []).filter((p: any) => p?.id && p?.username),
        system,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[HGI Hub] Error en GET /api/mentions/suggest", error);
    return NextResponse.json(
      { agents: [], humans: [], system: [] },
      { status: 200 }
    );
  }
}
