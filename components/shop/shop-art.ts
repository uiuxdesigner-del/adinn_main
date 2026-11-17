/**
 * Canvas drawing for the shop story: the single campaign artwork and the in-code Digital Marketing
 * screen. Both are drawn in code (no raster mock-ups, no invented figures).
 */

export type Ctx = CanvasRenderingContext2D;

export function canvasOf(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")!];
}

export const RED = "#d6212a";
export const INK = "#161616";

/* ------------------------------------------------------------------ campaign artwork */

/** The one campaign artwork (16:10) carried across Digital, the booklet, the POP chapter and the wall. */
export const ART_ASPECT = 1.6;
export function drawArtwork(ctx: Ctx, w: number, h: number, font: string, logo: HTMLImageElement | null) {
  ctx.save();
  ctx.fillStyle = "#f6f1e9";
  ctx.fillRect(0, 0, w, h);
  // Half-disc, echoing the printed booklet cover.
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.arc(w * 0.74, h * 1.02, h * 0.62, Math.PI, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 ${h * 0.125}px ${font}`;
  ctx.fillText("Be seen.", w * 0.07, h * 0.3);
  ctx.fillStyle = RED;
  ctx.fillText("Be chosen.", w * 0.07, h * 0.3 + h * 0.15);
  ctx.fillStyle = "#4a4a4a";
  ctx.font = `400 ${h * 0.04}px ${font}`;
  ctx.fillText("Marketing that reaches people where they are.", w * 0.07, h * 0.3 + h * 0.255);
  if (logo && logo.complete && logo.naturalWidth) {
    const lw = w * 0.2;
    ctx.drawImage(logo, w * 0.07, h * 0.76, lw, (lw * logo.naturalHeight) / logo.naturalWidth);
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ digital screen */

const ease = (t: number) => t * t * (3 - 2 * t);
const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const rr = (ctx: Ctx, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/**
 * Digital Marketing, built from interface primitives: campaign creative, a landing page with an
 * enquiry action, and a measurement/optimisation loop. No numbers are shown: nothing is claimed.
 * u in 0..1 is the chapter's own progress; at u = 1 the artwork fills the whole screen.
 */
export function drawDigital(
  ctx: Ctx,
  w: number,
  h: number,
  u: number,
  font: string,
  art: HTMLCanvasElement,
) {
  const S = h / 960;
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  const g = ease(seg(u, 0.74, 1));
  // The page dissolves underneath the card while it grows; the card itself stays fully opaque.
  const uiA = 1 - ease(seg(u, 0.76, 0.96));
  const a1 = 1;
  if (uiA > 0.002) {
    ctx.globalAlpha = uiA;
    ctx.fillStyle = "#eef0f3";
    ctx.fillRect(0, 0, w, h);
    // page
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = RED;
    ctx.beginPath();
    ctx.arc(70 * S, 118 * S, 16 * S, 0, 7);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = `600 ${25 * S}px ${font}`;
    ctx.fillText("Your Brand", 100 * S, 119 * S);
    ctx.fillStyle = "#9aa1ab";
    ctx.font = `400 ${19 * S}px ${font}`;
    ["Products", "About", "Contact"].forEach((t, i) => ctx.fillText(t, (1010 + i * 150) * S, 119 * S));
    ctx.fillStyle = "#eceff3";
    ctx.fillRect(0, 150 * S, w, 2 * S);

    // 1. campaign creative card
    ctx.globalAlpha = uiA * a1;
    const cx = 56 * S;
    const cy = (200 + (1 - a1) * 40) * S;
    const cw = 560 * S;
    const ch = cw / ART_ASPECT;
    ctx.fillStyle = "#6b7280";
    ctx.font = `500 ${17 * S}px ${font}`;
    ctx.fillText("CAMPAIGN CREATIVE", cx, cy + ch + 28 * S);

    // 2. landing page + enquiry action
    const a2 = 1;
    ctx.globalAlpha = uiA * a2;
    const lx = 680 * S;
    const ly = (200 + (1 - a2) * 40) * S;
    ctx.fillStyle = INK;
    ctx.font = `600 ${44 * S}px ${font}`;
    ctx.fillText("Let’s talk about", lx, ly + 40 * S);
    ctx.fillText("your next campaign.", lx, ly + 94 * S);
    ctx.fillStyle = "#6b7280";
    ctx.font = `400 ${20 * S}px ${font}`;
    ctx.fillText("Tell us what you want to achieve.", lx, ly + 140 * S);
    for (let i = 0; i < 2; i++) {
      ctx.strokeStyle = "#cfd5dc";
      ctx.lineWidth = 2 * S;
      ctx.fillStyle = "#fff";
      rr(ctx, lx, ly + (178 + i * 74) * S, 560 * S, 56 * S, 8 * S);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#9aa1ab";
      ctx.font = `400 ${19 * S}px ${font}`;
      ctx.fillText(i ? "Email or phone" : "Your name", lx + 20 * S, ly + (207 + i * 74) * S);
    }
    const press = ease(seg(u, 0.36, 0.44)) * (1 - ease(seg(u, 0.46, 0.56)));
    ctx.fillStyle = RED;
    rr(ctx, lx, ly + 336 * S, 250 * S, 58 * S, 29 * S);
    ctx.fill();
    if (press > 0) {
      ctx.strokeStyle = `rgba(214,33,42,${0.35 * press})`;
      ctx.lineWidth = 10 * S * press;
      rr(ctx, lx - 6 * S, ly + 330 * S, 262 * S, 70 * S, 35 * S);
      ctx.stroke();
    }
    ctx.fillStyle = "#fff";
    ctx.font = `600 ${21 * S}px ${font}`;
    ctx.fillText("Send enquiry  →", lx + 30 * S, ly + 366 * S);
    // cursor
    const cu = ease(seg(u, 0.12, 0.34));
    if (cu > 0) {
      const px = (lx + 420 * S) + (lx + 150 * S - (lx + 420 * S)) * cu;
      const py = (ly + 470 * S) + (ly + 372 * S - (ly + 470 * S)) * cu;
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, py + 30 * S);
      ctx.lineTo(px + 8 * S, py + 23 * S);
      ctx.lineTo(px + 19 * S, py + 22 * S);
      ctx.closePath();
      ctx.fill();
    }

    // 3. measurement and optimisation: shape-only funnel and loop. No data is shown.
    const a3 = 1;
    ctx.globalAlpha = uiA * a3;
    const mx = 56 * S;
    const my = (660 + (1 - a3) * 24) * S;
    ctx.fillStyle = "#eceff3";
    ctx.fillRect(0, 630 * S, w, 2 * S);
    ctx.fillStyle = "#6b7280";
    ctx.font = `500 ${17 * S}px ${font}`;
    ctx.fillText("MEASURE AND OPTIMISE", mx, my + 6 * S);
    ["Reach", "Visits", "Enquiries"].forEach((t, i) => {
      const bw = (560 - i * 130) * S * a3;
      ctx.fillStyle = i === 2 ? RED : i === 1 ? "#3b3f45" : "#c9ced6";
      rr(ctx, mx, my + (36 + i * 62) * S, Math.max(bw, 1), 40 * S, 8 * S);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.font = `500 ${19 * S}px ${font}`;
      ctx.fillText(t, mx + bw + 18 * S, my + (57 + i * 62) * S);
    });
    ["Test", "Learn", "Improve"].forEach((t, i) => {
      const x = 900 * S + i * 190 * S;
      const y = my + 96 * S;
      ctx.strokeStyle = "#cfd5dc";
      ctx.lineWidth = 2 * S;
      ctx.fillStyle = "#fff";
      rr(ctx, x, y, 150 * S, 52 * S, 26 * S);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.font = `500 ${20 * S}px ${font}`;
      ctx.fillText(t, x + 40 * S, y + 27 * S);
      if (i < 2) {
        ctx.fillStyle = RED;
        ctx.font = `600 ${28 * S}px ${font}`;
        ctx.fillText("›", x + 162 * S, y + 25 * S);
      }
    });
  }
  // The creative card is drawn once, here: it enters, then grows into the full-screen artwork as a
  // single moving shape (no second copy cross-fading over it, so nothing ghosts).
  const cw0 = 560 * S;
  const x0 = 56 * S;
  const y0 = (200 + (1 - a1) * 40) * S;
  const x = x0 * (1 - g);
  const y = y0 * (1 - g);
  const ww = cw0 + (w - cw0) * g;
  const hh = ww / ART_ASPECT;
  ctx.globalAlpha = a1;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 24 * S * (1 - g);
  ctx.shadowOffsetY = 8 * S * (1 - g);
  ctx.fillStyle = "#fff";
  rr(ctx, x, y, ww, hh, 10 * S * (1 - g));
  ctx.fill();
  ctx.restore();
  ctx.save();
  rr(ctx, x, y, ww, hh, 10 * S * (1 - g));
  ctx.clip();
  ctx.drawImage(art, x, y, ww, hh);
  ctx.restore();
  ctx.restore();
}
