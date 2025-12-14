import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      vercel: {
        gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
        gitCommitRef: process.env.VERCEL_GIT_COMMIT_REF ?? null,
        gitRepoSlug: process.env.VERCEL_GIT_REPO_SLUG ?? null,
        env: process.env.VERCEL_ENV ?? null,
        url: process.env.VERCEL_URL ?? null,
      },
      node: {
        nodeEnv: process.env.NODE_ENV ?? null,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
