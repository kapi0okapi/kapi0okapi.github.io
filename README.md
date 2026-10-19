# kacperpawlowski.tech

Personal site of Kacper Pawlowski, AI engineer - projects, articles and an in-browser YOLO26 demo.
Static site built with [Astro](https://astro.build), deployed to GitHub Pages.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # type check + static build into dist/
npm run preview    # serve dist/
```

Node 22.12 or newer.

## Content

| What | Where |
|---|---|
| Projects | `src/content/projects/*.md` - front matter: title, summary, description (≤ 170 chars, used as meta description), area, order, featured, repo, tags, cover, metrics, status |
| Articles | `src/content/writing/{en,nb,pl}/<slug>.md` - one folder per language; the same file name in each folder is the same article (title, description, published, tags, cover, project). Pages: `/writing/<slug>/`, `/no/artikler/<slug>/`, `/pl/artykuly/<slug>/`, linked with a language switch and hreflang |
| Personal data, CV | `src/data/site.ts` (used by pages, structured data, RSS and llms.txt) |
| Hero video | `public/media/drive/{detect,segment,depth}.mp4` + posters |
| Background point cloud | `public/data/street.bin` (KITTI 07, int16 xyz × 0.02 m + uint8 intensity) |
| Lab models | `public/models/yolo26n-{int8,fp32}.onnx` |

Share images (`/og/**.png`) are rendered at build time from each page's title and cover
(`src/lib/og.ts`). A new article or project gets one automatically.

## Search engines

Generated on every build: `sitemap-index.xml`, `robots.txt`, `rss.xml`, `llms.txt`, canonical URLs,
hreflang (`/` ↔ `/no/`), Open Graph/Twitter cards and schema.org JSON-LD (Person, WebSite,
ProfilePage, BlogPosting, SoftwareSourceCode, BreadcrumbList).

To verify the site in Google Search Console and Bing Webmaster Tools, choose the *HTML tag* method
and put the token (only the `content` value) in repository variables `GOOGLE_SITE_VERIFICATION` and
`BING_SITE_VERIFICATION` (Settings → Secrets and variables → Actions → Variables). Locally, use
`PUBLIC_GOOGLE_SITE_VERIFICATION` / `PUBLIC_BING_SITE_VERIFICATION` in `.env`.

## Deploy

GitHub Pages with *Source: GitHub Actions* (Settings → Pages). Every push to `main` builds and deploys
(`.github/workflows/deploy.yml`). The custom domain is `kacperpawlowski.tech` (`public/CNAME`).

## Licences

Text, figures and code: © Kacper Pawlowski. Third-party data and models are listed on
[/credits/](https://kacperpawlowski.tech/credits/) - note that the KITTI data is CC BY-NC-SA 3.0 and the
YOLO26 weights are AGPL-3.0.
