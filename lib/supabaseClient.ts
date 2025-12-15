"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[HGI Hub] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

/**
 * IMPORTANT:
 * We only create ONE browser client.
 * This prevents the “Multiple GoTrueClient instances detected”
 * error and ensures the auth session does not get corrupted.
 */
export const supabase = createBrowserClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);
