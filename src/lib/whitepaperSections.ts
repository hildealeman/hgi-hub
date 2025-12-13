import "server-only";

import sectionsFile from "../../data/whitepaperSections.json";

export interface WhitepaperSectionMeta {
  slug: string;
  title: string;
  description: string;
}

interface WhitepaperSectionsFile {
  sections: WhitepaperSectionMeta[];
}

export async function getWhitepaperSectionsMeta(): Promise<WhitepaperSectionMeta[]> {
  const parsed = sectionsFile as WhitepaperSectionsFile;

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
