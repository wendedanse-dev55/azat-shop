import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  Points,
  ShaderMaterial,
  type Texture,
} from "three";

// Deep twinkling starfield (default theme).
export function createStars(density: number, pr: number, glow: Texture) {
  const group = new Group();
  const count = Math.round(1500 * density);
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const phase = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const r = 18 + Math.random() * 32;
    const s = Math.sqrt(1 - u * u);
    pos[i * 3] = r * s * Math.cos(th) * 1.4;
    pos[i * 3 + 1] = r * u;
    pos[i * 3 + 2] = -Math.abs(r * s * Math.sin(th)) - 6;
    size[i] = Math.random() < 0.08 ? 1.8 + Math.random() : 0.5 + Math.random() * 0.8;
    phase[i] = Math.random() * Math.PI * 2;
  }

  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("aSize", new BufferAttribute(size, 1));
  geo.setAttribute("aPhase", new BufferAttribute(phase, 1));

  const mat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uTex: { value: glow },
      uPR: { value: pr },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPR;
      attribute float aSize;
      attribute float aPhase;
      varying float vTw;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        vTw = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase);
        gl_PointSize = aSize * 95.0 * uPR / -mv.z;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex;
      uniform float uOpacity;
      varying float vTw;
      void main() {
        vec4 t = texture2D(uTex, gl_PointCoord);
        gl_FragColor = vec4(vec3(0.8, 0.91, 1.0) * t.rgb, t.a * vTw * uOpacity);
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const points = new Points(geo, mat);
  points.frustumCulled = false;
  group.add(points);

  return {
    group,
    update(t: number, dt: number, w: number) {
      group.visible = w > 0.004;
      if (!group.visible) return;
      mat.uniforms.uTime.value = t;
      mat.uniforms.uOpacity.value = w;
      group.rotation.y += dt * 0.012;
      group.rotation.z += dt * 0.004;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
