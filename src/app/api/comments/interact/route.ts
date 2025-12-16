import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type InteractionType = "upvote" | "downvote";

interface Body {
  comment_id?: string;
  type?: InteractionType;
}

async function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[HGI Hub] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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

async function getTotals(supabase: any, commentId: string) {
  const { data, error } = await supabase
    .from("comment_interactions")
    .select("type")
    .eq("comment_id", commentId);

  if (error) throw error;

  const rows = (data ?? []) as Array<{ type: InteractionType }>;
  const upvotes = rows.filter((r) => r.type === "upvote").length;
  const downvotes = rows.filter((r) => r.type === "downvote").length;

  return { upvotes, downvotes };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const commentId = url.searchParams.get("comment_id");

    if (!commentId) {
      return NextResponse.json({ message: "Falta comment_id" }, { status: 400 });
    }

    const supabase = await getServerSupabase();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("[HGI Hub] Error leyendo sesión", userError);
    }

    const totals = await getTotals(supabase, commentId);

    let userVote: InteractionType | null = null;
    if (user?.id) {
      const { data: row, error } = await supabase
        .from("comment_interactions")
        .select("type")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[HGI Hub] Error leyendo interacción del usuario", error);
      } else {
        userVote = (row?.type as InteractionType) ?? null;
      }
    }

    return NextResponse.json({ ...totals, userVote }, { status: 200 });
  } catch (error) {
    console.error("[HGI Hub] Error en GET /api/comments/interact", error);
    return NextResponse.json(
      { message: "No pudimos cargar interacciones." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const commentId = body.comment_id;
    const type = body.type;

    if (!commentId || (type !== "upvote" && type !== "downvote")) {
      return NextResponse.json(
        { message: "Falta comment_id o type" },
        { status: 400 }
      );
    }

    const supabase = await getServerSupabase();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("[HGI Hub] Error leyendo sesión", userError);
    }

    if (!user) {
      return NextResponse.json(
        { message: "Necesitas iniciar sesión para votar." },
        { status: 401 }
      );
    }

    const { error: upsertError } = await supabase
      .from("comment_interactions")
      .upsert(
        {
          comment_id: commentId,
          user_id: user.id,
          type,
        },
        { onConflict: "comment_id,user_id" }
      );

    if (upsertError) {
      console.error("[HGI Hub] Error registrando interacción", upsertError);
      return NextResponse.json(
        { message: "No pudimos registrar tu interacción." },
        { status: 500 }
      );
    }

    const totals = await getTotals(supabase, commentId);
    return NextResponse.json(totals, { status: 200 });
  } catch (error) {
    console.error("[HGI Hub] Error en POST /api/comments/interact", error);
    return NextResponse.json(
      { message: "No pudimos registrar tu interacción." },
      { status: 500 }
    );
  }
}
