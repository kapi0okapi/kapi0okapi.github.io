// YOLO26n in the browser with ONNX Runtime Web (WebAssembly). The model is the same file as in
// my edge-optimization project: either the FP32 export or the INT8 model whose detection head
// stays in float. YOLO26 is end-to-end, so the output is already the final list of boxes:
// (1, 300, 6) rows of [x1, y1, x2, y2, score, class] in the 640 × 640 letterboxed input.
// Nothing leaves the browser; the model itself runs in a Web Worker (detector.worker.ts).

export const COCO = [
  "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light",
  "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow",
  "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee",
  "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard",
  "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
  "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch",
  "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard",
  "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase",
  "scissors", "teddy bear", "hair drier", "toothbrush",
];

export const MODELS = {
  int8: { url: "/models/yolo26n-int8.onnx", label: "INT8", size: "3.4 MB" },
  fp32: { url: "/models/yolo26n-fp32.onnx", label: "FP32", size: "9.9 MB" },
} as const;
export type ModelKind = keyof typeof MODELS;

export interface Detection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  score: number;
  cls: number;
}

const SIZE = 640;

export class Detector {
  private worker: Worker | null = null;
  private pending = new Map<number, { resolve: (data: any) => void; reject: (error: Error) => void }>();
  private nextId = 0;
  private onProgress: ((fraction: number) => void) | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  kind: ModelKind | null = null;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true })!;
  }

  private call(message: Record<string, unknown>, transfer: Transferable[] = []): Promise<any> {
    if (!this.worker) {
      this.worker = new Worker(new URL("./detector.worker.ts", import.meta.url), { type: "module" });
      this.worker.onmessage = (event) => {
        const { type, id } = event.data;
        if (type === "progress") return this.onProgress?.(event.data.fraction);
        const job = this.pending.get(id);
        if (!job) return;
        this.pending.delete(id);
        if (type === "error") job.reject(new Error(event.data.message));
        else job.resolve(event.data);
      };
      this.worker.onerror = (event) => {
        for (const job of this.pending.values()) job.reject(new Error(event.message || "worker failed"));
        this.pending.clear();
      };
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker!.postMessage({ ...message, id }, transfer);
    });
  }

  /** Downloads and compiles a model in the worker; returns the time it took in ms. */
  async load(kind: ModelKind, onProgress?: (fraction: number) => void): Promise<number> {
    this.onProgress = onProgress ?? null;
    const { ms } = await this.call({ type: "load", url: MODELS[kind].url });
    this.kind = kind;
    return ms;
  }

  /** Runs the model on an image, video frame or canvas of size width × height. */
  async detect(source: CanvasImageSource, width: number, height: number, threshold: number) {
    const scale = Math.min(SIZE / width, SIZE / height);
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const padX = Math.floor((SIZE - w) / 2);
    const padY = Math.floor((SIZE - h) / 2);

    // letterbox: grey (114) borders, as in training
    this.ctx.fillStyle = "rgb(114,114,114)";
    this.ctx.fillRect(0, 0, SIZE, SIZE);
    this.ctx.drawImage(source, padX, padY, w, h);
    const pixels = this.ctx.getImageData(0, 0, SIZE, SIZE).data;
    const plane = SIZE * SIZE;
    const input = new Float32Array(3 * plane);
    for (let i = 0, p = 0; i < plane; i++, p += 4) {
      input[i] = pixels[p] / 255;
      input[plane + i] = pixels[p + 1] / 255;
      input[2 * plane + i] = pixels[p + 2] / 255;
    }

    const { data: out, ms } = (await this.call({ type: "run", input, size: SIZE }, [input.buffer])) as { data: Float32Array; ms: number };
    const detections: Detection[] = [];
    for (let i = 0; i < out.length; i += 6) {
      const score = out[i + 4];
      if (score < threshold) continue;
      detections.push({
        x1: Math.max(0, (out[i] - padX) / scale),
        y1: Math.max(0, (out[i + 1] - padY) / scale),
        x2: Math.min(width, (out[i + 2] - padX) / scale),
        y2: Math.min(height, (out[i + 3] - padY) / scale),
        score,
        cls: Math.round(out[i + 5]),
      });
    }
    return { detections, ms };
  }
}

// Box colours: people in the accent orange, vehicles in cyan, everything else in ink.
const VEHICLES = new Set([1, 2, 3, 5, 6, 7]);
export function colourFor(cls: number): string {
  if (cls === 0) return "#ff4f1a";
  if (VEHICLES.has(cls)) return "#0a9ec2";
  if (cls === 9 || cls === 11) return "#6aa318";
  return "#0e1013";
}

/** Draws boxes in the detection-overlay style used across the site. */
export function drawDetections(ctx: CanvasRenderingContext2D, detections: Detection[], scale = 1) {
  const line = Math.max(1.5, 2 * scale);
  const font = Math.round(Math.max(11, 13 * scale));
  ctx.font = `500 ${font}px "Geist Mono", ui-monospace, monospace`;
  ctx.textBaseline = "top";
  for (const d of detections) {
    const colour = colourFor(d.cls);
    const w = d.x2 - d.x1;
    const h = d.y2 - d.y1;
    ctx.strokeStyle = colour;
    ctx.lineWidth = line;
    ctx.strokeRect(d.x1, d.y1, w, h);
    const label = `${COCO[d.cls] ?? d.cls} ${d.score.toFixed(2)}`;
    const tw = ctx.measureText(label).width + 8 * scale;
    const th = font + 6 * scale;
    const ty = d.y1 - th >= 0 ? d.y1 - th : d.y1;
    ctx.fillStyle = colour;
    ctx.fillRect(d.x1 - line / 2, ty, tw, th);
    ctx.fillStyle = colour === "#ff4f1a" || colour === "#6aa318" ? "#0e1013" : "#fff";
    ctx.fillText(label, d.x1 + 4 * scale - line / 2, ty + 3 * scale);
  }
}
