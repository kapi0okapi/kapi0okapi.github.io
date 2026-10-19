import type { APIRoute } from "astro";
import { getPosts, getProjects, postUrl } from "../lib/content";
import { EDUCATION, EXPERIENCE, SITE } from "../data/site";

// llms.txt (llmstxt.org): a plain summary of the site for language models and AI search.
export const GET: APIRoute = async () => {
  const projects = await getProjects();
  const posts = await getPosts("en");
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `${SITE.name} (also written ${SITE.alternateName}) is based in ${SITE.location}. Contact: ${SITE.email}. GitHub: ${SITE.github}. LinkedIn: ${SITE.linkedin}.`,
    "",
    "## Experience",
    ...EXPERIENCE.map((e) => `- ${e.title}, ${e.org} (${e.period})`),
    "",
    "## Education",
    ...EDUCATION.map((e) => `- ${e.degree}, ${e.school} (${e.period})`),
    "",
    "## Pages",
    `- [About and CV](${SITE.url}/about/): background, experience, education and skills`,
    `- [Projects](${SITE.url}/work/): all projects with results`,
    `- [Writing](${SITE.url}/writing/): technical articles, also in Norwegian (${SITE.url}/no/artikler/) and Polish (${SITE.url}/pl/artykuly/)`,
    `- [Lab](${SITE.url}/lab/): YOLO26 object detection running in the browser`,
    `- [Norsk](${SITE.url}/no/): presentation in Norwegian`,
    "",
    "## Projects",
    ...projects.map((p) => `- [${p.data.title}](${SITE.url}/work/${p.id}/): ${p.data.summary}`),
    "",
    "## Articles",
    ...posts.map((p) => `- [${p.data.title}](${SITE.url}${postUrl(p)}): ${p.data.description}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
