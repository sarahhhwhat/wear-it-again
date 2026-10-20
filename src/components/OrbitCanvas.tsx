import { useEffect, useRef } from "react";

/**
 * Garments in orbit. Every point is one garment on a real Kepler orbit, drawn
 * in a single gl.POINTS call. There is no simulation state: a body's position
 * is a pure function of (orbital elements, time), so nothing can drift.
 */

const VERT = `#version 300 es
precision highp float;
in vec4 aOrb1; // a, e, inc, node
in vec4 aOrb2; // peri, M0, n, seed (negative seed = the primary)
uniform float uT;
uniform float uPx;
uniform float uYaw;
uniform float uPitch;
uniform float uDist;
uniform vec2 uScale;
out vec3 vCol;
out float vA;
out float vStar;
flat out float vGar;
flat out float vBand;
flat out float vTilt;
const float TAU = 6.28318530718;

// one colour per band: tops, bottoms, dresses, outerwear, shoes + accessories
vec3 bandCol(float a) {
  if (a < 1.5) return vec3(1.00, 0.35, 0.37);
  if (a < 2.6) return vec3(1.00, 0.62, 0.11);
  if (a < 4.2) return vec3(0.15, 0.28, 0.85);
  if (a < 6.0) return vec3(0.48, 0.30, 1.00);
  return vec3(0.06, 0.71, 0.63);
}

float bandIdx(float a) {
  return a < 1.5 ? 0.0 : a < 2.6 ? 1.0 : a < 4.2 ? 2.0 : a < 6.0 ? 3.0 : 4.0;
}

void main() {
  float a = aOrb1.x, e = aOrb1.y, inc = aOrb1.z, node = aOrb1.w;
  float peri = aOrb2.x, M0 = aOrb2.y, n = aOrb2.z, seed = aOrb2.w;
  float star = seed < 0.0 ? 1.0 : 0.0;

  // Kepler: mean anomaly -> eccentric anomaly (good start guess, four Newton steps)
  float M = mod(M0 + n * uT, TAU);
  float E = M + e * sin(M);
  for (int i = 0; i < 4; i++) {
    E -= (E - e * sin(E) - M) / max(0.15, 1.0 - e * cos(E));
  }
  vec2 q = vec2(a * (cos(E) - e), a * sqrt(1.0 - e * e) * sin(E));

  // rotate: periapsis (in plane), THEN inclination about x, THEN node about z
  float cw = cos(peri), sw = sin(peri);
  vec3 p = vec3(q.x * cw - q.y * sw, q.x * sw + q.y * cw, 0.0);
  float ci = cos(inc), si = sin(inc);
  p = vec3(p.x, p.y * ci - p.z * si, p.y * si + p.z * ci);
  float cn = cos(node), sn = sin(node);
  p = vec3(p.x * cn - p.y * sn, p.x * sn + p.y * cn, p.z);

  // view: yaw about z, pitch about x (pitch 0 looks straight down the system)
  float cy = cos(uYaw), sy = sin(uYaw);
  vec3 r = vec3(p.x * cy - p.y * sy, p.x * sy + p.y * cy, p.z);
  float cp = cos(uPitch), sp = sin(uPitch);
  vec3 w = vec3(r.x, r.y * cp - r.z * sp, r.y * sp + r.z * cp);

  float depth = uDist - w.z;
  gl_Position = vec4(w.x * uScale.x, w.y * uScale.y, 0.0, depth);

  // a few bodies are drawn as an actual garment; the rest are fine dust.
  // the crowded inner orbits get fewer and smaller ones so shapes stay readable
  float band = bandIdx(a);
  float rate = band < 0.5 ? 0.004 : band < 1.5 ? 0.006 : band < 2.5 ? 0.012 : band < 3.5 ? 0.014 : 0.016;
  float gar = (star < 0.5 && fract(seed * 47.3) > 1.0 - rate) ? 1.0 : 0.0;
  float gsz = mix(15.0, 31.0, band / 4.0) * (0.78 + 0.5 * fract(seed * 5.7));
  float sz = star > 0.5 ? 26.0 : (gar > 0.5 ? gsz : 1.0);
  gl_PointSize = uPx * sz * (26.0 / max(2.0, depth));

  // far half sits back a little: that is the near/far cue that makes a ring a disc
  float near = 0.62 + 0.38 * smoothstep(-1.6, 1.6, w.z);
  vA = gar > 0.5 ? 0.6 * near : (0.20 + 0.55 * fract(seed * 13.7)) * near * 1.75;

  vec3 base = mix(bandCol(a), vec3(1.0), fract(seed * 3.1) * 0.30);
  vCol = star > 0.5 ? vec3(1.0, 0.74, 0.08) : (gar > 0.5 ? bandCol(a) : base);
  vStar = star;
  vGar = gar;
  vBand = band;
  vTilt = (fract(seed * 7.7) - 0.5) * 0.9;
}`;

