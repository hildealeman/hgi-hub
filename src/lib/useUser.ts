"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

interface UserState {
  loading: boolean;
  user: import("@supabase/supabase-js").User | null;
}

// Hook mínimo para saber si hay sesión activa en cliente.
export function useUser(): UserState {
  const [state, setState] = useState<UserState>({ loading: true, user: null });

  useEffect(() => {
    let isMounted = true;

    const supabase = getSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!isMounted) return;
      setState({ loading: false, user: data.user ?? null });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setState({ loading: false, user: session?.user ?? null });
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
