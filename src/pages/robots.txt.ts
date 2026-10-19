import type { APIRoute } from "astro";
import { SITE } from "../data/site";

// Everything is public and meant to be found - by search engines and by AI assistants.
export const GET: APIRoute = () =>
  new Response(
    ["User-agent: *", "Allow: /", "", `Sitemap: ${SITE.url}/sitemap-index.xml`, ""].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