const FRAG = `#version 300 es
precision mediump float;
in vec3 vCol;
in float vA;
in float vStar;
flat in float vGar;
flat in float vBand;
flat in float vTilt;
out vec4 o;

float sdBox(vec2 p, vec2 c, vec2 h) {
  vec2 d = abs(p - c) - h;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
vec2 rot(vec2 p, float a) {
  float c = cos(a), s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// garment silhouettes, drawn as distance fields (no image, no mesh)
float garment(vec2 p, float b) {
  float d;
  if (b < 0.5) {            // top: t-shirt
    d = sdBox(p, vec2(0.0, -0.12), vec2(0.36, 0.58));
    float sl = sdBox(rot(p - vec2(-0.5, 0.42), 0.55), vec2(0.0), vec2(0.24, 0.17));
    float sr = sdBox(rot(p - vec2(0.5, 0.42), -0.55), vec2(0.0), vec2(0.24, 0.17));
    d = min(d, min(sl, sr));
    d = max(d, -(length(p - vec2(0.0, 0.66)) - 0.17));
  } else if (b < 1.5) {     // bottoms: trousers
    d = sdBox(p, vec2(0.0, 0.6), vec2(0.38, 0.13));
    d = min(d, sdBox(p, vec2(-0.2, -0.1), vec2(0.17, 0.64)));
    d = min(d, sdBox(p, vec2(0.2, -0.1), vec2(0.17, 0.64)));
  } else if (b < 2.5) {     // dress: straps, fitted bodice, flared skirt
    float w = mix(0.2, 0.64, clamp((0.12 - p.y) / 0.85, 0.0, 1.0));
    d = max(abs(p.x) - w, abs(p.y + 0.3) - 0.42);
    d = min(d, sdBox(p, vec2(0.0, 0.34), vec2(0.2, 0.2)));
    d = min(d, sdBox(p, vec2(-0.12, 0.66), vec2(0.04, 0.2)));
    d = min(d, sdBox(p, vec2(0.12, 0.66), vec2(0.04, 0.2)));
    d = max(d, -(length(p - vec2(0.0, 0.62)) - 0.11));
  } else if (b < 3.5) {     // outerwear: jacket with sleeves hanging from the shoulders
    d = sdBox(p, vec2(0.0, -0.1), vec2(0.32, 0.58));
    d = min(d, sdBox(rot(p - vec2(-0.34, 0.46), 0.28), vec2(0.0, -0.46), vec2(0.11, 0.5)));
    d = min(d, sdBox(rot(p - vec2(0.34, 0.46), -0.28), vec2(0.0, -0.46), vec2(0.11, 0.5)));
    d = max(d, -(length(p - vec2(0.0, 0.64)) - 0.15));
  } else {                  // shoes: sneaker in profile, toe to the right
    d = sdBox(p, vec2(0.0, -0.36), vec2(0.78, 0.1));
    d = min(d, sdBox(p, vec2(0.0, -0.12), vec2(0.62, 0.18)));
    d = min(d, sdBox(p, vec2(-0.4, 0.14), vec2(0.2, 0.28)));
    d = min(d, length(p - vec2(0.5, -0.2)) - 0.24);
    d = max(d, -(length(p - vec2(-0.4, 0.46)) - 0.13));
  }
  return d;
}

void main() {
  if (vGar > 0.5) {
    vec2 p = vec2(gl_PointCoord.x * 2.0 - 1.0, 1.0 - gl_PointCoord.y * 2.0);
    p = rot(p, vTilt) * 1.12;
    float d = garment(p, vBand);
    if (d > 0.05) discard;
    float fill = 1.0 - smoothstep(-0.02, 0.035, d);
    // a lighter inner edge gives the flat shape a little body
    float rim = smoothstep(-0.30, -0.02, d);
    vec3 col = mix(vCol, vec3(1.0), (1.0 - rim) * 0.28);
    o = vec4(col, clamp(vA * fill, 0.0, 1.0));
    return;
  }
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float d = dot(p, p);
  if (d > 1.0) discard;
  float core = exp(-d * 6.5);
  float halo = exp(-d * 1.7) * 0.3;
  float al = vA * (core + halo);
  vec3 col = vCol;
  if (vStar > 0.5) {
    al = min(1.0, core * 1.25 + halo * 1.7);
    col = mix(vCol, vec3(1.0, 0.45, 0.0), core * 0.55);
  }
  o = vec4(col, clamp(al, 0.0, 1.0));
}`;

