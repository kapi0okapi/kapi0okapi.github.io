import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

const site = "https://kacperpawlowski.tech";

export default defineConfig({
  site,
  trailingSlash: "always",
  build: { format: "directory" },
  // people search for "Kacper Pawlowski CV": the CV lives on the about page
  redirects: { "/cv": "/about/" },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/og/") && !page.endsWith("/404/") && !page.endsWith("/cv/"),
      serialize(item) {
        if (item.url === `${site}/` || item.url === `${site}/no/`) {
          item.links = [
            { lang: "en", url: `${site}/` },
            { lang: "nb", url: `${site}/no/` },
          ];
          item.priority = 1.0;
        } else if (item.url.includes("/writing/") || item.url.includes("/work/")) {
          item.priority = 0.8;
        }
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
  ],
  markdown: {
    shikiConfig: { theme: "github-light-high-contrast", wrap: false },
  },
  image: {
    responsiveStyles: true,
  },
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  // the lab's model worker imports ONNX Runtime as an ES module
  vite: { worker: { format: "es" } },
});
