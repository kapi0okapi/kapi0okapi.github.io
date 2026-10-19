// A LiDAR scan of a street (KITTI sequence 07, accumulated from 80 Velodyne sweeps) drawn with
// plain WebGL. The camera orbits slowly; a beam sweeps around the sensor position the way a
// spinning LiDAR does, and the points it passes light up in the accent colour for a moment.
// Pauses off-screen and in background tabs; one still frame under prefers-reduced-motion.

type Mat4 = Float32Array;

function perspective(fovy: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}

function lookAt(eye: number[], target: number[], up: number[]): Mat4 {
  const z = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
  const x = normalize(cross(up, z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ]);
}

function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return out;
}

const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalize = (a: number[]) => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};

const VERTEX = `
attribute vec3 aPosition;
attribute float aIntensity;
uniform mat4 uMatrix;
uniform float uBeam;
uniform float uSize;
varying float vAlpha;
varying float vGlow;
void main() {
  vec4 p = uMatrix * vec4(aPosition, 1.0);
  gl_Position = p;
  float near = 1.0 - smoothstep(20.0, 150.0, p.w);
  gl_PointSize = uSize * (0.55 + 1.1 * near);
  float azimuth = atan(aPosition.y, aPosition.x);
  float behind = mod(uBeam - azimuth + 6.2831853, 6.2831853);
  float range = length(aPosition.xy);
  vGlow = exp(-behind * 2.4) * (1.0 - smoothstep(18.0, 75.0, range));
  vAlpha = (0.2 + 0.45 * aIntensity) * (0.3 + 0.7 * near);
}`;

const FRAGMENT = `
precision mediump float;
uniform vec3 uInk;
uniform vec3 uAccent;
varying float vAlpha;
varying float vGlow;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  if (dot(c, c) > 0.25) discard;
  vec3 colour = mix(uInk, uAccent, clamp(vGlow * 1.6, 0.0, 1.0));
  gl_FragColor = vec4(colour, clamp(vAlpha + vGlow * 0.7, 0.0, 0.9));
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "shader");
  return shader;
}

async function loadCloud(url: string, stride: number) {
  const buffer = await (await fetch(url)).arrayBuffer();
  const n = new DataView(buffer).getUint32(0, true);
  const xyz = new Int16Array(buffer, 4, n * 3);
  const intensity = new Uint8Array(buffer, 4 + n * 6, n);
  const count = Math.floor(n / stride);
  const positions = new Float32Array(count * 3);
  const values = new Float32Array(count);
  for (let i = 0, j = 0; j < count; i += stride, j++) {
    positions[j * 3] = xyz[i * 3] * 0.02;
    positions[j * 3 + 1] = xyz[i * 3 + 1] * 0.02;
    positions[j * 3 + 2] = xyz[i * 3 + 2] * 0.02;
    values[j] = Math.min(1, intensity[i] / 160);
  }
  return { positions, values, count };
}

export async function startPointField(canvas: HTMLCanvasElement, url: string): Promise<void> {
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, alpha: true });
  if (!gl) return;
  const small = window.matchMedia("(max-width: 720px)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cloud = await loadCloud(url, small ? 3 : 1);

  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  gl.useProgram(program);

  const bind = (name: string, data: Float32Array, size: number) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  };
  bind("aPosition", cloud.positions, 3);
  bind("aIntensity", cloud.values, 1);
  const uMatrix = gl.getUniformLocation(program, "uMatrix");
  const uBeam = gl.getUniformLocation(program, "uBeam");
  const uSize = gl.getUniformLocation(program, "uSize");
  gl.uniform3f(gl.getUniformLocation(program, "uInk"), 0.06, 0.07, 0.08);
  gl.uniform3f(gl.getUniformLocation(program, "uAccent"), 1.0, 0.31, 0.1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  let pointerX = 0;
  let pointerY = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
    },
    { passive: true },
  );

  let visible = true;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting)).observe(canvas);
  const start = performance.now();
  let yawOffset = 0;
  let pitchOffset = 0;

  const draw = (now: number) => {
    const t = (now - start) / 1000;
    yawOffset += (pointerX * 0.25 - yawOffset) * 0.04;
    pitchOffset += (pointerY * 0.12 - pitchOffset) * 0.04;
    const yaw = -0.6 + t * 0.035 + yawOffset;
    const radius = 46;
    const height = 30 + pitchOffset * 16;
    const eye = [Math.cos(yaw) * radius, Math.sin(yaw) * radius, height];
    const aspect = canvas.width / canvas.height;
    const projection = perspective(0.9, aspect, 1, 400);
    // lens shift: on wide screens the sensor sits behind the right column, on narrow ones lower down
    projection[8] = aspect > 1.2 ? -0.12 : 0;
    projection[9] = aspect > 1.2 ? 0.22 : 0.35;
    const matrix = multiply(projection, lookAt(eye, [0, 0, 0], [0, 0, 1]));
    gl.uniformMatrix4fv(uMatrix, false, matrix);
    gl.uniform1f(uBeam, (t * 2.2) % (Math.PI * 2) - Math.PI);
    gl.uniform1f(uSize, 2.6 * dpr);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, cloud.count);
  };

  if (reduced) {
    draw(start + 4000);
    return;
  }
  const loop = (now: number) => {
    if (visible && !document.hidden) draw(now);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
