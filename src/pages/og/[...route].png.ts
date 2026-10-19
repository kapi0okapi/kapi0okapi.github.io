import type { APIRoute, GetStaticPaths } from "astro";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getPosts, getProjects, langOf } from "../../lib/content";
import { UI } from "../../lib/i18n";
import { renderOg, type OgInput } from "../../lib/og";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const asset = (path: string) => resolve(root, path);

// cover paths are relative to the Markdown file they are declared in
async function coverOf(filePath: string | undefined): Promise<string | undefined> {
  if (!filePath) return undefined;
  const absolute = resolve(root, filePath);
  const match = (await readFile(absolute, "utf8")).match(/^cover:\s*(.+)$/m);
  return match ? resolve(dirname(absolute), match[1].trim()) : undefined;
}

export const getStaticPaths = (async () => {
  const pages: { params: { route: string }; props: OgInput }[] = [
    {
      params: { route: "home" },
      props: { title: "Computer vision, LiDAR and models that run where they are needed", kicker: "AI engineer · Trondheim · NTNU", image: asset("public/media/drive/detect-poster.jpg") },
    },
    {
      params: { route: "about" },
      props: { title: "About & CV: AI engineer, MSc student at NTNU", kicker: "about", image: asset("src/assets/portrait.jpg"), portrait: true },
    },
    {
      params: { route: "lab" },
      props: { title: "YOLO26 object detection in your browser", kicker: "lab", image: asset("src/assets/lab-preview.jpg") },
    },
  ];
  for (const project of await getProjects()) {
    pages.push({
      params: { route: `work/${project.id}` },
      props: { title: project.data.title, kicker: `project · ${project.data.area.toLowerCase()}`, image: await coverOf(project.filePath) },
    });
  }
  for (const post of await getPosts()) {
    pages.push({
      params: { route: `writing/${post.id}` },
      props: { title: post.data.title, kicker: UI[langOf(post)].ogKicker, image: await coverOf(post.filePath) },
    });
  }
  return pages;
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg(props as OgInput);
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
