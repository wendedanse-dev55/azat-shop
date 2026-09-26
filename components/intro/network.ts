import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Group,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Points,
  RingGeometry,
  ShaderMaterial,
  Vector3,
  type Texture,
} from "three";
import gsap from "gsap";

const rand = (a: number, b: number) => a + Math.random() * (b - a);

const POINT_VS = /* glsl */ `
  uniform float uPR;
  uniform float uSize;
  varying float vD;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPR / -mv.z;
    vD = clamp(1.35 - (-mv.z) / 22.0, 0.3, 1.0);
  }`;
const POINT_FS = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vD;
  void main() {
    vec4 t = texture2D(uTex, gl_PointCoord);
    gl_FragColor = vec4(uColor * t.rgb, t.a * uOpacity * vD);
  }`;

function pointMaterial(glow: Texture, pr: number, size: number, color: Vector3) {
  return new ShaderMaterial({
    uniforms: {
      uTex: { value: glow },
      uOpacity: { value: 0 },
      uPR: { value: pr },
      uSize: { value: size },
      uColor: { value: color },
    },
    vertexShader: POINT_VS,
    fragmentShader: POINT_FS,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

// Network theme: a living plexus of nodes and links with data packets running
// along them, Wi-Fi waves radiating from the product, and a neon cyber floor.
export function createNetwork(density: number, pr: number, glow: Texture) {
  const group = new Group();
  const state = { burst: 0, wave: 0 };
  const B = { x: 17, y: 9.5, z0: -9, z1: 2 };
  const TH = 4.6;
  const TH2 = TH * TH;

  // ---- Nodes ---------------------------------------------------------------
  const N = Math.round(120 * Math.max(0.6, density));
  const pos = new Float32Array(N * 3);
  const vel = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = rand(-B.x, B.x);
    pos[i * 3 + 1] = rand(-B.y, B.y);
    pos[i * 3 + 2] = rand(B.z0, B.z1);
    vel[i * 3] = rand(-0.6, 0.6);
    vel[i * 3 + 1] = rand(-0.45, 0.45);
    vel[i * 3 + 2] = rand(-0.3, 0.3);
  }
  const nodeGeo = new BufferGeometry();
  const nodeAttr = new BufferAttribute(pos, 3);
  nodeAttr.setUsage(DynamicDrawUsage);
  nodeGeo.setAttribute("position", nodeAttr);
  const nodeMat = pointMaterial(glow, pr, 110, new Vector3(0.6, 0.86, 1.0));
  const nodes = new Points(nodeGeo, nodeMat);
  nodes.frustumCulled = false;
  group.add(nodes);

  // ---- Links ---------------------------------------------------------------
  const maxSeg = (N * (N - 1)) / 2;
  const linePos = new Float32Array(maxSeg * 6);
  const lineAlpha = new Float32Array(maxSeg * 2);
  const lineGeo = new BufferGeometry();
  const lpAttr = new BufferAttribute(linePos, 3);
  lpAttr.setUsage(DynamicDrawUsage);
  const laAttr = new BufferAttribute(lineAlpha, 1);
  laAttr.setUsage(DynamicDrawUsage);
  lineGeo.setAttribute("position", lpAttr);
  lineGeo.setAttribute("aAlpha", laAttr);
  const lineMat = new ShaderMaterial({
    uniforms: { uOpacity: { value: 0 }, uColor: { value: new Vector3(0.35, 0.72, 1.0) } },
    vertexShader: /* glsl */ `
      attribute float aAlpha;
      varying float vA;
      void main() {
        vA = aAlpha;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      uniform vec3 uColor;
      varying float vA;
      void main() {
        gl_FragColor = vec4(uColor, vA * uOpacity);
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const lines = new LineSegments(lineGeo, lineMat);
  lines.frustumCulled = false;
  group.add(lines);

  // ---- Data packets --------------------------------------------------------
  const P = Math.round(34 * Math.max(0.6, density));
  const pkPos = new Float32Array(P * 3);
  const packets = Array.from({ length: P }, () => ({ a: 0, b: 0, t: 0, sp: 1 }));
  const neighbourOf = (a: number) => {
    const cand: number[] = [];
    for (let j = 0; j < N; j++) {
      if (j === a) continue;
      const dx = pos[a * 3] - pos[j * 3];
      const dy = pos[a * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[a * 3 + 2] - pos[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < TH2) cand.push(j);
    }
    return cand.length ? cand[(Math.random() * cand.length) | 0] : (Math.random() * N) | 0;
  };
  const spawn = (pk: (typeof packets)[number], from?: number) => {
    pk.a = from ?? (Math.random() * N) | 0;
    pk.b = neighbourOf(pk.a);
    pk.t = 0;
    pk.sp = rand(0.7, 1.5);
  };
  packets.forEach((pk) => {
    spawn(pk);
    pk.t = Math.random();
  });
  const pkGeo = new BufferGeometry();
  const pkAttr = new BufferAttribute(pkPos, 3);
  pkAttr.setUsage(DynamicDrawUsage);
  pkGeo.setAttribute("position", pkAttr);
  const pkMat = pointMaterial(glow, pr, 230, new Vector3(0.85, 0.97, 1.0));
  const pkPoints = new Points(pkGeo, pkMat);
  pkPoints.frustumCulled = false;
  group.add(pkPoints);

  // ---- Wi-Fi waves ---------------------------------------------------------
  const waveGeo = new RingGeometry(1, 1.07, 64, 1, Math.PI * 0.18, Math.PI * 0.64);
  const waves = Array.from({ length: 4 }, () => {
    const m = new MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0,
      side: DoubleSide,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const mesh = new Mesh(waveGeo, m);
    mesh.position.set(0, 0.6, -1.5);
    group.add(mesh);
    return { mesh, m };
  });

  // ---- Neon cyber floor ----------------------------------------------------
  const gridMat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new Vector3(0.3, 0.7, 1.0) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColor;
      varying vec3 vW;
      void main() {
        vec2 g = vec2(vW.x, vW.z - uTime * 2.4) * 0.5;
        vec2 f = abs(fract(g - 0.5) - 0.5) / fwidth(g);
        float line = 1.0 - min(min(f.x, f.y), 1.0);
        float fade = smoothstep(-58.0, -14.0, vW.z) * (1.0 - smoothstep(-3.0, 8.0, vW.z));
        gl_FragColor = vec4(uColor, line * fade * uOpacity * 0.45);
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const grid = new Mesh(new PlaneGeometry(96, 72), gridMat);
  grid.rotation.x = -Math.PI / 2;
  grid.position.set(0, -7.5, -26);
  group.add(grid);

  return {
    group,
    burst() {
      gsap.fromTo(state, { burst: 1 }, { burst: 0, duration: 1.8, ease: "power2.out" });
    },
    update(t: number, dt: number, w: number) {
      group.visible = w > 0.004;
      if (!group.visible) return;
      const sp = 1 + state.burst * 3;

      // Move + bounce nodes.
      for (let i = 0; i < N; i++) {
        for (let k = 0; k < 3; k++) {
          const lo = k === 0 ? -B.x : k === 1 ? -B.y : B.z0;
          const hi = k === 0 ? B.x : k === 1 ? B.y : B.z1;
          const idx = i * 3 + k;
          pos[idx] += vel[idx] * dt * sp;
          if (pos[idx] < lo || pos[idx] > hi) {
            vel[idx] *= -1;
            pos[idx] = Math.min(hi, Math.max(lo, pos[idx]));
          }
        }
      }
      nodeAttr.needsUpdate = true;

      // Rebuild links within threshold.
      let s = 0;
      for (let i = 0; i < N; i++) {
        const ix = pos[i * 3], iy = pos[i * 3 + 1], iz = pos[i * 3 + 2];
        for (let j = i + 1; j < N; j++) {
          const dx = ix - pos[j * 3];
          const dy = iy - pos[j * 3 + 1];
          const dz = iz - pos[j * 3 + 2];
          const d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < TH2) {
            const a = 1 - Math.sqrt(d2) / TH;
            const k = s * 6;
            linePos[k] = ix;
            linePos[k + 1] = iy;
            linePos[k + 2] = iz;
            linePos[k + 3] = pos[j * 3];
            linePos[k + 4] = pos[j * 3 + 1];
            linePos[k + 5] = pos[j * 3 + 2];
            lineAlpha[s * 2] = lineAlpha[s * 2 + 1] = a * a * 0.85;
            s++;
          }
        }
      }
      lineGeo.setDrawRange(0, s * 2);
      lpAttr.clearUpdateRanges();
      lpAttr.addUpdateRange(0, s * 6);
      lpAttr.needsUpdate = true;
      laAttr.clearUpdateRanges();
      laAttr.addUpdateRange(0, s * 2);
      laAttr.needsUpdate = true;

      // Packets.
      for (let i = 0; i < P; i++) {
        const pk = packets[i];
        pk.t += dt * pk.sp * sp;
        if (pk.t >= 1) spawn(pk, pk.b);
        const a = pk.a * 3;
        const b = pk.b * 3;
        pkPos[i * 3] = pos[a] + (pos[b] - pos[a]) * pk.t;
        pkPos[i * 3 + 1] = pos[a + 1] + (pos[b + 1] - pos[a + 1]) * pk.t;
        pkPos[i * 3 + 2] = pos[a + 2] + (pos[b + 2] - pos[a + 2]) * pk.t;
      }
      pkAttr.needsUpdate = true;

      // Waves.
      state.wave += dt * (0.32 + state.burst * 1.4);
      waves.forEach(({ mesh, m }, i) => {
        const k = (state.wave + i / waves.length) % 1;
        mesh.scale.setScalar(1.4 + k * 9);
        m.opacity = Math.pow(1 - k, 1.6) * 0.75 * w;
      });

      gridMat.uniforms.uTime.value = t;
      gridMat.uniforms.uOpacity.value = w;
      nodeMat.uniforms.uOpacity.value = w;
      lineMat.uniforms.uOpacity.value = w;
      pkMat.uniforms.uOpacity.value = w;
    },
    dispose() {
      gsap.killTweensOf(state);
      nodeGeo.dispose();
      nodeMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      pkGeo.dispose();
      pkMat.dispose();
      waveGeo.dispose();
      waves.forEach(({ m }) => m.dispose());
      grid.geometry.dispose();
      gridMat.dispose();
    },
  };
}
