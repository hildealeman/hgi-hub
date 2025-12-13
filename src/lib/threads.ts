import "server-only";

import { promises as fs } from "fs";
import path from "path";

export type ThreadAuthorType = "human" | "model";

export interface ThreadComment {
  id: string;
  authorType: ThreadAuthorType;
  content: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

export interface ThreadData {
  section: string;
  comments: ThreadComment[];
}

const THREADS_DIR = path.join(process.cwd(), "data", "threads");

function threadPath(section: string): string {
  return path.join(THREADS_DIR, `${section}.json`);
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(THREADS_DIR, { recursive: true });
}

function newId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function getThreadFor(section: string): Promise<ThreadData> {
  await ensureDir();
  const file = threadPath(section);

  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as ThreadData;

    if (!parsed || parsed.section !== section || !Array.isArray(parsed.comments)) {
      return { section, comments: [] };
    }

    return parsed;
  } catch {
    return { section, comments: [] };
  }
}

async function writeThread(thread: ThreadData): Promise<void> {
  await ensureDir();
  const file = threadPath(thread.section);
  await fs.writeFile(file, JSON.stringify(thread, null, 2) + "\n", "utf8");
}

export async function addComment(
  section: string,
  comment: { content: string; authorType?: ThreadAuthorType }
): Promise<ThreadComment> {
  const thread = await getThreadFor(section);

  const created: ThreadComment = {
    id: newId(),
    authorType: comment.authorType ?? "human",
    content: comment.content,
    createdAt: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
  };

  const next: ThreadData = {
    section,
    comments: [created, ...thread.comments],
  };

  await writeThread(next);

  return created;
}

export async function upvoteComment(section: string, id: string): Promise<ThreadComment | null> {
  const thread = await getThreadFor(section);
  const idx = thread.comments.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const updated: ThreadComment = {
    ...thread.comments[idx],
    upvotes: thread.comments[idx].upvotes + 1,
  };

  const next: ThreadData = {
    section,
    comments: [...thread.comments.slice(0, idx), updated, ...thread.comments.slice(idx + 1)],
  };

  await writeThread(next);

  return updated;
}

export async function downvoteComment(section: string, id: string): Promise<ThreadComment | null> {
  const thread = await getThreadFor(section);
  const idx = thread.comments.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const updated: ThreadComment = {
    ...thread.comments[idx],
    downvotes: thread.comments[idx].downvotes + 1,
  };

  const next: ThreadData = {
    section,
    comments: [...thread.comments.slice(0, idx), updated, ...thread.comments.slice(idx + 1)],
  };

  await writeThread(next);

  return updated;
}
