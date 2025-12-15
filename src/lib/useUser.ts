"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type SupabaseUser = {
  id: string;
  email?: string | null;
};

type SupabaseSession = {
  user: SupabaseUser;
} | null;

interface UserState {
  loading: boolean;
  user: SupabaseUser | null;
}

// Hook mínimo para saber si hay sesión activa en cliente.
export function useUser(): UserState {
  const [state, setState] = useState<UserState>({ loading: true, user: null });

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }: { data: { user: SupabaseUser | null } }) => {
      if (!isMounted) return;
      setState({ loading: false, user: data.user ?? null });
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: string, session: SupabaseSession) => {
        if (!isMounted) return;
        setState({ loading: false, user: session?.user ?? null });
      }
    );

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
