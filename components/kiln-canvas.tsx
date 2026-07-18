"use client";

import { useEffect, useRef } from "react";

// "Kiln" hero shader — slow warm strata drifting like heat over brick and
// limestone. Ported verbatim from design/tuckpoint-home.html. Raw WebGL, no
// deps: single static frame under prefers-reduced-motion, CSS-gradient
// fallback with no WebGL, DPR capped at 1.75, context released on unmount.

const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

const FS = `
  precision mediump float;
  uniform vec2 r; uniform float t; uniform vec2 m;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    vec2 u=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),
               mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
  }
  float fbm(vec2 p){
    float v=0., a=.5;
    for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=.5; }
    return v;
  }

  void main(){
    vec2 uv = gl_FragCoord.xy / r;
    vec2 q = uv; q.x *= r.x/r.y;

    // slow horizontal strata — sediment / brick courses
    float drift = t*0.018;
    float warp = fbm(q*1.6 + vec2(drift, -drift*0.4));
    float strata = fbm(vec2(q.x*0.8 + warp*0.9 + drift, q.y*3.2 + warp*0.6));

    // gentle mouse warmth
    float glow = smoothstep(0.75, 0.0, distance(uv, m)) * 0.14;

    // warm palette: limestone cream -> sand -> terracotta -> ember
    vec3 cream  = vec3(0.973,0.953,0.914);
    vec3 sand   = vec3(0.941,0.874,0.753);
    vec3 terra  = vec3(0.792,0.478,0.353);
    vec3 ember  = vec3(0.620,0.231,0.165);

    vec3 col = mix(cream, sand, smoothstep(0.25,0.62,strata));
    col = mix(col, terra, smoothstep(0.58,0.86,strata) * 0.75);
    col = mix(col, ember, smoothstep(0.82,0.98,strata) * (0.35 + glow));

    // vertical settle toward paper at the bottom for the veil handoff
    col = mix(col, cream, smoothstep(0.45, 0.05, uv.y) * 0.5);

    // paper grain
    float grain = (hash(gl_FragCoord.xy + t) - 0.5) * 0.028;
    col += grain;

    gl_FragColor = vec4(col, 1.0);
  }`;

export default function KilnCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) {
      canvas.style.background =
        "linear-gradient(160deg,#F8F3E9,#F0DFC8 55%,#E8C9B4)";
      return;
    }

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");
    const uM = gl.getUniformLocation(prog, "m");

    const mouse = [0.5, 0.6];
    const target = [0.5, 0.6];
    const onPointer = (e: PointerEvent) => {
      target[0] = e.clientX / window.innerWidth;
      target[1] = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      mouse[0] += (target[0] - mouse[0]) * 0.04;
      mouse[1] += (target[1] - mouse[1]) * 0.04;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, reduce ? 0 : (now - start) / 1000);
      gl.uniform2f(uM, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} id="kiln" aria-hidden />;
}
