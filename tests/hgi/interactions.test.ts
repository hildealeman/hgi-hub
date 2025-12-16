import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Basic API contract tests (mocking next/server + supabase)

describe("/api/comments/interact", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-test-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("POST returns totals", async () => {
    vi.doMock("next/headers", () => ({
      cookies: async () => ({
        get: () => undefined,
        set: () => undefined,
      }),
    }));

    vi.doMock("@supabase/ssr", () => ({
      createServerClient: () => ({
        auth: {
          getUser: async () => ({ data: { user: { id: "u1" } }, error: null }),
        },
        from: (table: string) => {
          if (table === "comment_interactions") {
            return {
              upsert: async () => ({ error: null }),
              select: () => ({
                // getTotals: .select('type').eq('comment_id', ...)
                eq: async () => ({
                  data: [
                    { type: "upvote" },
                    { type: "downvote" },
                    { type: "upvote" },
                  ],
                  error: null,
                }),
              }),
            } as any;
          }
          throw new Error(`Unexpected table ${table}`);
        },
      }),
    }));

    const { POST } = await import("../../src/app/api/comments/interact/route");

    const res = await POST(
      new Request("http://localhost/api/comments/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: "c1", type: "upvote" }),
      })
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ upvotes: 2, downvotes: 1 });
  });
});
