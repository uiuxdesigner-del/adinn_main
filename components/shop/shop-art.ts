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
  // Everything is sized from the height and anchored to the left / right edge, so the layout is identical at 16:10
  // (the card) and simply gains space in the middle at wider proportions (the counter panel): nothing is stretched.
  const m = h * 0.112; // left margin (0.07 * 1.6h)
  // Half-disc, echoing the printed booklet cover.
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.arc(w - h * 0.416, h * 1.02, h * 0.62, Math.PI, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 ${h * 0.125}px ${font}`;
  ctx.fillText("Be seen.", m, h * 0.3);
  ctx.fillStyle = RED;
  ctx.fillText("Be chosen.", m, h * 0.3 + h * 0.15);
  ctx.fillStyle = "#4a4a4a";
  ctx.font = `400 ${h * 0.04}px ${font}`;
  ctx.fillText("Marketing that reaches people where they are.", m, h * 0.3 + h * 0.255);
  if (logo && logo.complete && logo.naturalWidth) {
    const lw = h * 0.32;
    ctx.drawImage(logo, m, h * 0.76, lw, (lw * logo.naturalHeight) / logo.naturalWidth);
  }
  ctx.restore();
}

export type Rect = { x: number; y: number; w: number; h: number };
/** One piece of the campaign (headline line, sentence, logo, red graphic): its own bitmap plus where it sits on the card and on the wall. */
export type ArtPart = { w: number; h: number; draw: (c: Ctx) => void; card: Rect; wall: Rect };

/**
 * The campaign split into pieces. Every piece is drawn once, at the card's size, and is then only moved/scaled: `card` is its place
 * in the 16:10 card (cw x ch, identical to drawArtwork), `wall` its place in the wide wall composition (ww x wh). Wall composition: the
 * headline on one line (~52% of the width), the sentence directly beneath it, the logo under that, the red half-disc across the
 * right ~31%, clear of all lettering; outer margins 7% of the width and 8% of the height. Same words, fonts, colours, logo ratio.
 */
export function artParts(ctx: Ctx, font: string, logo: HTMLImageElement | null, cw: number, ch: number, ww: number, wh: number): ArtPart[] {
  ctx.textBaseline = "alphabetic";
  const measure = (weight: number, size: number, t: string) => {
    ctx.font = `${weight} ${size}px ${font}`;
    return ctx.measureText(t).width;
  };
  // card geometry (as drawArtwork)
  const f = ch * 0.125;
  const fs = ch * 0.04;
  const m = ch * 0.112;
  const pad = 4;
  const w1 = measure(600, f, "Be seen.") + pad * 2;
  const w2 = measure(600, f, "Be chosen.") + pad * 2;
  const sentence = "Marketing that reaches people where they are.";
  const w3 = measure(400, fs, sentence) + pad * 2;
  const th = (size: number) => size * 1.05;
  // wall geometry
  const mx = ww * 0.07;
  const my = wh * 0.08;
  const tw = ww * 0.52;
  const a100 = measure(600, 100, "Be seen. ");
  const b100 = measure(600, 100, "Be chosen.");
  const fw = (tw / (a100 + b100)) * 100;
  const ft = (tw / measure(400, 100, sentence)) * 100;
  const base = my + fw * 0.72;
  const base2 = base + fw * 0.2 + ft * 0.75;
  const top = base2 + ft * 0.55;
  const k1 = fw / f;
  const k3 = ft / fs;
  const text = (t: string, weight: number, size: number, color: string) => (c: Ctx) => {
    c.textBaseline = "alphabetic";
    c.font = `${weight} ${size}px ${font}`;
    c.fillStyle = color;
    c.fillText(t, pad, size * 0.8);
  };
  const parts: ArtPart[] = [
    {
      w: Math.ceil(w1),
      h: Math.ceil(th(f)),
      draw: text("Be seen.", 600, f, INK),
      card: { x: m - pad, y: ch * 0.3 - f * 0.8, w: w1, h: th(f) },
      wall: { x: mx - pad * k1, y: base - fw * 0.8, w: w1 * k1, h: th(f) * k1 },
    },
    {
      w: Math.ceil(w2),
      h: Math.ceil(th(f)),
      draw: text("Be chosen.", 600, f, RED),
      card: { x: m - pad, y: ch * 0.45 - f * 0.8, w: w2, h: th(f) },
      wall: { x: mx + (a100 / 100) * fw - pad * k1, y: base - fw * 0.8, w: w2 * k1, h: th(f) * k1 },
    },
    {
      w: Math.ceil(w3),
      h: Math.ceil(th(fs)),
      draw: text(sentence, 400, fs, "#4a4a4a"),
      card: { x: m - pad, y: ch * 0.555 - fs * 0.8, w: w3, h: th(fs) },
      wall: { x: mx - pad * k3, y: base2 - ft * 0.8, w: w3 * k3, h: th(fs) * k3 },
    },
  ];
  if (logo && logo.naturalWidth) {
    const lwC = ch * 0.32;
    const lhC = (lwC * logo.naturalHeight) / logo.naturalWidth;
    const lhW = Math.min(wh - my - top, (ww * 0.2 * logo.naturalHeight) / logo.naturalWidth);
    parts.push({
      w: Math.ceil(lwC),
      h: Math.ceil(lhC),
      draw: (c) => c.drawImage(logo, 0, 0, lwC, lhC),
      card: { x: m, y: ch * 0.76, w: lwC, h: lhC },
      wall: { x: mx, y: top, w: (lhW * logo.naturalWidth) / logo.naturalHeight, h: lhW },
    });
  }
  const r = ch * 0.62;
  const gx0 = ww * 0.62;
  const gx1 = ww - mx;
  const ry = (wh - 2 * my) * 0.92;
  parts.push({
    w: Math.ceil(2 * r),
    h: Math.ceil(r),
    draw: (c) => {
      c.fillStyle = RED;
      c.beginPath();
      c.arc(r, r, r, Math.PI, 2 * Math.PI);
      c.closePath();
      c.fill();
    },
    card: { x: cw - ch * 0.416 - r, y: ch * 1.02 - r, w: 2 * r, h: r },
    wall: { x: gx0, y: wh - my - ry, w: gx1 - gx0, h: ry },
  });
  return parts;
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

/** The creative card's place and corner radius on the screen, in the 1536x825 design space (shop-story maps the lift from it). */
/** The page is designed at the TV screen's own proportions (67:36), so it is never stretched when mapped onto it. */
export const DESIGN_W = 1536;
export const DESIGN_H = 825;
export const CARD_DESIGN = { x: 850, y: 128, w: 560, radius: 18 };
/** Corner radius as a fraction of the card's width: the lifted card keeps exactly this proportion while it zooms. */
export const CARD_RADIUS_FRAC = CARD_DESIGN.radius / CARD_DESIGN.w;

/**
 * Digital Marketing: a clean, modern landing page drawn from interface primitives (nav, hero with headline and action,
 * the campaign card, three measurement tiles, a service band). No numbers and no invented clients: nothing is claimed.
 * Design space 1536x825 (S = w / 1536). u in 0..1 is the chapter's own progress: the page settles in, the cursor presses
 * "Send enquiry", the measurement tiles fill. The card is lifted out later by shop-story (cardOut leaves an empty slot).
 */
export function drawDigital(
  ctx: Ctx,
  w: number,
  h: number,
  u: number,
  font: string,
  art: HTMLCanvasElement,
  cardOut = false,
) {
  const S = w / DESIGN_W;
  const BG1 = "#fbf8f4";
  const BG2 = "#f0f2f6";
  const MUTE = "#6b7280";
  const LINE = "#e6e8ec";
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.textBaseline = "alphabetic";

  // background: soft warm-to-cool wash with one gentle brand glow
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, BG1);
  bg.addColorStop(1, BG2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(1180 * S, 300 * S, 0, 1180 * S, 300 * S, 520 * S);
  glow.addColorStop(0, "rgba(214,33,42,0.10)");
  glow.addColorStop(1, "rgba(214,33,42,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const text = (t: string, x: number, y: number, size: number, weight: number, color: string) => {
    ctx.font = `${weight} ${size * S}px ${font}`;
    ctx.fillStyle = color;
    ctx.fillText(t, x * S, y * S);
  };
  const panel = (x: number, y: number, cw: number, ch: number, r: number) => {
    ctx.save();
    ctx.shadowColor = "rgba(20,24,40,0.08)";
    ctx.shadowBlur = 28 * S;
    ctx.shadowOffsetY = 8 * S;
    ctx.fillStyle = "#ffffff";
    rr(ctx, x * S, y * S, cw * S, ch * S, r * S);
    ctx.fill();
    ctx.restore();
  };
  const rise = (a: number, b: number) => ease(seg(u, a, b)); // gentle settle-in, 0..1

  // ---- navigation ------------------------------------------------------------------------------------
  panel(40, 28, 1456, 72, 18);
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.arc(86 * S, 64 * S, 13 * S, 0, Math.PI * 2);
  ctx.fill();
  text("Your Brand", 112, 73, 24, 600, INK);
  ["Home", "Services", "Work", "Contact"].forEach((t, i) => text(t, 640 + i * 124, 71, 18, 500, MUTE));
  ctx.fillStyle = INK;
  rr(ctx, 1290 * S, 44 * S, 176 * S, 40 * S, 20 * S);
  ctx.fill();
  text("Get started", 1318, 71, 17, 600, "#ffffff");

  // ---- hero copy ------------------------------------------------------------------------------------
  const h1 = rise(0, 0.12);
  ctx.save();
  ctx.globalAlpha = h1;
  ctx.translate(0, (1 - h1) * 14 * S);
  ctx.fillStyle = "rgba(214,33,42,0.10)";
  rr(ctx, 96 * S, 150 * S, 214 * S, 40 * S, 20 * S);
  ctx.fill();
  text("Digital Marketing", 120, 176, 17, 600, RED);
  text("Turn attention", 96, 262, 62, 600, INK);
  text("into ", 96, 334, 62, 600, INK);
  ctx.font = `600 ${62 * S}px ${font}`;
  const wInto = ctx.measureText("into ").width / S;
  text("action.", 96 + wInto, 334, 62, 600, RED);
  text("Search, content, media and websites, planned", 96, 386, 21, 400, MUTE);
  text("together to bring in enquiries.", 96, 418, 21, 400, MUTE);
  ctx.restore();

  // primary action (the cursor presses it)
  const press = ease(seg(u, 0.36, 0.44)) * (1 - ease(seg(u, 0.46, 0.56)));
  ctx.fillStyle = INK;
  rr(ctx, 96 * S, 450 * S, 232 * S, 58 * S, 29 * S);
  ctx.fill();
  if (press > 0) {
    ctx.strokeStyle = `rgba(17,17,17,${0.22 * press})`;
    ctx.lineWidth = 9 * S * press;
    rr(ctx, 90 * S, 444 * S, 244 * S, 70 * S, 35 * S);
    ctx.stroke();
  }
  text("Send enquiry  →", 128, 485, 20, 600, "#ffffff");
  text("See how it works", 360, 485, 19, 500, INK);
  ctx.fillStyle = INK;
  ctx.fillRect(360 * S, 494 * S, 150 * S, 2 * S);
  const cu = ease(seg(u, 0.12, 0.34));
  if (cu > 0) {
    const px = (330 + (250 - 330) * cu) * S;
    const py = (560 + (494 - 560) * cu) * S;
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py + 30 * S);
    ctx.lineTo(px + 8 * S, py + 23 * S);
    ctx.lineTo(px + 19 * S, py + 22 * S);
    ctx.closePath();
    ctx.fill();
  }

  // ---- three measurement tiles (shapes only, no figures) ---------------------------------------------
  const tiles = [
    { x: 850, label: "Reach" },
    { x: 1046, label: "Visits" },
    { x: 1242, label: "Enquiries" },
  ];
  tiles.forEach((t, i) => {
    const a = ease(seg(u, 0.1 + i * 0.07, 0.34 + i * 0.07));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(0, (1 - a) * 18 * S);
    panel(t.x, 500, 168, 112, 18);
    text(t.label, t.x + 18, 532, 15, 500, MUTE);
    if (i === 0) {
      ctx.lineWidth = 9 * S;
      ctx.lineCap = "round";
      ctx.strokeStyle = LINE;
      ctx.beginPath();
      ctx.arc((t.x + 50) * S, 572 * S, 21 * S, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = RED;
      ctx.beginPath();
      ctx.arc((t.x + 50) * S, 572 * S, 21 * S, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.45 * a);
      ctx.stroke();
      ctx.fillStyle = LINE;
      rr(ctx, (t.x + 90) * S, 562 * S, 62 * S, 8 * S, 4 * S);
      ctx.fill();
      rr(ctx, (t.x + 90) * S, 580 * S, 42 * S, 8 * S, 4 * S);
      ctx.fill();
    } else if (i === 1) {
      [28, 44, 36, 56].forEach((bh, k) => {
        ctx.fillStyle = k === 3 ? RED : "#d5d9e0";
        rr(ctx, (t.x + 22 + k * 36) * S, (598 - bh) * S, 24 * S, bh * S, 7 * S);
        ctx.fill();
      });
    } else {
      ctx.strokeStyle = RED;
      ctx.lineWidth = 4 * S;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      [
        [22, 592],
        [58, 576],
        [92, 584],
        [124, 560],
        [148, 552],
      ].forEach(([px, py], k) => {
        if (k === 0) ctx.moveTo((t.x + px) * S, py * S);
        else ctx.lineTo((t.x + px) * S, py * S);
      });
      ctx.stroke();
    }
    ctx.restore();
  });

  // ---- service band -----------------------------------------------------------------------------------
  const bandA = rise(0.06, 0.28);
  ctx.save();
  ctx.globalAlpha = bandA;
  ctx.translate(0, (1 - bandA) * 20 * S);
  ctx.fillStyle = INK;
  rr(ctx, 0, 640 * S, w, 400 * S, 36 * S);
  ctx.fill();
  text("Planned together. Measured together.", 96, 712, 30, 600, "#ffffff");
  ["Search", "Content", "Media", "Websites"].forEach((t, i) => {
    const px = 96 + i * 168;
    ctx.fillStyle = "rgba(255,255,255,0.10)";
    rr(ctx, px * S, 744 * S, 150 * S, 44 * S, 22 * S);
    ctx.fill();
    ctx.font = `500 ${18 * S}px ${font}`;
    ctx.fillStyle = "#ffffff";
    const tw = ctx.measureText(t).width;
    ctx.fillText(t, px * S + (150 * S - tw) / 2, 772 * S);
  });
  ctx.restore();

  // ---- the campaign card ----------------------------------------------------------------------------
  // Drawn once. While it is lifted out (cardOut) the screen keeps an empty slot of the same shape: never a second copy.
  const { x: cx0, y: cy0, w: cw0, radius } = CARD_DESIGN;
  const ch0 = cw0 / ART_ASPECT;
  const ca = rise(0, 0.14);
  ctx.save();
  ctx.globalAlpha = ca;
  ctx.translate(0, (1 - ca) * 20 * S);
  if (cardOut) {
    ctx.fillStyle = "#eceef2";
    rr(ctx, cx0 * S, cy0 * S, cw0 * S, ch0 * S, radius * S);
    ctx.fill();
  } else {
    ctx.save();
    ctx.shadowColor = "rgba(20,24,40,0.16)";
    ctx.shadowBlur = 32 * S;
    ctx.shadowOffsetY = 10 * S;
    ctx.fillStyle = "#ffffff";
    rr(ctx, cx0 * S, cy0 * S, cw0 * S, ch0 * S, radius * S);
    ctx.fill();
    ctx.restore();
    ctx.save();
    rr(ctx, cx0 * S, cy0 * S, cw0 * S, ch0 * S, radius * S);
    ctx.clip();
    ctx.drawImage(art, cx0 * S, cy0 * S, cw0 * S, ch0 * S);
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();
}
