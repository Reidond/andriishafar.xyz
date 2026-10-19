// Ordered (Bayer 8×8) dithering of an image or video onto a canvas. Every cell takes one colour from a
// fixed palette, picked by luminance, so the whole site shares one pixel-art look.

const MAX_COLORS = 12;
const FPS = 30;

export interface DitherScene {
  /** Image-space y (0–1, from the top) of the horizon. Water below it ripples and sparkles. */
  horizon: number;
  /** Image-space sun centre and radius. It glows softly. */
  sun: [x: number, y: number, radius: number];
}

export interface DitherOptions {
  /** Hex colours, darkest first. */
  palette: string[];
  /** Size of one dither cell in CSS pixels. */
  cell: number;
  /** Which part of the source stays in view when it is cropped, like `object-position` (0–1). */
  focus?: [x: number, y: number];
  /** How much to darken the bottom-left corner so text on top stays readable (0–1). */
  scrim?: number;
  /** Animate a still image: rippling water, drifting clouds, a breathing sun. */
  scene?: DitherScene;
}

export interface Dither {
  /** Swap the source, e.g. from a poster image to a video once it can play. */
  setSource(source: HTMLImageElement | HTMLVideoElement, scene?: DitherScene): void;
  destroy(): void;
}

const VERTEX = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uTexSize;
uniform vec2 uFocus;
uniform float uTime;
uniform float uScrim;
uniform float uScene;
uniform float uHorizon;
uniform vec3 uSun;
uniform vec3 uPal[${MAX_COLORS}];
uniform float uLum[${MAX_COLORS}];
uniform int uCount;
out vec4 outColor;