// five bands, weighted, with clear space between them
const BANDS = [
  { w: 0.16, a0: 0.9, a1: 1.35, e: 0.05, i: 0.03 },
  { w: 0.24, a0: 1.7, a1: 2.35, e: 0.09, i: 0.055 },
  { w: 0.3, a0: 2.9, a1: 3.9, e: 0.14, i: 0.09 },
  { w: 0.14, a0: 4.6, a1: 5.4, e: 0.1, i: 0.32 },
  { w: 0.16, a0: 6.3, a1: 8.6, e: 0.26, i: 0.24 },
];

function buildBodies(count: number) {
  const data = new Float32Array(count * 8);
  for (let k = 0; k < count; k++) {
    const o = k * 8;
    if (k === 0) {
      // the primary: pinned to the origin
      data[o + 7] = -1;
      continue;
    }
    let r = Math.random();
    let b = BANDS[BANDS.length - 1];
    for (const band of BANDS) {
      if (r < band.w) {
        b = band;
        break;
      }
      r -= band.w;
    }
    const a = b.a0 + Math.random() * (b.a1 - b.a0);
    // sum of two uniforms: bunched to the plane with thin wings
    const e = Math.abs(Math.random() + Math.random() - 1) * b.e;
    const inc = (Math.random() + Math.random() - 1) * b.i;
    data[o] = a;
    data[o + 1] = e;
    data[o + 2] = inc;
    data[o + 3] = Math.random() * Math.PI * 2; // node
    data[o + 4] = Math.random() * Math.PI * 2; // periapsis
    data[o + 5] = Math.random() * Math.PI * 2; // M0
    data[o + 6] = 0.42 / Math.pow(a, 1.5); // Kepler's third law
    data[o + 7] = 0.001 + Math.random() * 0.998;
  }
  return data;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) ?? "shader error");
  }
  return s;
}

