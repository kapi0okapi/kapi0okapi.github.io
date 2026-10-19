// schema.org structured data. Every page links to the same Person node by its @id, so search
// engines can tie the articles, projects and profile pages to one entity: the knowledge-graph
// basis of a personal brand.
import { SITE } from "./site";

export const PERSON_ID = `${SITE.url}/#person`;
export const WEBSITE_ID = `${SITE.url}/#website`;

export function person() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.name,
    alternateName: SITE.alternateName,
    givenName: "Kacper",
    familyName: "Pawlowski",
    url: `${SITE.url}/`,
    image: `${SITE.url}/media/portrait.jpg`,
    email: `mailto:${SITE.email}`,
    jobTitle: SITE.role,
    description: SITE.description,
    worksFor: { "@type": "Organization", name: "Lighthouse Consulting" },
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "Norwegian University of Science and Technology (NTNU)",
        sameAs: "https://en.wikipedia.org/wiki/Norwegian_University_of_Science_and_Technology",
      },
      { "@type": "CollegeOrUniversity", name: "Instituto Superior Técnico, University of Lisbon" },
    ],
    address: { "@type": "PostalAddress", addressLocality: "Trondheim", addressCountry: "NO" },
    knowsAbout: SITE.knowsAbout,
    knowsLanguage: ["en", "nb", "pl", "de", "uk"],
    sameAs: [SITE.github, SITE.linkedin],
  };
}

export function website() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE.url}/`,
    name: SITE.name,
    alternateName: [SITE.alternateName, "kacperpawlowski.tech"],
    description: SITE.description,
    inLanguage: ["en", "nb"],
    publisher: { "@id": PERSON_ID },
  };
}

export function profilePage(path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE.url}${path}`,
    mainEntity: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  };
}

export function article(post: {
  title: string;
  description: string;
  path: string;
  published: Date;
  updated?: Date;
  image: string;
  tags: string[];
  lang?: string;
  /** URL of the original when this is a translation, URLs of the translations when it is not. */
  original?: string;
  translations?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE.url}${post.path}#article`,
    headline: post.title,
    description: post.description,
    url: `${SITE.url}${post.path}`,
    mainEntityOfPage: `${SITE.url}${post.path}`,
    image: `${SITE.url}${post.image}`,
    datePublished: post.published.toISOString(),
    dateModified: (post.updated ?? post.published).toISOString(),
    inLanguage: post.lang ?? "en",
    keywords: post.tags.join(", "),
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    ...(post.original && { translationOfWork: { "@id": `${SITE.url}${post.original}#article` } }),
    ...(post.translations?.length && {
      workTranslation: post.translations.map((path) => ({ "@id": `${SITE.url}${path}#article` })),
    }),
  };
}

export function project(p: { title: string; description: string; path: string; repo: string; image: string; tags: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: p.title,
    description: p.description,
    url: `${SITE.url}${p.path}`,
    codeRepository: p.repo,
    programmingLanguage: "Python",
    image: `${SITE.url}${p.image}`,
    keywords: p.tags.join(", "),
    author: { "@id": PERSON_ID },
  };
}
