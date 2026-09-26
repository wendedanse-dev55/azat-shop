import { OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import gsap from "gsap";
import { createFrost } from "./frost";
import { createNetwork } from "./network";
import { createStars } from "./stars";
import { makeGlowTexture, makeSnowflakeTexture } from "./textures";
import type { IntroTheme } from "./theme";

export interface IntroScene {
  setTheme(theme: IntroTheme, immediate?: boolean): void;
  pulse(): void;
  setPointer(x: number, y: number): void;
  dispose(): void;
}

// WebGL background for the intro. Returns null if WebGL is unavailable, in
// which case the CSS gradients alone are shown.
export function createIntroScene(canvas: HTMLCanvasElement): IntroScene | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }

  const small = window.innerWidth < 768;
  const pr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
  const density = small ? 0.55 : 1;
  renderer.setPixelRatio(pr);
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;

  const scene = new Scene();
  const camera = new PerspectiveCamera(60, 1, 0.1, 200);
  camera.position.set(0, 0, 10);
  const overlayScene = new Scene();
  const overlayCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const glow = makeGlowTexture();
  const snowTex = makeSnowflakeTexture();
  const stars = createStars(density, pr, glow);
  const frost = createFrost(density, pr, { snow: snowTex, glow });
  const network = createNetwork(density, pr, glow);
  scene.add(stars.group, frost.group, network.group);
  overlayScene.add(frost.overlay);

  const weights = { stars: 1, frost: 0, network: 0, grow: 0 };
  const pointer = { x: 0, y: 0 };
  const cam = { x: 0, y: 0 };

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    frost.resize(w * pr, h * pr);
  };
  resize();
  window.addEventListener("resize", resize);

  let raf = 0;
  let running = true;
  let last = performance.now();
  const start = last;
  const frame = () => {
    if (!running) return;
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const t = (now - start) / 1000;

    cam.x += (pointer.x - cam.x) * 0.04;
    cam.y += (pointer.y - cam.y) * 0.04;
    camera.position.x = cam.x * 1.4;
    camera.position.y = -cam.y * 0.9;
    camera.lookAt(0, 0, 0);

    stars.update(t, dt, weights.stars);
    frost.update(t, dt, weights.frost, weights.grow);
    network.update(t, dt, weights.network);

    renderer.clear();
    renderer.render(scene, camera);
    if (frost.overlay.visible) renderer.render(overlayScene, overlayCam);
    raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);

  let current: IntroTheme | null = null;

  return {
    setTheme(theme, immediate = false) {
      if (theme === current) return;
      current = theme;
      const target = {
        stars: theme === "stars" ? 1 : theme === "network" ? 0.35 : 0,
        frost: theme === "frost" ? 1 : 0,
        network: theme === "network" ? 1 : 0,
      };
      const grow = theme === "frost" ? 1 : 0;
      gsap.killTweensOf(weights);
      if (immediate) {
        Object.assign(weights, target, { grow });
        return;
      }
      gsap.to(weights, { ...target, duration: 1.6, ease: "power2.inOut" });
      gsap.to(weights, {
        grow,
        duration: grow ? 2.8 : 1.0,
        ease: grow ? "power2.out" : "power2.in",
      });
    },
    pulse() {
      gsap.fromTo(camera.position, { z: 8.4 }, { z: 10, duration: 1.8, ease: "expo.out" });
      frost.burst();
      network.burst();
    },
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gsap.killTweensOf(weights);
      gsap.killTweensOf(camera.position);
      stars.dispose();
      frost.dispose();
      network.dispose();
      glow.dispose();
      snowTex.dispose();
      renderer.dispose();
    },
  };
}
