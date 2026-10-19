// Languages of the site. Pages are in English with a Norwegian home page; articles exist in
// English, Norwegian (bokmål) and Polish.
import { SITE } from "../data/site";

export type Lang = "en" | "nb" | "pl";
export const LANGS: Lang[] = ["en", "nb", "pl"];

export const LANG_LABEL: Record<Lang, string> = { en: "EN", nb: "NO", pl: "PL" };
export const LANG_NAME: Record<Lang, string> = { en: "English", nb: "Norsk", pl: "Polski" };
export const OG_LOCALE: Record<Lang, string> = { en: "en_US", nb: "nb_NO", pl: "pl_PL" };
export const DATE_LOCALE: Record<Lang, string> = { en: "en-GB", nb: "nb-NO", pl: "pl-PL" };

/** Where each language's articles live. */
export const WRITING_BASE: Record<Lang, string> = { en: "/writing/", nb: "/no/artikler/", pl: "/pl/artykuly/" };

/** Home page of each language; Polish has articles only, so it falls back to English. */
export const HOME: Record<Lang, string> = { en: "/", nb: "/no/", pl: "/" };

export const NAV: Record<Lang, { href: string; label: string }[]> = {
  en: [
    { href: "/work/", label: "Work" },
    { href: "/writing/", label: "Writing" },
    { href: "/lab/", label: "Lab" },
    { href: "/about/", label: "About" },
  ],
  nb: [
    { href: "/no/#prosjekter", label: "Prosjekter" },
    { href: "/no/artikler/", label: "Artikler" },
    { href: "/lab/", label: "Lab" },
    { href: "/about/", label: "Om meg" },
  ],
  pl: [
    { href: "/work/", label: "Projekty" },
    { href: "/pl/artykuly/", label: "Artykuły" },
    { href: "/lab/", label: "Lab" },
    { href: "/about/", label: "O mnie" },
  ],
};

export const UI = {
  en: {
    skip: "Skip to content",
    role: "AI engineer",
    mainNav: "Main",
    homeLabel: "home",
    contact: "contact",
    cta: "Have a vision problem worth solving? Write to me.",
    location: "Trondheim, Norway",
    credits: "Credits",
    home: "Home",
    writing: "Writing",
    minRead: "min read",
    contents: "Contents",
    project: "Project",
    moreWriting: "More writing",
    keepReading: "Keep reading",
    allArticles: "All articles →",
    aboutAuthor: "About the author",
    aboutLink: "About & CV",
    byline: "AI engineer, NTNU",
    bio: SITE.description,
    language: "Language",
    topics: "Topics",
    allList: "All articles",
    subscribe: "Subscribe:",
    rss: "RSS feed",
    listTitle: "Writing",
    listEyebrow: "writing",
    listLede:
      "How to build vision systems that work: reading a clock, finding guard rails, measuring distance with one camera, mapping a road with LiDAR, running a detector on the edge. With code and numbers.",
    listMetaTitle: "Writing on computer vision and LiDAR - Kacper Pawlowski",
    listDescription:
      "How-to articles by Kacper Pawlowski on computer vision: reading clocks, finding guard rails, metric depth from one camera, LiDAR mapping, edge AI and anomaly detection.",
    ogKicker: "writing",
  },
  nb: {
    skip: "Hopp til innhold",
    role: "AI-ingeniør",
    mainNav: "Hovedmeny",
    homeLabel: "hjem",
    contact: "kontakt",
    cta: "Har du et maskinsynproblem? Skriv til meg.",
    location: "Trondheim, Norge",
    credits: "Kilder",
    home: "Hjem",
    writing: "Artikler",
    minRead: "min lesing",
    contents: "Innhold",
    project: "Prosjekt",
    moreWriting: "Flere artikler",
    keepReading: "Les videre",
    allArticles: "Alle artikler →",
    aboutAuthor: "Om forfatteren",
    aboutLink: "Om meg og CV",
    byline: "AI-ingeniør, NTNU",
    bio: "Kacper Pawlowski er AI-ingeniør og masterstudent ved NTNU i Trondheim. Han bygger systemer for maskinsyn, LiDAR og sensorfusjon - fra rådata til modeller i drift.",
    language: "Språk",
    topics: "Temaer",
    allList: "Alle artikler",
    subscribe: "Abonner:",
    rss: "RSS (engelsk)",
    listTitle: "Artikler",
    listEyebrow: "artikler",
    listLede:
      "Slik bygger du synssystemer som fungerer: lese en klokke, finne rekkverk, måle avstand med ett kamera, kartlegge en veg med LiDAR, kjøre en detektor på en edge-enhet. Med kode og tall.",
    listMetaTitle: "Artikler om maskinsyn og LiDAR - Kacper Pawlowski",
    listDescription:
      "Artikler av Kacper Pawlowski om datasyn i praksis: lese klokker, finne rekkverk, dybde i meter fra ett kamera, LiDAR-kartlegging, edge-AI og avviksdeteksjon.",
    ogKicker: "artikkel",
  },
  pl: {
    skip: "Przejdź do treści",
    role: "inżynier AI",
    mainNav: "Menu główne",
    homeLabel: "strona główna",
    contact: "kontakt",
    cta: "Masz problem, który da się rozwiązać widzeniem komputerowym? Napisz do mnie.",
    location: "Trondheim, Norwegia",
    credits: "Źródła",
    home: "Strona główna",
    writing: "Artykuły",
    minRead: "min czytania",
    contents: "Spis treści",
    project: "Projekt",
    moreWriting: "Więcej artykułów",
    keepReading: "Czytaj dalej",
    allArticles: "Wszystkie artykuły →",
    aboutAuthor: "O autorze",
    aboutLink: "O mnie i CV",
    byline: "Inżynier AI, NTNU",
    bio: "Kacper Pawlowski jest inżynierem AI i studentem studiów magisterskich na NTNU w Trondheim. Buduje systemy widzenia komputerowego, LiDAR i fuzji sensorów - od surowych danych po modele działające tam, gdzie są potrzebne.",
    language: "Język",
    topics: "Tematy",
    allList: "Wszystkie artykuły",
    subscribe: "Subskrybuj:",
    rss: "RSS (po angielsku)",
    listTitle: "Artykuły",
    listEyebrow: "artykuły",
    listLede:
      "Jak budować systemy wizyjne, które działają: odczyt zegara, wykrywanie barier, pomiar odległości jedną kamerą, mapowanie drogi LiDAR-em, detektor na urządzeniu brzegowym. Z kodem i liczbami.",
    listMetaTitle: "Artykuły o widzeniu komputerowym i LiDAR - Kacper Pawlowski",
    listDescription:
      "Artykuły Kacpra Pawlowskiego o widzeniu komputerowym w praktyce: odczyt zegarów, wykrywanie barier, głębia w metrach z jednej kamery, LiDAR, edge AI i wykrywanie wad.",
    ogKicker: "artykuł",
  },
} satisfies Record<Lang, Record<string, string>>;
