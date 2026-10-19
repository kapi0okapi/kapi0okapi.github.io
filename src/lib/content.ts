import { getCollection, type CollectionEntry } from "astro:content";
import { DATE_LOCALE, LANGS, WRITING_BASE, type Lang } from "./i18n";

export type Project = CollectionEntry<"projects">;
export type Post = CollectionEntry<"writing">;

export async function getProjects(): Promise<Project[]> {
  const projects = await getCollection("projects");
  return projects.sort((a, b) => a.data.order - b.data.order);
}

/** Article ids look like "pl/read-analog-clock": language folder, then the shared slug. */
export const langOf = (post: Post) => post.id.split("/")[0] as Lang;
export const slugOf = (post: Post) => post.id.split("/").slice(1).join("/");
export const postUrl = (post: Post) => `${WRITING_BASE[langOf(post)]}${slugOf(post)}/`;

/** Published articles, newest first; all languages unless one is given. */
export async function getPosts(lang?: Lang): Promise<Post[]> {
  const posts = await getCollection("writing", (p) => !p.data.draft && (!lang || langOf(p) === lang));
  return posts.sort(
    (a, b) => b.data.published.valueOf() - a.data.published.valueOf() || slugOf(a).localeCompare(slugOf(b)),
  );
}

/** The same article in every language it exists in. */
export function versionsOf(post: Post, all: Post[]): Partial<Record<Lang, Post>> {
  const slug = slugOf(post);
  const versions: Partial<Record<Lang, Post>> = {};
  for (const lang of LANGS) {
    const match = all.find((p) => langOf(p) === lang && slugOf(p) === slug);
    if (match) versions[lang] = match;
  }
  return versions;
}

export function readingMinutes(body = ""): number {
  const words = body.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(date: Date, lang: Lang = "en"): string {
  return date.toLocaleDateString(DATE_LOCALE[lang], { day: "numeric", month: "short", year: "numeric" });
}

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);
