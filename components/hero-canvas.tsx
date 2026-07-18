"use client";

import { useEffect, useRef } from "react";

// Warm generative field behind the landing hero. Raw WebGL — no dependency,
// works offline; falls back to plain paper when GL is unavailable and renders
// a single still frame under prefers-reduced-motion.

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_mouse;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = uv * vec2(u_res.x / u_res.y, 1.0);
  float t = u_time * 0.045;

  float warp = fbm(p * 1.6 + t);
  float n = fbm(p * 2.4 + warp * 1.4 + u_mouse * 0.5 + t);

  vec3 paper = vec3(0.980, 0.953, 0.906);
  vec3 sand  = vec3(0.945, 0.910, 0.843);
  vec3 blush = vec3(0.980, 0.925, 0.886);
  vec3 terra = vec3(0.627, 0.271, 0.165);

  vec3 col = mix(paper, sand, smoothstep(0.35, 0.8, n));
  col = mix(col, blush, 0.6 * smoothstep(0.55, 0.95, fbm(p * 1.9 - t + u_mouse * 0.3)));
  // faint mortar-course ridges
  float ridge = smoothstep(0.47, 0.5, abs(fract(n * 5.0) - 0.5));
  col = mix(col, terra, (1.0 - ridge) * 0.045);

  // blend to paper at the edges so the canvas melts into the page
  float vig = smoothstep(1.05, 0.35, distance(uv, vec2(0.5, 0.55)));
  col = mix(paper, col, vig);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, depth: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_res");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.max(1, clientWidth * dpr);
      canvas.height = Math.max(1, clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: 0.5, y: 0.5 };
    const eased = { x: 0.5, y: 0.5 };
    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / Math.max(1, rect.width);
      mouse.y = 1 - (e.clientY - rect.top) / Math.max(1, rect.height);
    };
    window.addEventListener("pointermove", onPointer);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const frame = () => {
      eased.x += (mouse.x - eased.x) * 0.05;
      eased.y += (mouse.y - eased.y) * 0.05;
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, eased.x, eased.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
