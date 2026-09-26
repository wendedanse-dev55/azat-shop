import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  Vector2,
  type Texture,
} from "three";
import gsap from "gsap";

const rand = (a: number, b: number) => a + Math.random() * (b - a);

// Frost theme: falling 3D snow, cold air streaming out of the product,
// drifting mist, and a full-screen frost shader creeping in from the edges.
export function createFrost(
  density: number,
  pr: number,
  tex: { snow: Texture; glow: Texture },
  reachScale = 1,
) {
  const group = new Group();
  const state = { fall: 0, flow: 0, burst: 0 };

  // ---- Snow -------------------------------------------------------------
  const snowCount = Math.round(1100 * density);
  const sPos = new Float32Array(snowCount * 3);
  const sSize = new Float32Array(snowCount);
  const sSpeed = new Float32Array(snowCount);
  const sPhase = new Float32Array(snowCount);
  for (let i = 0; i < snowCount; i++) {
    sPos[i * 3] = rand(-26, 26);
    sPos[i * 3 + 1] = rand(-13, 13);
    sPos[i * 3 + 2] = rand(-14, 4);
    sSize[i] = 0.35 + Math.pow(Math.random(), 2.5) * 1.6;
    sSpeed[i] = rand(0.5, 1.6);
    sPhase[i] = rand(0, Math.PI * 2);
  }
  const snowGeo = new BufferGeometry();
  snowGeo.setAttribute("position", new BufferAttribute(sPos, 3));
  snowGeo.setAttribute("aSize", new BufferAttribute(sSize, 1));
  snowGeo.setAttribute("aSpeed", new BufferAttribute(sSpeed, 1));
  snowGeo.setAttribute("aPhase", new BufferAttribute(sPhase, 1));
  const snowMat = new ShaderMaterial({
    uniforms: {
      uFall: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uTex: { value: tex.snow },
      uPR: { value: pr },
    },
    vertexShader: /* glsl */ `
      uniform float uFall;
      uniform float uTime;
      uniform float uPR;
      attribute float aSize;
      attribute float aSpeed;
      attribute float aPhase;
      varying float vAlpha;
      varying float vRot;
      void main() {
        vec3 p = position;
        p.y = mod(p.y - uFall * aSpeed + 13.0, 26.0) - 13.0;
        p.x += sin(uTime * 0.7 + aPhase) * 0.7 + sin(uTime * 0.23 + aPhase * 2.0) * 0.5;
        p.z += cos(uTime * 0.5 + aPhase) * 0.35;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float dist = -mv.z;
        gl_PointSize = aSize * 150.0 * uPR / dist;
        vAlpha = clamp(1.25 - dist / 24.0, 0.2, 1.0);
        float dir = aPhase > 3.14159 ? 1.0 : -1.0;
        vRot = aPhase + uTime * (0.3 + aSpeed * 0.25) * dir;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex;
      uniform float uOpacity;
      varying float vAlpha;
      varying float vRot;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float c = cos(vRot);
        float s = sin(vRot);
        uv = mat2(c, -s, s, c) * uv + 0.5;
        vec4 t = texture2D(uTex, uv);
        gl_FragColor = vec4(vec3(0.86, 0.95, 1.0) * t.rgb, t.a * vAlpha * uOpacity);
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const snow = new Points(snowGeo, snowMat);
  snow.frustumCulled = false;
  group.add(snow);

  // ---- Cold air streaming out of the product ------------------------------
  const airCount = Math.round(900 * density);
  const aOffset = new Float32Array(airCount);
  const aSpeed = new Float32Array(airCount);
  const aSide = new Float32Array(airCount);
  const aLane = new Float32Array(airCount);
  const aSize = new Float32Array(airCount);
  const aSeed = new Float32Array(airCount);
  const airPos = new Float32Array(airCount * 3); // unused by shader, required by three
  for (let i = 0; i < airCount; i++) {
    aOffset[i] = Math.random();
    aSpeed[i] = rand(0.22, 0.45);
    aSide[i] = Math.random() < 0.5 ? -1 : 1;
    aLane[i] = rand(-1, 1);
    aSize[i] = rand(0.5, 1.25);
    aSeed[i] = Math.random();
  }
  const airGeo = new BufferGeometry();
  airGeo.setAttribute("position", new BufferAttribute(airPos, 3));
  airGeo.setAttribute("aOffset", new BufferAttribute(aOffset, 1));
  airGeo.setAttribute("aSpeed", new BufferAttribute(aSpeed, 1));
  airGeo.setAttribute("aSide", new BufferAttribute(aSide, 1));
  airGeo.setAttribute("aLane", new BufferAttribute(aLane, 1));
  airGeo.setAttribute("aSize", new BufferAttribute(aSize, 1));
  airGeo.setAttribute("aSeed", new BufferAttribute(aSeed, 1));
  const airMat = new ShaderMaterial({
    uniforms: {
      uFlow: { value: 0 },
      uOpacity: { value: 0 },
      uTex: { value: tex.glow },
      uPR: { value: pr },
    },
    vertexShader: /* glsl */ `
      uniform float uFlow;
      uniform float uPR;
      attribute float aOffset;
      attribute float aSpeed;
      attribute float aSide;
      attribute float aLane;
      attribute float aSize;
      attribute float aSeed;
      varying float vAlpha;
      void main() {
        float t = fract(uFlow * aSpeed + aOffset);
        vec3 p;
        p.x = aSide * (1.2 + t * 17.0);
        p.y = 0.9 + aLane * 1.4 - t * t * 3.4;
        p.y += sin(t * 7.0 + aSeed * 40.0) * 0.4 * t;
        p.z = -1.0 + sin(aSeed * 60.0) * 2.5 * t;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * (0.5 + t * 1.7) * 115.0 * uPR / -mv.z;
        vAlpha = sin(t * 3.14159) * (0.55 - t * 0.25);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex;
      uniform float uOpacity;
      varying float vAlpha;
      void main() {
        vec4 t = texture2D(uTex, gl_PointCoord);
        gl_FragColor = vec4(vec3(0.78, 0.93, 1.0) * t.rgb, t.a * vAlpha * uOpacity);
      }`,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const air = new Points(airGeo, airMat);
  air.frustumCulled = false;
  group.add(air);

  // ---- Mist (large soft sprites) ------------------------------------------
  const mist: { s: Sprite; m: SpriteMaterial; base: number; sp: number; ph: number; y0: number }[] = [];
  const mistCount = Math.round(22 * density) + 8;
  for (let i = 0; i < mistCount; i++) {
    const m = new SpriteMaterial({
      map: tex.glow,
      color: 0xb9dcff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const s = new Sprite(m);
    const sc = rand(7, 16);
    s.scale.set(sc * 1.7, sc, 1);
    const y0 = rand(-9, 9);
    s.position.set(rand(-30, 30), y0, rand(-14, -3));
    group.add(s);
    mist.push({ s, m, base: rand(0.04, 0.1), sp: rand(0.4, 1.1), ph: rand(0, 6.28), y0 });
  }

  // ---- Frost creeping from the screen edges (full-screen shader) ----------
  const overlayMat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uGrow: { value: 0 },
      uOpacity: { value: 0 },
      uRes: { value: new Vector2(1, 1) },
      uReachScale: { value: reachScale },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform float uTime;
      uniform float uGrow;
      uniform float uOpacity;
      uniform vec2 uRes;
      uniform float uReachScale;
      varying vec2 vUv;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      vec2 hash2(vec2 p) {
        float n = hash(p);
        return vec2(n, hash(p + n + 17.17));
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p = p * 2.07 + 11.3;
          a *= 0.5;
        }
        return v;
      }
      // Distance between the two nearest cell points: ~0 on ice-crystal borders.
      float cells(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float d1 = 8.0;
        float d2 = 8.0;
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 g = vec2(float(x), float(y));
            vec2 r = g + hash2(i + g) - f;
            float d = dot(r, r);
            if (d < d1) { d2 = d1; d1 = d; }
            else if (d < d2) { d2 = d; }
          }
        }
        return sqrt(d2) - sqrt(d1);
      }

      void main() {
        float aspect = uRes.x / uRes.y;
        vec2 uv = vUv;
        // Distance to the nearest screen edge, as a fraction of the SHORT side,
        // so the frost band stays at the borders on portrait phones too.
        vec2 px = uv * uRes;
        float edge = min(min(px.x, uRes.x - px.x), min(px.y, uRes.y - px.y)) / min(uRes.x, uRes.y);
        float reach = uGrow * uReachScale * mix(0.14, 0.21, clamp(aspect, 0.0, 1.0));
        if (edge > reach + 0.1) discard;

        vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
        float n = fbm(p * 3.5 + 2.0);
        float front = edge - (n - 0.5) * 0.16;
        float frost = 1.0 - smoothstep(reach - 0.05, reach + 0.015, front);
        if (frost <= 0.001) discard;

        float c1 = 1.0 - smoothstep(0.0, 0.07, cells(p * 9.0 + n * 1.2));
        float c2 = 1.0 - smoothstep(0.0, 0.05, cells(p * 24.0 + 3.7));
        float grain = fbm(p * 28.0);
        float depth = 1.0 - smoothstep(0.0, max(reach, 0.001), edge);
        float dens = frost * (0.28 + 0.3 * grain + 0.42 * c1 + 0.22 * c2) * (0.55 + 0.45 * depth);
        float spark = step(0.992, hash(floor(p * 170.0) + floor(uTime * 3.0))) * frost;
        vec3 col = mix(vec3(0.6, 0.8, 0.97), vec3(0.94, 0.98, 1.0), clamp(c1 * 0.7 + grain * 0.5, 0.0, 1.0));
        col += spark * 0.6;
        gl_FragColor = vec4(col, clamp(dens + spark * 0.5, 0.0, 0.92) * uOpacity);
      }`,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const overlay = new Mesh(new PlaneGeometry(2, 2), overlayMat);
  overlay.frustumCulled = false;

  return {
    group,
    overlay,
    resize(w: number, h: number) {
      overlayMat.uniforms.uRes.value.set(w, h);
    },
    burst() {
      gsap.fromTo(state, { burst: 1 }, { burst: 0, duration: 1.8, ease: "power2.out" });
    },
    update(t: number, dt: number, w: number, grow: number) {
      const on = w > 0.004;
      group.visible = on;
      overlay.visible = on && grow > 0.004;
      if (!on) return;
      state.fall += dt * (1 + state.burst * 3.5);
      state.flow += dt * (1 + state.burst * 2.2);
      snowMat.uniforms.uFall.value = state.fall;
      snowMat.uniforms.uTime.value = t;
      snowMat.uniforms.uOpacity.value = w;
      airMat.uniforms.uFlow.value = state.flow;
      airMat.uniforms.uOpacity.value = w;
      for (const m of mist) {
        m.s.position.x += dt * m.sp * (1 + state.burst * 2);
        if (m.s.position.x > 32) m.s.position.x = -32;
        m.s.position.y = m.y0 + Math.sin(t * 0.25 + m.ph) * 0.7;
        m.m.opacity = m.base * w;
      }
      overlayMat.uniforms.uTime.value = t;
      overlayMat.uniforms.uGrow.value = grow;
      overlayMat.uniforms.uOpacity.value = Math.min(1, w * 1.2);
    },
    dispose() {
      gsap.killTweensOf(state);
      snowGeo.dispose();
      snowMat.dispose();
      airGeo.dispose();
      airMat.dispose();
      for (const m of mist) m.m.dispose();
      overlay.geometry.dispose();
      overlayMat.dispose();
    },
  };
}
