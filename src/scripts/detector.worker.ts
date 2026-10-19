// Runs the ONNX model off the main thread, so the page stays responsive while WebAssembly
// compiles and the model computes. Messages: load → loaded | progress, run → result, and error.
import * as ort from "onnxruntime-web/wasm";
import wasmUrl from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";

ort.env.wasm.wasmPaths = { wasm: wasmUrl };
ort.env.logLevel = "error";

let session: ort.InferenceSession | null = null;
const post = (message: unknown, transfer: Transferable[] = []) => (self as unknown as Worker).postMessage(message, transfer);

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

self.onmessage = async (event: MessageEvent) => {
  const { type, id } = event.data;
  try {
    if (type === "load") {
      const start = performance.now();
      const bytes = await download(event.data.url);
      const next = await ort.InferenceSession.create(bytes, { executionProviders: ["wasm"], graphOptimizationLevel: "all" });
      void session?.release();
      session = next;
      post({ type: "loaded", id, ms: performance.now() - start });
    } else if (type === "run") {
      if (!session) throw new Error("model not loaded");
      const size = event.data.size as number;
      const input = new ort.Tensor("float32", event.data.input as Float32Array, [1, 3, size, size]);
      const start = performance.now();
      const outputs = await session.run({ images: input });
      const ms = performance.now() - start;
      const data = (outputs.output0.data as Float32Array).slice();
      post({ type: "result", id, data, ms }, [data.buffer]);
    }
  } catch (error) {
    post({ type: "error", id, message: (error as Error).message ?? String(error) });
  }
};
