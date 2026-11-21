import { BOARD, BOARD_PANEL, FRONT } from "./shop-config";

/** Space around the red panel inside the board element: room for the frame rings and the soft drop shadow. Matches .sh-board-* in globals.css. */
export const BOARD_PAD = 48;

/** Panel size in storefront units (the sign panel inside the fascia). */
export function boardPanel() {
  const fa = FRONT.fascia;
  return { w: fa.w * (1 - 2 * BOARD_PANEL.inset), h: fa.h * (1 - 2 * BOARD_PANEL.insetY) };
}

function rrect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

/**
 * Paints the whole Havells sign board ONCE into a canvas: soft drop shadow, three frame rings, the lit red panel (gradients and inner
 * shading) and the signboard photograph with its soft side fade. It mirrors the CSS fallback (.sh-board-drop / -frame / -in) layer for
 * layer. As a finished bitmap the compositor only scales it while the camera moves; as live CSS (blurred shadows, masks, clipped
 * rounded corners) the browser had to repaint it at every new zoom scale, which is what tore the sign on slower machines.
 *
 * `scale` is canvas pixels per storefront unit (the largest zoom the board is seen at). Returns false if it could not paint, in which
 * case the CSS fallback stays visible.
 */
export function paintBoard(canvas: HTMLCanvasElement, img: HTMLImageElement, scale: number): boolean {
  const P = boardPanel();
  const W = P.w + BOARD_PAD * 2;
  const H = P.h + BOARD_PAD * 2;
  const pw = Math.round(W * scale);
  const ph = Math.round(H * scale);
  if (!img.complete || !img.naturalWidth || pw < 2 || ph < 2) return false;
  const c = canvas.getContext("2d");
  if (!c) return false;
  canvas.width = pw;
  canvas.height = ph;
  c.clearRect(0, 0, pw, ph);
  const k = pw / W; // exact pixels per unit
  const px = BOARD_PAD * k;
  const py = BOARD_PAD * k;
  const w = P.w * k;
  const h = P.h * k;
  const R = 6 * k;

  // 1. drop shadow: 0 14px 26px rgba(0,0,0,.35) (CSS blur 26px = canvas shadowBlur 26 in device px)
  c.save();
  c.shadowColor = "rgba(0,0,0,0.35)";
  c.shadowBlur = 26 * k;
  c.shadowOffsetY = 14 * k;
  c.fillStyle = "#000";
  rrect(c, px, py, w, h, R);
  c.fill();
  c.restore();
  // the caster itself sits under the opaque rings and panel; only the 1px outer ring is translucent, over the shadow, as in CSS

  // 2. frame rings, outside in: 1px dark (25% black), 2px grey, 5px light
  const ring = (grow: number, color: string) => {
    c.fillStyle = color;
    rrect(c, px - grow * k, py - grow * k, w + grow * 2 * k, h + grow * 2 * k, R + grow * k);
    c.fill();
  };
  ring(8, "rgba(0,0,0,0.25)");
  ring(7, "#8d9296");
  ring(5, "#d9dcde");

  // 3. panel: horizontal red, then the vertical light/dark wash on top
  c.save();
  rrect(c, px, py, w, h, R);
  c.clip();
  const gx = c.createLinearGradient(px, 0, px + w, 0);
  gx.addColorStop(0, "#a9050f");
  gx.addColorStop(0.2, "#bb0818");
  gx.addColorStop(0.8, "#bb0818");
  gx.addColorStop(1, "#a9050f");
  c.fillStyle = gx;
  c.fillRect(px, py, w, h);
  const gy = c.createLinearGradient(0, py, 0, py + h);
  gy.addColorStop(0, "rgba(255,255,255,0.16)");
  gy.addColorStop(0.12, "rgba(255,255,255,0)");
  gy.addColorStop(0.8, "rgba(0,0,0,0)");
  gy.addColorStop(1, "rgba(0,0,0,0.22)");
  c.fillStyle = gy;
  c.fillRect(px, py, w, h);

  // inner shading: inset 0 -10px 18px rgba(0,0,0,.18), then inset 0 0 0 2px rgba(255,255,255,.18) on top
  c.save();
  c.shadowColor = "rgba(0,0,0,0.18)";
  c.shadowBlur = 18 * k;
  c.shadowOffsetY = -10 * k;
  c.fillStyle = "#000";
  c.beginPath();
  c.rect(px - 200 * k, py - 200 * k, w + 400 * k, h + 400 * k);
  c.roundRect(px, py, w, h, R);
  c.fill("evenodd");
  c.restore();
  c.strokeStyle = "rgba(255,255,255,0.18)";
  c.lineWidth = 4 * k;
  rrect(c, px, py, w, h, R);
  c.stroke();

  // 4. the signboard photograph: full panel height, centred, faded to transparent over its outer 14% on each side
  const iw = h * BOARD.aspect;
  const ix = px + (w - iw) / 2;
  const tmp = document.createElement("canvas");
  tmp.width = Math.max(1, Math.round(iw));
  tmp.height = Math.max(1, Math.round(h));
  const t = tmp.getContext("2d");
  if (!t) {
    c.restore();
    return false;
  }
  t.drawImage(img, 0, 0, tmp.width, tmp.height);
  t.globalCompositeOperation = "destination-in";
  const gm = t.createLinearGradient(0, 0, tmp.width, 0);
  gm.addColorStop(0, "rgba(0,0,0,0)");
  gm.addColorStop(0.14, "#000");
  gm.addColorStop(0.86, "#000");
  gm.addColorStop(1, "rgba(0,0,0,0)");
  t.fillStyle = gm;
  t.fillRect(0, 0, tmp.width, tmp.height);
  c.drawImage(tmp, ix, py);
  c.restore();
  return true;
}
