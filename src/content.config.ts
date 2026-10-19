import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(), // one line for cards
      description: z.string().max(170), // meta description
      area: z.enum(["Road infrastructure", "3D & sensors", "Computer vision", "Deployment"]),
      order: z.number(),
      featured: z.boolean().default(false),
      repo: z.url(),
      tags: z.array(z.string()),
      cover: image(),
      coverAlt: z.string(),
      video: z.string().optional(),
      metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      status: z.enum(["results", "training"]).default("results"),
    }),
});

// One folder per language (en/, nb/, pl/); the same file name in each folder is the same
// article, so the id "pl/read-analog-clock" is the Polish version of "en/read-analog-clock".
const writing = defineCollection({
  loader: glob({ pattern: "{en,nb,pl}/*.{md,mdx}", base: "./src/content/writing" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().max(170),
      published: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()),
      cover: image(),
      coverAlt: z.string(),
      project: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects, writing };
