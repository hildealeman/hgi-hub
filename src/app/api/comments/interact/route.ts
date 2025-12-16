import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type InteractionType = "like" | "dislike";

interface Body {
  comment_id?: string;
  interaction?: InteractionType;
  // backward-compat
  type?: string;
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
    .select("interaction")
    .eq("comment_id", commentId);

  if (error) throw error;

  const rows = (data ?? []) as Array<{ interaction: InteractionType }>;
  const likes = rows.filter((r) => r.interaction === "like").length;
  const dislikes = rows.filter((r) => r.interaction === "dislike").length;

  return { likes, dislikes };
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
        .select("interaction")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[HGI Hub] Error leyendo interacción del usuario", error);
      } else {
        userVote = (row?.interaction as InteractionType) ?? null;
      }
    }

    // Keep backward-compatible keys expected by existing UI code.
    return NextResponse.json(
      {
        ...totals,
        userVote,
        upvotes: totals.likes,
        downvotes: totals.dislikes,
      },
      { status: 200 }
    );
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
    const interaction = body.interaction;

    if (!commentId || (interaction !== "like" && interaction !== "dislike")) {
      return NextResponse.json(
        { message: "Falta comment_id o interaction" },
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

    const { data: existing, error: existingError } = await supabase
      .from("comment_interactions")
      .select("id, interaction")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      console.error("[HGI Hub] Error leyendo interacción existente", existingError);
      return NextResponse.json(
        { message: "No pudimos registrar tu interacción." },
        { status: 500 }
      );
    }

    if (existing?.id) {
      const current = existing.interaction as InteractionType | null;

      if (current === interaction) {
        // toggle off
        const { error: deleteError } = await supabase
          .from("comment_interactions")
          .delete()
          .eq("id", existing.id);

        if (deleteError) {
          console.error("[HGI Hub] Error eliminando interacción", deleteError);
          return NextResponse.json(
            { message: "No pudimos registrar tu interacción." },
            { status: 500 }
          );
        }
      } else {
        // switch
        const { error: updateError } = await supabase
          .from("comment_interactions")
          .update({ interaction })
          .eq("id", existing.id);

        if (updateError) {
          console.error("[HGI Hub] Error actualizando interacción", updateError);
          return NextResponse.json(
            { message: "No pudimos registrar tu interacción." },
            { status: 500 }
          );
        }
      }
    } else {
      const { error: insertError } = await supabase
        .from("comment_interactions")
        .insert({ comment_id: commentId, user_id: user.id, interaction });

      if (insertError) {
        console.error("[HGI Hub] Error insertando interacción", insertError);
        return NextResponse.json(
          { message: "No pudimos registrar tu interacción." },
          { status: 500 }
        );
      }
    }

    const totals = await getTotals(supabase, commentId);
    return NextResponse.json(
      {
        ...totals,
        upvotes: totals.likes,
        downvotes: totals.dislikes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[HGI Hub] Error en POST /api/comments/interact", error);
    return NextResponse.json(
      { message: "No pudimos registrar tu interacción." },
      { status: 500 }
    );
  }
}
