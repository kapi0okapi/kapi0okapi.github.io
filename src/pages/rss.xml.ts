import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPosts, postUrl } from "../lib/content";
import { SITE } from "../data/site";

export async function GET(context: APIContext) {
  const posts = await getPosts("en");
  return rss({
    title: `${SITE.name} - writing`,
    description: "Articles on computer vision, LiDAR, SLAM and deploying ML models, by AI engineer Kacper Pawlowski.",
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.published,
      link: postUrl(post),
      categories: post.data.tags,
      author: `${SITE.email} (${SITE.name})`,
    })),
    customData: "<language>en</language>",
    trailingSlash: true,
  });
}