float bayer2(vec2 a) { a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 cell = gl_FragCoord.xy;
  vec2 uv = vec2(cell.x / uRes.x, 1.0 - cell.y / uRes.y);

  // Cover the canvas with the source, cropping around uFocus.
  float canvasAspect = uRes.x / uRes.y;
  float texAspect = uTexSize.x / uTexSize.y;
  vec2 span = canvasAspect > texAspect ? vec2(1.0, texAspect / canvasAspect) : vec2(canvasAspect / texAspect, 1.0);
  vec2 p = (1.0 - span) * uFocus + uv * span;

  float water = 0.0;
  float glow = 0.0;
  if (uScene > 0.0) {
    if (p.y > uHorizon) {
      water = 1.0;
      float depth = (p.y - uHorizon) / (1.0 - uHorizon);
      p.x += sin(p.y * 260.0 - uTime * 2.4) * 0.0022 * (0.35 + depth);
      p.y += sin(p.x * 7.0 + uTime * 0.9) * 0.0035 * depth;
      p.y -= (0.5 + 0.5 * sin(uTime * 0.45)) * 0.008 * smoothstep(0.55, 1.0, p.y);
    } else {
      p.x += sin(p.y * 38.0 + uTime * 0.35) * 0.0018;
    }
    float d = distance(p * vec2(texAspect, 1.0), uSun.xy * vec2(texAspect, 1.0));
    glow = smoothstep(uSun.z * 2.6, uSun.z * 0.9, d) * (0.5 + 0.5 * sin(uTime * 1.1)) * 0.07;
  }

  float l = dot(texture(uTex, p).rgb, vec3(0.299, 0.587, 0.114)) + glow;
  l *= 1.0 - uScrim * smoothstep(1.2, 0.15, length((uv - vec2(0.0, 1.0)) * vec2(0.8, 1.15)));

  // On water the threshold pattern shifts a few times a second, so mid-tones glitter.
  float threshold = bayer8(cell + water * floor(uTime * 6.0) * vec2(3.0, 5.0)) + 0.5 / 64.0;

  int i = 0;
  for (int k = 1; k < ${MAX_COLORS}; k++) {
    if (k < uCount && l >= uLum[k]) i = k;
  }
  int j = min(i + 1, uCount - 1);
  float f = j == i ? 0.0 : clamp((l - uLum[i]) / (uLum[j] - uLum[i]), 0.0, 1.0);
  outColor = vec4(f > threshold ? uPal[j] : uPal[i], 1.0);
}`;

function parseHex(hex: string): [number, number, number] {
  const value = parseInt(hex.replace("#", ""), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "shader");
  return shader;
}

/** Returns undefined when WebGL2 is unavailable, so the caller's CSS fallback stays in place. */
export function dither(canvas: HTMLCanvasElement, initial: HTMLImageElement | HTMLVideoElement, options: DitherOptions): Dither | undefined {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, preserveDrawingBuffer: false });
  if (!gl) return;

  let program: WebGLProgram;
  try {
    program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  } catch {
    return;
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const colors = options.palette.slice(0, MAX_COLORS).map(parseHex);
  gl.uniform3fv(u("uPal"), colors.flat());
  gl.uniform1fv(u("uLum"), colors.map(([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b));
  gl.uniform1i(u("uCount"), colors.length);
  gl.uniform2fv(u("uFocus"), options.focus ?? [0.5, 0.5]);
  gl.uniform1f(u("uScrim"), options.scrim ?? 0);

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let source = initial;
  let scene = options.scene;
  let uploaded = false;
  let raf = 0;
  let last = 0;
  const start = performance.now();

  const isVideo = () => source instanceof HTMLVideoElement;
  const ready = () => (source instanceof HTMLVideoElement ? source.readyState >= 2 : source.complete && source.naturalWidth > 0);
  const animates = () => !reduceMotion.matches && (isVideo() || Boolean(scene));

  function applyScene() {
    gl!.uniform1f(u("uScene"), scene ? 1 : 0);
    gl!.uniform1f(u("uHorizon"), scene?.horizon ?? 0);
    gl!.uniform3fv(u("uSun"), scene?.sun ?? [0, 0, 0]);
  }

  function draw(now: number) {
    if (!ready()) return;
    if (isVideo() || !uploaded) {
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGB, gl!.RGB, gl!.UNSIGNED_BYTE, source);
      uploaded = true;
    }
    const width = source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
    const height = source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
    gl!.uniform2f(u("uTexSize"), width, height);
    gl!.uniform2f(u("uRes"), canvas.width, canvas.height);
    gl!.uniform1f(u("uTime"), animates() ? (now - start) / 1000 : 0);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    canvas.setAttribute("data-ready", "");
  }

  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    if (now - last < 1000 / FPS - 2) return;
    last = now;
    draw(now);
  }

  function run() {
    cancelAnimationFrame(raf);
    draw(performance.now());
    if (animates()) raf = requestAnimationFrame(loop);
  }

  // Size the backing store in whole cells, then stretch it with pixelated scaling so cells stay square
  // and crisp on any device pixel ratio.
  const container = canvas.parentElement!;
  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const cell = Math.max(1, Math.round(options.cell * ratio));
    canvas.width = Math.max(1, Math.ceil((container.clientWidth * ratio) / cell));
    canvas.height = Math.max(1, Math.ceil((container.clientHeight * ratio) / cell));
    canvas.style.width = `${(canvas.width * cell) / ratio}px`;
    canvas.style.height = `${(canvas.height * cell) / ratio}px`;
    if (!animates()) draw(performance.now());
  }

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  const onLoad = () => run();
  const onMotionChange = () => run();
  reduceMotion.addEventListener("change", onMotionChange);

  function listen(next: HTMLImageElement | HTMLVideoElement) {
    next.addEventListener(next instanceof HTMLVideoElement ? "loadeddata" : "load", onLoad);
  }

  applyScene();
  listen(source);
  resize();
  run();

  return {
    setSource(next, nextScene) {
      source = next;
      scene = nextScene;
      uploaded = false;
      applyScene();
      listen(next);
      run();
    },
    destroy() {
      cancelAnimationFrame(raf);
      observer.disconnect();
      reduceMotion.removeEventListener("change", onMotionChange);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
