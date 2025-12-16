import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("/api/agent/process", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-test-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("processes pending tasks and marks them done", async () => {
    const updates: Array<{ id: string; status: string }> = [];
    const inserted: Array<any> = [];

    vi.doMock("next/headers", () => ({
      cookies: async () => ({
        get: () => undefined,
        set: () => undefined,
      }),
    }));

    vi.doMock("@supabase/ssr", () => ({
      createServerClient: () => ({
        from: (table: string) => {
          if (table === "agent_queue") {
            return {
              select: () => ({
                eq: () => ({
                  order: () => ({
                    limit: async () => ({
                      data: [
                        {
                          id: "t1",
                          thread_id: "th1",
                          parent_comment_id: "c1",
                          model_agent_id: "agent1",
                          prompt: "hola",
                        },
                      ],
                      error: null,
                    }),
                  }),
                }),
              }),
              update: (patch: any) => ({
                eq: async (_col: string, id: string) => {
                  updates.push({ id, status: patch.status });
                  return { error: null };
                },
              }),
            } as any;
          }

          if (table === "comments") {
            return {
              insert: async (row: any) => {
                inserted.push(row);
                return { error: null };
              },
            } as any;
          }

          throw new Error(`Unexpected table ${table}`);
        },
      }),
    }));

    const { GET } = await import("../../src/app/api/agent/process/route");

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual({ processed: 1 });

    expect(inserted).toHaveLength(1);
    expect(inserted[0]).toMatchObject({
      thread_id: "th1",
      parent_comment_id: "c1",
      created_by: "agent1",
    });

    expect(updates).toEqual([{ id: "t1", status: "done" }]);
  });
});
