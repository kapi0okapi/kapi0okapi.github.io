// Share images (1200 × 630) rendered at build time with Satori and resvg: title on the left,
// the page's cover image on the right inside the same corner-bracket frame the site uses.
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFile(require.resolve(`${pkg}/files/${file}`));

let fonts: Promise<Parameters<typeof satori>[1]["fonts"]> | null = null;
function loadFonts() {
  fonts ??= Promise.all([
    font("@fontsource/geist", "geist-latin-400-normal.woff"),
    font("@fontsource/geist", "geist-latin-600-normal.woff"),
    font("@fontsource/geist", "geist-latin-ext-400-normal.woff"),
    font("@fontsource/geist", "geist-latin-ext-600-normal.woff"),
    font("@fontsource/geist-mono", "geist-mono-latin-400-normal.woff"),
  ]).then(([regular, semibold, regularExt, semiboldExt, mono]) => [
    { name: "Geist", data: regular, weight: 400, style: "normal" },
    { name: "Geist", data: semibold, weight: 600, style: "normal" },
    { name: "Geist", data: regularExt, weight: 400, style: "normal" },
    { name: "Geist", data: semiboldExt, weight: 600, style: "normal" },
    { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
  ]);
  return fonts;
}

const INK = "#0e1013";
const MUTED = "#6a7078";
const ACCENT = "#ff4f1a";
const LINE = "#e3e6e9";

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});

function bracket(position: Record<string, number>, rotate: number): Node {
  return h("div", {
    position: "absolute",
    width: 34,
    height: 34,
    borderTop: `4px solid ${ACCENT}`,
    borderLeft: `4px solid ${ACCENT}`,
    transform: `rotate(${rotate}deg)`,
    ...position,
  });
}

export type OgInput = {
  title: string;
  kicker: string;
  image?: string; // absolute file path
  portrait?: boolean;
};

export async function renderOg({ title, kicker, image, portrait = false }: OgInput): Promise<Buffer> {
  const width = portrait ? 340 : 440;
  const height = portrait ? 425 : 420;
  let picture: Node | null = null;
  if (image) {
    // photos fill the frame; charts (PNG) are shown whole on white
    const chart = image.endsWith(".png");
    const jpeg = await sharp(image)
      .resize(width * 2, height * 2, chart ? { fit: "contain", background: "#ffffff" } : { fit: "cover", position: "attention" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 80 })
      .toBuffer();
    picture = h("div", { display: "flex", position: "relative", padding: 14 }, [
      h("img", { width, height, objectFit: "cover", borderRadius: 4, border: `1px solid ${LINE}` }, undefined, {
        src: `data:image/jpeg;base64,${jpeg.toString("base64")}`,
        width,
        height,
      }),
      bracket({ top: 0, left: 0 }, 0),
      bracket({ top: 0, right: 0 }, 90),
      bracket({ bottom: 0, right: 0 }, 180),
      bracket({ bottom: 0, left: 0 }, 270),
    ]);
  }

  const size = title.length > 70 ? 44 : title.length > 44 ? 50 : 60;
  const tree = h(
    "div",
    {
      width: 1200,
      height: 630,
      display: "flex",
      background: "#ffffff",
      backgroundImage: `linear-gradient(${LINE} 1px, transparent 1px), linear-gradient(90deg, ${LINE} 1px, transparent 1px)`,
      backgroundSize: "60px 60px",
      backgroundPosition: "-1px -1px",
      fontFamily: "Geist",
      color: INK,
      padding: 64,
      alignItems: "center",
      gap: 56,
    },
    [
      h("div", { display: "flex", flexDirection: "column", justifyContent: "space-between", height: 502, width: picture ? 1072 - 56 - (width + 28) : 1072 }, [
        h("div", { display: "flex", alignItems: "center", gap: 14, fontFamily: "Geist Mono", fontSize: 22, color: MUTED }, [
          h("div", { width: 16, height: 16, background: ACCENT }),
          h("div", { display: "flex" }, kicker),
        ]),
        h("div", { display: "flex", fontSize: size, fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.03em", background: "#ffffff", padding: "8px 0" }, title),
        h("div", { display: "flex", flexDirection: "column", gap: 4 }, [
          h("div", { display: "flex", fontSize: 30, fontWeight: 600, letterSpacing: "-0.01em" }, "Kacper Pawlowski"),
          h("div", { display: "flex", fontFamily: "Geist Mono", fontSize: 21, color: MUTED }, "AI engineer · kacperpawlowski.tech"),
        ]),
      ]),
      ...(picture ? [picture] : []),
    ],
  );

  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: await loadFonts() });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
