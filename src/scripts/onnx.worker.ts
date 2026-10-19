// One ONNX model off the main thread, for the lab demos. WebGPU when the browser has it,
// WebAssembly otherwise. Each demo starts its own worker.
// Messages: load {url} -> progress* | loaded {ms, backend};
//           run {feeds: {name: {data, dims}}} -> result {outputs: {name: {data, dims}}, ms}; error.
import * as ort from "onnxruntime-web/webgpu";

ort.env.wasm.wasmPaths = "/ort/";
ort.env.logLevel = "error";

type Feed = { data: Float32Array; dims: number[] };

let session: ort.InferenceSession | null = null;
let backend = "";
const post = (message: unknown, transfer: Transferable[] = []) =>
  (self as unknown as Worker).postMessage(message, transfer);

async function download(url: string): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`${url}: ${response.status}`);
  const total = Number(response.headers.get("content-length")) || 0;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total) post({ type: "progress", fraction: Math.min(1, received / total) });
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

// One message at a time: ONNX Runtime's WebGPU backend does not take overlapping run() calls.
let queue: Promise<void> = Promise.resolve();
self.onmessage = (event: MessageEvent) => {
  queue = queue.then(() => handle(event));
};

async function handle(event: MessageEvent) {
  const { type, id } = event.data;
  try {
    if (type === "load") {
      const start = performance.now();
      const bytes = await download(event.data.url);
      const gpu = "gpu" in navigator && (await (navigator as any).gpu.requestAdapter().catch(() => null));
      if (gpu) {
        try {
          session = await ort.InferenceSession.create(bytes, { executionProviders: ["webgpu"] });
          backend = "WebGPU";
        } catch {
          session = null;
        }
      }
      if (!session) {
        session = await ort.InferenceSession.create(bytes, { executionProviders: ["wasm"], graphOptimizationLevel: "all" });
        backend = "WebAssembly (CPU)";
      }
      post({ type: "loaded", id, ms: performance.now() - start, backend });
    } else if (type === "run") {
      if (!session) throw new Error("model not loaded");
      const feeds: Record<string, ort.Tensor> = {};
      for (const [name, feed] of Object.entries(event.data.feeds as Record<string, Feed>)) {
        feeds[name] = new ort.Tensor("float32", feed.data, feed.dims);
      }
      const start = performance.now();
      const result = await session.run(feeds);
      const ms = performance.now() - start;
      const outputs: Record<string, Feed> = {};
      const transfer: Transferable[] = [];
      for (const [name, tensor] of Object.entries(result)) {
        const data = (tensor.data as Float32Array).slice();
        outputs[name] = { data, dims: [...tensor.dims] };
        transfer.push(data.buffer);
      }
      post({ type: "result", id, outputs, ms }, transfer);
    }
  } catch (error) {
    post({ type: "error", id, message: (error as Error).message ?? String(error) });
  }
}