export function OrbitCanvas({
  onFirstFrame,
  onReady,
  clockRef,
}: {
  onFirstFrame: () => void;
  onReady?: (count: number) => void;
  clockRef: React.RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbRef = useRef({ onFirstFrame, onReady });
  cbRef.current = { onFirstFrame, onReady };

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
    });
    if (!gl) {
      cbRef.current.onFirstFrame();
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const short = Math.min(window.innerWidth, window.innerHeight);
    const count = reduced ? 14000 : short < 640 ? 22000 : short < 900 ? 45000 : 90000;

    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prog) ?? "link error");
      }
    } catch (err) {
      console.error("[orbits]", err);
      cbRef.current.onFirstFrame();
      return;
    }
    gl.useProgram(prog);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, buildBodies(count), gl.STATIC_DRAW);
    const l1 = gl.getAttribLocation(prog, "aOrb1");
    const l2 = gl.getAttribLocation(prog, "aOrb2");
    gl.enableVertexAttribArray(l1);
    gl.vertexAttribPointer(l1, 4, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(l2);
    gl.vertexAttribPointer(l2, 4, gl.FLOAT, false, 32, 16);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uT = u("uT"), uPx = u("uPx"), uYaw = u("uYaw"), uPitch = u("uPitch");
    const uDist = u("uDist"), uScale = u("uScale");

    // light page: ordinary alpha blending (additive would vanish on white)
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    const DIST = 26;
    const HALF = 7.4; // world units visible across the shorter screen side
    let cssW = 0, cssH = 0, dpr = 1;
    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (w === cssW && h === cssH) return; // only when the size changed
      cssW = w;
      cssH = h;
      dpr = Math.max(
        1,
        Math.min(coarse ? 1.5 : 2, window.devicePixelRatio || 1, Math.sqrt(2_600_000 / (w * h))),
      );
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const hx = w >= h ? HALF * (w / h) : HALF;
      const hy = w >= h ? HALF : HALF * (h / w);
      gl.uniform2f(uScale, DIST / hx, DIST / hy);
      gl.uniform1f(uPx, 0.98 * dpr);
      gl.uniform1f(uDist, DIST);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // --- state: only the clock and the camera, never the bodies ---
    let t = 0;
    let yaw = 0.4, pitch = 0.95;
    let yawV = 0, pitchV = 0;
    let dragging = false;
    let lastX = 0, lastY = 0, lastMove = 0;

    const scrollP = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    const interactive = (el: EventTarget | null) =>
      el instanceof Element && !!el.closest("a,button,input,textarea,select,label");

    const onDown = (e: PointerEvent) => {
      if (interactive(e.target)) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      lastMove = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const now = performance.now();
      const dts = Math.max(0.008, (now - lastMove) / 1000);
      lastMove = now;
      if (e.pointerType === "touch" && Math.abs(dy) > Math.abs(dx)) return; // let the page scroll
      yaw += dx * 0.006;
      yawV = (dx * 0.006) / dts;
      if (e.pointerType !== "touch") {
        pitch = Math.min(Math.PI - 0.16, Math.max(0.16, pitch + dy * 0.005));
        pitchV = (dy * 0.005) / dts;
      }
    };
    const onUp = () => {
      dragging = false;
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    let raf = 0;
    let last = performance.now();
    let clockAcc = 0;
    let first = true;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      resize();

      const p = scrollP();
      // scrolling runs the clock faster: a reader further down is looking further ahead
      t += dt * (reduced ? 0.12 : 0.85 + p * 5.5);

      const decay = Math.pow(0.0016, dt);
      if (!dragging) {
        yaw += (yawV + 0.035) * dt;
        pitch += pitchV * dt;
        yawV *= decay;
        pitchV *= decay;
        const rest = 0.95 + p * 0.38;
        pitch += (rest - pitch) * (1 - Math.exp(-dt * 0.9));
      }
      pitch = Math.min(Math.PI - 0.16, Math.max(0.16, pitch));

      gl.uniform1f(uT, t);
      gl.uniform1f(uYaw, yaw);
      gl.uniform1f(uPitch, pitch);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);

      clockAcc += dt;
      if (clockAcc > 0.1 && clockRef.current) {
        clockAcc = 0;
        clockRef.current.textContent = `Day ${(t * 8).toFixed(1)}`;
      }
      if (first) {
        first = false;
        cbRef.current.onReady?.(count);
        cbRef.current.onFirstFrame();
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      // note: no WEBGL_lose_context here. main.tsx mounts under React
      // StrictMode, whose dev double-invoke would lose the context before the
      // remount and leave createShader returning null (broken scene + console
      // error). The loop and listeners are fully torn down above.
    };
  }, [clockRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="orr-canvas"
    />
  );
}
