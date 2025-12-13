import "server-only";

import { promises as fs } from "fs";
import path from "path";

export interface WhitepaperSectionMeta {
  slug: string;
  title: string;
  description: string;
}

interface WhitepaperSectionsFile {
  sections: WhitepaperSectionMeta[];
}

const sectionsFilePath = path.join(process.cwd(), "data", "whitepaperSections.json");

export async function getWhitepaperSectionsMeta(): Promise<WhitepaperSectionMeta[]> {
  const raw = await fs.readFile(sectionsFilePath, "utf8");
  const parsed = JSON.parse(raw) as WhitepaperSectionsFile;

  if (!parsed?.sections || !Array.isArray(parsed.sections)) {
    return [];
  }

  return parsed.sections;
}

export async function getWhitepaperSectionMetaBySlug(
  slug: string
): Promise<WhitepaperSectionMeta | null> {
  const sections = await getWhitepaperSectionsMeta();
  return sections.find((s) => s.slug === slug) ?? null;
}
