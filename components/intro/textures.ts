import { CanvasTexture } from "three";

function canvasTexture(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, s: number) => void,
): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  draw(ctx, size);
  const tex = new CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// Soft round glow (used for stars, mist, air, network nodes).
export function makeGlowTexture(): CanvasTexture {
  return canvasTexture(128, (ctx, s) => {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.22, "rgba(255,255,255,0.65)");
    g.addColorStop(0.55, "rgba(255,255,255,0.15)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  });
}

// Six-armed snowflake with a faint glow.
export function makeSnowflakeTexture(): CanvasTexture {
  return canvasTexture(128, (ctx, s) => {
    const c = s / 2;
    ctx.translate(c, c);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, c);
    g.addColorStop(0, "rgba(225,242,255,0.55)");
    g.addColorStop(0.35, "rgba(200,230,255,0.12)");
    g.addColorStop(1, "rgba(200,230,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, c, 0, Math.PI * 2);
    ctx.fill();

    const arm = c * 0.8;
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineCap = "round";
    ctx.lineWidth = s * 0.034;
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -arm);
      for (const t of [0.42, 0.68]) {
        const y = -arm * t;
        const b = arm * (0.34 - t * 0.14);
        ctx.moveTo(0, y);
        ctx.lineTo(b * 0.87, y - b * 0.5);
        ctx.moveTo(0, y);
        ctx.lineTo(-b * 0.87, y - b * 0.5);
      }
      ctx.stroke();
      ctx.restore();
    }
  });
}
