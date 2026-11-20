"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { enquiryHref } from "@/lib/navigation";
import { matrix3d, solveHomography, type P2 } from "../outdoor/geometry";
import { ART_ASPECT, CARD_DESIGN, CARD_RADIUS_FRAC, DESIGN_H, DESIGN_W, canvasOf, drawArtwork, drawDigital, artParts, type ArtPart } from "./shop-art";
import { StorefrontScene } from "./storefront-scene";
import {
  BOARD_PANEL,
  BOOK,
  FILES,
  FRONT,
  IMG,
  interiorPlace,
  LAPTOP_SCREEN,
  PRINT_FOCUS,
  PRINT_IMG,
  SHOP,
  SHOP_COPY,
  WALL,
} from "./shop-config";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const LIVE = "(prefers-reduced-motion: no-preference) and (min-height: 420px)";

// Canvas sizes are ~1.56x the 1536x960 design space of shop-art's drawDigital (S = h / 960), so the screen and the card stay
// sharp when the camera fills the display with them. Everything below is expressed relative to these.
const AW = 2400;
const AH = 1500;
const SW = 2400;
const SH = Math.round((SW * DESIGN_H) / DESIGN_W); // the screen canvas has the TV's own proportions (shop-art design space)
const CS = SW / 1536;
const BZ = 48 * CS; // laptop bezel (px of the plate canvas)
const CARD = { x: CARD_DESIGN.x * CS, y: CARD_DESIGN.y * CS, w: CARD_DESIGN.w * CS }; // the creative card's place on the TV screen (shop-art drawDigital, screen px)
/**
 * EASY ADJUST for the shop view after the zoom-out (in photo pixels, 0 = default).
 *   y: + moves the image UP (shows more street at the bottom), - moves it DOWN (shows more of the sign board). Keep y >= 0.
 *   x: + moves the image LEFT, - moves it RIGHT. Keep x near 0 or side margins appear.
 */
const FIX_VIEW = { x: 0, y: 0 };
const unit: P2[] = [
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
];
const applyH = (h: number[], x: number, y: number): P2 => {
  const w = h[6] * x + h[7] * y + 1;
  return { x: (h[0] * x + h[1] * y + h[2]) / w, y: (h[3] * x + h[4] * y + h[5]) / w };
};
/** A rectangle given in a plane's unit coordinates, mapped onto the plane's photographed corners. */
function planeRect(corners: [number, number][], r: { u0: number; u1: number; v0: number; v1: number }): P2[] {
  const H = solveHomography(unit, corners.map(([x, y]) => ({ x, y })));
  return [applyH(H, r.u0, r.v0), applyH(H, r.u1, r.v0), applyH(H, r.u1, r.v1), applyH(H, r.u0, r.v1)];
}
const bookArt = planeRect(BOOK.page, BOOK.art);
const wallArt = planeRect(WALL.quad, WALL.art);
// Wall plane size in image px (mean of opposite edges): the wide painted artwork and the card it grows out of are laid on it.
const wd = (a: number, b: number) => Math.hypot(WALL.quad[a][0] - WALL.quad[b][0], WALL.quad[a][1] - WALL.quad[b][1]);
const WALL_W = (wd(0, 1) + wd(3, 2)) / 2;
const WALL_H = (wd(0, 3) + wd(1, 2)) / 2;
const WALL_CH = 750;
const WALL_CW = Math.round((WALL_CH * ((WALL.art.u1 - WALL.art.u0) * WALL_W)) / ((WALL.art.v1 - WALL.art.v0) * WALL_H));
// the Digital/POP card (16:10) sits at the left end of the painted artwork, same height, so its text and logo coincide with the painted ones
const wallCardU1 = WALL.art.u0 + (((WALL.art.v1 - WALL.art.v0) * WALL_H * ART_ASPECT) / WALL_W);
const wallCard = planeRect(WALL.quad, { u0: WALL.art.u0, u1: wallCardU1, v0: WALL.art.v0, v1: WALL.art.v1 });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Monotone cubic through keys: no overshoot, continuous velocity, flat where keys repeat. */
function pchip(xs: number[], ys: number[]) {
  const n = xs.length;
  const h: number[] = [];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h.push(xs[i + 1] - xs[i]);
    d.push((ys[i + 1] - ys[i]) / h[i]);
  }
  const m = new Array<number>(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] > 0) {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  const end = (h0: number, h1: number, d0: number, d1: number) => {
    let v = ((2 * h0 + h1) * d0 - h0 * d1) / (h0 + h1);
    if (Math.sign(v) !== Math.sign(d0)) v = 0;
    else if (Math.sign(d0) !== Math.sign(d1) && Math.abs(v) > 3 * Math.abs(d0)) v = 3 * d0;
    return v;
  };
  m[0] = end(h[0], h[1], d[0], d[1]);
  m[n - 1] = end(h[n - 2], h[n - 3], d[n - 2], d[n - 3]);
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const t = (x - xs[i]) / h[i];
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h[i] * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h[i] * m[i + 1]
    );
  };
}

/**
 * Signage -> doorway -> fixtures -> laptop / Digital Marketing -> booklet / Printing & POP -> wall.
 *
 * Image-based camera: one pinned stage and one ScrollTrigger drive a single progress value. The
 * storefront photograph is panned and scaled (straight lines are never skewed); door leaves slide
 * inside a clipped aperture; the interior photograph, aligned to the doorway by measurement, takes
 * over beneath a short matched dissolve; the in-code screen is mapped into the laptop's measured
 * corners and then grows to fill the view; the same campaign artwork is mapped onto the booklet
 * page and the street wall, each rectified to fill the view and then released to the photograph.
 * Reduced motion, no JavaScript and small-height screens get static chapters in the same order.
 */
export function ShopStory() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;
      const mm = gsap.matchMedia();
      mm.add(LIVE, () => {
        const q = <T extends HTMLElement>(s: string) => rootEl.querySelector<T>(s)!;
        const stage = q("[data-stage]");
        const world = q("[data-world]");
        const doorL = q("[data-door-l]");
        const sideL = q("[data-side-l]");
        const sideR = q("[data-side-r]");
        const doorR = q("[data-door-r]");
        const front = q("[data-front]");
        const tone = q("[data-tone]");
        const aperture = q("[data-aperture]");
        const interior = q("[data-interior]");
        const sign = q("[data-sign]");
        const board = q("[data-havells]");
        const kArt = FRONT.fascia.h / 970;
        const screen = q<HTMLCanvasElement>("[data-screen]");
        const screenClip = q("[data-screenclip]");
        const cardEl = q<HTMLCanvasElement>("[data-card]");
        const print = q("[data-print]");
        const printPhoto = q("[data-print-photo]");
        const printArtA = q<HTMLCanvasElement>("[data-print-a]");
        const printClip = q("[data-print-clip]");
        const printArtM = q<HTMLCanvasElement>("[data-print-m]");
        const printShade = q("[data-print-shade]");
        const wall = q("[data-wall]");
        const wallPhoto = q("[data-wall-photo]");
        const wallArtA = q<HTMLCanvasElement>("[data-wall-a]");
        const wallEls = Array.from(rootEl.querySelectorAll<HTMLCanvasElement>("[data-wall-e]"));
        let wallParts: ArtPart[] = [];
        const wallShade = q("[data-wall-shade]");
        const copies = Array.from(rootEl.querySelectorAll<HTMLElement>("[data-copy]"));
        const headerH = () => document.querySelector("header")?.offsetHeight ?? 72;

        let Vw = 0;
        let Vh = 0;
        let ready = false;
        const state = { p: 0 };
        rootEl.setAttribute("data-live", "");
        const R = SHOP.R;
        const ap = FRONT.aperture;
        const fa = FRONT.fascia;

        // ---- TV screen in storefront coordinates ---------------------------------------------------
        // The interior photograph is rendered at interiorPlace (StorefrontScene) with NO extra scale, so the
        // TV corners map through exactly that placement: world = place + imagePx * (place.w / IMG.w).
        const ik = interiorPlace.w / IMG.w;
        const apC = { x: FRONT.aperture.x + FRONT.aperture.w / 2, y: FRONT.aperture.y + FRONT.aperture.h / 2 };
        const lapWorld: P2[] = LAPTOP_SCREEN.map(([x, y]) => ({ x: interiorPlace.x + x * ik, y: interiorPlace.y + y * ik }));
        const lapCx = lapWorld.reduce((a, b) => a + b.x, 0) / 4;
        const lapCy = lapWorld.reduce((a, b) => a + b.y, 0) / 4;

        // ---- canvases ------------------------------------------------------------------------------
        let font = "sans-serif";
        const [art, actx] = canvasOf(AW, AH);
        const [ui, uctx] = canvasOf(SW, SH);
        const sctx = screen.getContext("2d")!;
        screen.width = SW + BZ * 2;
        screen.height = SH + BZ * 2;
        let lastU = -1;
        let lastOut = false;
        const drawScreen = (u: number, cardOut = false) => {
          if (Math.abs(u - lastU) < 0.002 && cardOut === lastOut) return;
          lastU = u;
          lastOut = cardOut;
          drawDigital(uctx, SW, SH, u, font, art, cardOut);
          sctx.clearRect(0, 0, screen.width, screen.height);
          sctx.fillStyle = "#101112";
          sctx.beginPath();
          sctx.roundRect(0, 0, screen.width, screen.height, 36);
          sctx.fill();
          sctx.drawImage(ui, BZ, BZ);
        };
        const paintArt = () => {
          drawArtwork(actx, AW, AH, font, logoImg);
          for (const c of [printArtA, printArtM, cardEl]) {
            c.width = AW;
            c.height = AH;
            const cctx = c.getContext("2d")!;
            // The card (and the printed panel it becomes) keeps the SAME corner radius, in proportion, all the way
            // through the zoom; the wall artwork stays square.
            {
              cctx.save();
              cctx.beginPath();
              cctx.roundRect(0, 0, AW, AH, AW * CARD_RADIUS_FRAC);
              cctx.clip();
              cctx.drawImage(art, 0, 0);
              cctx.restore();
            }
          }
          // the wall layer's paper: the card's cream sheet only (same rounded shape); its lettering, logo and graphic are separate pieces
          wallArtA.width = AW;
          wallArtA.height = AH;
          {
            const pc = wallArtA.getContext("2d")!;
            pc.fillStyle = "#f6f1e9";
            pc.beginPath();
            pc.roundRect(0, 0, AW, AH, AW * CARD_RADIUS_FRAC);
            pc.fill();
          }
          // the campaign pieces: each is drawn once at the card's size and afterwards only moved/scaled
          wallParts = artParts(actx, font, logoImg, AW, AH, WALL_CW, WALL_CH);
          wallEls.forEach((el, i) => {
            const part = wallParts[i];
            if (!part) return;
            el.width = part.w;
            el.height = part.h;
            part.draw(el.getContext("2d")!);
          });
          lastU = -1;
          drawScreen(clamp(seg(state.p, R.digital[0], R.digital[1])), seg(state.p, R.cardLift[0], R.cardLift[1]) > 0);
        };
        const logoImg = new Image();
        logoImg.src = FILES.logo;

        // ---- planar plates: artwork mapped into measured quads ------------------------------------
        const fixPlate = (shade: HTMLElement, quad: P2[]) => {
          shade.style.clipPath = `polygon(${quad.map((p) => `${p.x}px ${p.y}px`).join(",")})`;
        };
        fixPlate(printShade, bookArt);
        fixPlate(wallShade, wallArt);

        // ---- geometry helpers ------------------------------------------------------------------------
        /** The rectangle of ART_ASPECT that fills (landscape: covers) the view. */
        const fillRect = (): P2[] => {
          const portrait = Vw < Vh;
          let w = Vw;
          let h = w / ART_ASPECT;
          if (!portrait && h < Vh) {
            h = Vh;
            w = h * ART_ASPECT;
          }
          return [
            { x: (Vw - w) / 2, y: (Vh - h) / 2 },
            { x: (Vw + w) / 2, y: (Vh - h) / 2 },
            { x: (Vw + w) / 2, y: (Vh + h) / 2 },
            { x: (Vw - w) / 2, y: (Vh + h) / 2 },
          ];
        };
        const artRect: P2[] = [
          { x: 0, y: 0 },
          { x: AW, y: 0 },
          { x: AW, y: AH },
          { x: 0, y: AH },
        ];
        /**
         * The print camera (photo uniform scale cs + shift tx,ty) and the card's fixed place on the counter (IMAGE coordinates).
         * s = 0: the card has exactly the Digital card's size and the view never shows past the photo's edge (the pan is clamped);
         * the Digital card's final rectangle is taken from this same s = 0 state, so the hand-off is exact. s = 1: reading view.
         */
        const printGeom = (s: number) => {
          const dim = PRINT_IMG;
          const c1 = Math.max(Vw / dim.w, Vh / dim.h);
          const pcx = bookArt.reduce((a, b2) => a + b2.x, 0) / 4;
          const pcy = bookArt.reduce((a, b2) => a + b2.y, 0) / 4;
          const cardW = Math.max(bookArt[1].x - bookArt[0].x, bookArt[2].x - bookArt[3].x) + 2; // 2 image px wider than the panel: the window trims it
          const cardH = cardW / (AW / AH);
          const TEXT_MID = 0.41; // vertical centre of the headline/tagline block, as a fraction of the card height
          const cx0 = pcx - cardW / 2;
          const cy0 = pcy - TEXT_MID * cardH;
          const t0 = fillRect();
          const c0 = Math.max(c1, (t0[1].x - t0[0].x) / cardW);
          const cs = Math.exp(lerp(Math.log(c0), Math.log(c1), s));
          const g = c0 === c1 ? 1 : (1 / cs - 1 / c0) / (1 / c1 - 1 / c0); // pans linearly in view size: the zoom stays a straight glide
          const fx = lerp(cx0 + cardW / 2, PRINT_FOCUS.x, g);
          const fy = lerp(cy0 + cardH / 2, PRINT_FOCUS.y, g);
          const tx = Math.min(0, Math.max(Vw - dim.w * cs, Vw / 2 - fx * cs));
          const ty = Math.min(0, Math.max(Vh - dim.h * cs, Vh / 2 - fy * cs));
          return { dim, cs, tx, ty, cx0, cy0, cardW, cardH };
        };
        // ---- camera keys (storefront coordinates) ---------------------------------------------------
        // Sign slide distances (storefront units). They are sized to what the zoomed camera can actually see, so the
        // Adinn art leaves and the Havells board enters from the right edge of the VIEW (not from a fascia-width away,
        // which left the visible fascia empty/white for part of the swap).
        const slide = { out: fa.w / 2 + kArt * 1000 + 24, inn: fa.w + 24 };
        const zero = (x: number) => x * 0;
        const fns = { cx: zero, cy: zero, ls: zero };
        const buildKeys = () => {
          const portrait = Vw < Vh;
          const cx0 = fa.x + fa.w / 2;
          const cy0 = fa.y + fa.h / 2;
          // Opening frame: the Outdoor board's art fills the view exactly (so the zoom continues); never
          // smaller than the cover scale, so the photograph always fills the view (no exposed gaps).
          const cover = Math.max(Vw / IMG.w, Vh / IMG.h);
          const sFascia = Math.max(cover, portrait ? Math.min(Vw / (2000 * kArt), Vh / fa.h) : Math.max(Vw / (2000 * kArt), Vh / fa.h));
          const sWide = portrait ? Math.max(Vw / 760, (Vh / IMG.h) * 1.02) : Math.max(Vw / 1440, Math.max(Vw / IMG.w, Vh / IMG.h) * 1.02);
          // the whole interior photograph (as placed in the doorway) fits the view
          const visHalf = Vw / (2 * sFascia);
          const boardW = fa.w * (1 - 2 * BOARD_PANEL.inset);
          slide.out = Math.min(fa.w / 2 + kArt * 1000 + 24, visHalf + kArt * 1000 + 12);
          slide.inn = Math.min(fa.w + 24, visHalf + boardW / 2 + 12);
          const tvW = Math.hypot(lapWorld[1].x - lapWorld[0].x, lapWorld[1].y - lapWorld[0].y);
          const tvH = Math.hypot(lapWorld[3].x - lapWorld[0].x, lapWorld[3].y - lapWorld[0].y);
          const sFull = 0.9 * Math.min(Vw / interiorPlace.w, Vh / interiorPlace.h); // 0.9: a visible margin so the whole photograph reads as uncropped
          // Portrait screens cannot fit the photo's width at a readable size (it would shrink into grey bands): hold at the
          // same cover framing the doorway already has while the doors open. Landscape keeps the whole-photo fit.
          const sHold = portrait ? sWide * 1.03 : sFull;
          const sLap = (portrait ? Math.min : Math.max)(Vw / tvW, Vh / tvH); // all the way in: the TV screen COVERS the display, so no TV frame or bezel is left in view (portrait: fits the width so no content is cut)
          // Landscape: a PROPER zoom-out: the whole storefront photo fits the view (sign board, shop and street all visible, centred).
          // The strips left/right of the photo on wide screens are filled by the extended exterior photo (BG in shop-config.ts), so there are no
          // empty margins. Portrait keeps its cover framing, moved so the top of the photo (the sign board) is in view.
          const sSee = portrait ? sHold : Math.min(Vw / IMG.w, Vh / IMG.h);
          const holdY = portrait ? Math.min(apC.y, Vh / (2 * sSee)) + FIX_VIEW.y : IMG.h / 2 + FIX_VIEW.y;
          const holdX = portrait ? apC.x : IMG.w / 2;
          type K = [number, number, number, number]; // p, cx, cy, s
          // Evenly paced: each stretch changes the framing by a modest amount per scroll distance.
          const keys: K[] = [
            [0, cx0, cy0, sFascia],
            [0.15, cx0, cy0, sFascia], // hold on the zoomed-in board while the sign swap plays
            // Zoom out in ONE move straight to the full-view framing, finished by 0.25. After that the camera does not move
            // at all until the TV approach, so the doors open on a fully zoomed-out, still shop.
            [0.25, holdX + FIX_VIEW.x, holdY, sSee],
            [0.37, holdX + FIX_VIEW.x, holdY, sSee], // doors are open (0.36): hold ends here
            // Getting into the shop: ONE long glide from the open doors (0.37) to the TV filling the display (0.63). Zoom is exponential,
            // so the framing is keyed at equal time steps with a slightly slowing log-zoom (u): a constant rate would feel like it speeds
            // up as the TV grows, so the last stretch eases instead of rushing into the Digital chapter.
            ...[0.2, 0.4, 0.6, 0.8].map((t, i): K => {
              const u = [0.22, 0.44, 0.64, 0.83][i];
              const sz = Math.exp(lerp(Math.log(sSee), Math.log(sLap), u));
              const gg = (1 / sz - 1 / sSee) / (1 / sLap - 1 / sSee); // pan linear in view size: the TV stays on a straight line
              return [0.37 + 0.26 * t, holdX + FIX_VIEW.x + (lapCx - holdX - FIX_VIEW.x) * gg, holdY + (lapCy - holdY) * gg, sz];
            }),
            [0.63, lapCx, lapCy, sLap],
            [1, lapCx, lapCy, sLap],
          ];
          // never expose the photograph's edge: clamp every key's centre to the image
          for (const kk of keys) {
            if (kk[3] === sFull) continue; // the contained, centred full-photo frame is intentionally not clamped
            const hw = Vw / (2 * kk[3]);
            const hh = Vh / (2 * kk[3]);
            kk[1] = IMG.w < 2 * hw ? IMG.w / 2 : Math.min(IMG.w - hw, Math.max(hw, kk[1]));
            kk[2] = IMG.h < 2 * hh ? IMG.h / 2 : Math.min(IMG.h - hh, Math.max(hh, kk[2]));
          }
          const ps = keys.map((x) => x[0]);
          fns.cx = pchip(ps, keys.map((x) => x[1]));
          fns.cy = pchip(ps, keys.map((x) => x[2]));
          fns.ls = pchip(ps, keys.map((x) => Math.log(x[3])));
        };

        const show = (el: HTMLElement, o: number) => {
          el.style.opacity = String(o);
          el.style.visibility = o < 0.01 ? "hidden" : "visible";
          el.style.transform = `translate3d(0, ${(1 - o) * 16}px, 0)`;
        };
        const vis = (el: HTMLElement, on: boolean) => (el.style.visibility = on ? "visible" : "hidden");

        const render = () => {
          if (!ready) return;
          const p = state.p;
          const inWorld = p < R.print[0];
          const inPrint = p >= R.print[0] && p < R.wall[0];
          const inWall = p >= R.wall[0];
          vis(world, inWorld);
          vis(print, inPrint);
          if (!inWorld) vis(cardEl, false); // the print scene starts from the card's final rectangle
          vis(wall, inWall);

          if (inWorld) {
            const s = Math.exp(fns.ls(p));
            const cx = fns.cx(p);
            const cy = fns.cy(p);
            world.style.transform = `translate3d(${Vw / 2}px, ${Vh / 2}px, 0) scale(${s}) translate3d(${-cx}px, ${-cy}px, 0)`;
            // the photograph is magnified far beyond its resolution while the camera closes in on the TV: soften it as depth of
            // field (pixels merge) instead of showing blocks. Only ever applied past a safe scale.
            // Only during the TV approach (after the Fixtures hold). The zoomed-in sign scene at the start is also above this scale
            // and must stay sharp.
            // NOTE: a CSS blur is applied BEFORE the element's scale, so blur(2.5px) at scale 5 looked like 12px on screen. Express it
            // in screen pixels (divide by the camera scale): a small, constant softness, only during the approach to the TV.
            const softPx = p > 0.57 && s > 2.6 ? 0.9 : 0;
            world.style.filter = softPx > 0 ? `blur(${(softPx / s).toFixed(3)}px)` : "";
            // doors: both leaves, one progress, clipped inside the aperture
            const d = smooth(seg(p, R.door[0], R.door[1]));
            // Only the two sliding leaves move while the doors open. They slide out of the doorway (clipped to it, behind
            // the stationary fixed side glass, frame and jambs). The side glass is not part of the opening motion.
            const sideW = (FRONT.aperture.w - FRONT.doorW * 2) / 2;
            const exit = FRONT.doorW + sideW + 14;
            doorL.style.transform = `translate3d(${-d * exit}px,0,0)`;
            doorR.style.transform = `translate3d(${d * exit}px,0,0)`;
            // the banner's surface settles into the fascia as the view pulls back
            tone.style.opacity = String(1 - smooth(seg(p, R.plate[0], R.plate[1])));
            // the Adinn art leaves to the left and the Havells signboard enters from the right (one progress, both inside the fascia)
            // The board starts entering while the art is still leaving (two separate pieces sliding past each other,
            // never overlapping), so the view is never left empty.
            const swOut = smooth(seg(p, R.swap[0], R.swap[1]));
            const swIn = smooth(seg(p, R.swap[1] - 0.04, R.swap[2] - 0.01));
            // beyond the visible window the art keeps travelling (still off-screen) until it has cleared the whole fascia, so
            // no Adinn logo is left on the shop fascia once the camera zooms out
            const fullOut = fa.w / 2 + kArt * 1000 + 24;
            const extra = (fullOut - slide.out) * smooth(seg(p, R.swap[1], R.swap[2]));
            sign.style.transform = `translateX(${(-(swOut * slide.out + extra)).toFixed(2)}px)`;
            board.style.transform = `translateX(${((1 - swIn) * slide.inn).toFixed(2)}px)`;
            // The doorway stays as it is after the doors open: the shop stays inside it (no widening, no backing), and the
            // frame, jambs and fixed side glass never move. Only the two leaves slide, clipped to the doorway.
            aperture.style.overflow = "hidden";
            const doorsGone = d >= 1; // fully out of the doorway
            vis(doorL, !doorsGone);
            vis(doorR, !doorsGone);
            // TV screen: always mapped into the photographed corners and never grows. Only the card inside it is lifted out.
            // The TV is already on: it is always there, and only the sliding door leaf covers it
            // (the clip follows the leaf's edge, so it is revealed exactly as the doors open).
            const on = true;
            vis(screen, on);
            const dOpen = smooth(seg(p, R.door[0], R.door[1]));
            const leafEdge = ap.x + (ap.w - FRONT.doorW * 2) / 2 + FRONT.doorW - dOpen * (FRONT.doorW - 4);
            screenClip.style.clipPath = dOpen >= 1 ? "none" : `inset(0 0 0 ${Math.max(0, (leafEdge - cx) * s + Vw / 2)}px)`;
            if (on) {
              const inner = lapWorld.map((w) => ({ x: (w.x - cx) * s + Vw / 2, y: (w.y - cy) * s + Vh / 2 }));
              const Hin = solveHomography(unit, inner);
              const ex2 = BZ / SW;
              const ey2 = BZ / SH;
              const outer = [
                applyH(Hin, -ex2, -ey2),
                applyH(Hin, 1 + ex2, -ey2),
                applyH(Hin, 1 + ex2, 1 + ey2),
                applyH(Hin, -ex2, 1 + ey2),
              ];
              screen.style.transform = matrix3d(
                solveHomography(
                  [
                    { x: 0, y: 0 },
                    { x: SW + BZ * 2, y: 0 },
                    { x: SW + BZ * 2, y: SH + BZ * 2 },
                    { x: 0, y: SH + BZ * 2 },
                  ],
                  outer,
                ),
              );
              // The campaign card comes out of the TV: ONE layer, starting exactly on the card's place in the screen and
              // growing to the full-screen artwork (the print scene starts from the same rectangle). The screen keeps an
              // empty slot meanwhile, so there is never a second copy.
              const ls = smooth(seg(p, R.cardLift[0], R.cardLift[1]));
              drawScreen(clamp(seg(p, R.digital[0], R.digital[1])), ls > 0);
              vis(cardEl, ls > 0);
              if (ls > 0) {
                const ch = CARD.w / ART_ASPECT;
                const slot = [
                  applyH(Hin, CARD.x / SW, CARD.y / SH),
                  applyH(Hin, (CARD.x + CARD.w) / SW, CARD.y / SH),
                  applyH(Hin, (CARD.x + CARD.w) / SW, (CARD.y + ch) / SH),
                  applyH(Hin, CARD.x / SW, (CARD.y + ch) / SH),
                ];
                const pg = printGeom(0);
                const full: P2[] = [
                  { x: pg.cx0 * pg.cs + pg.tx, y: pg.cy0 * pg.cs + pg.ty },
                  { x: (pg.cx0 + pg.cardW) * pg.cs + pg.tx, y: pg.cy0 * pg.cs + pg.ty },
                  { x: (pg.cx0 + pg.cardW) * pg.cs + pg.tx, y: (pg.cy0 + pg.cardH) * pg.cs + pg.ty },
                  { x: pg.cx0 * pg.cs + pg.tx, y: (pg.cy0 + pg.cardH) * pg.cs + pg.ty },
                ];
                const tgt = slot.map((a, i) => ({ x: lerp(a.x, full[i].x, ls), y: lerp(a.y, full[i].y, ls) }));
                cardEl.style.transform = matrix3d(solveHomography(artRect, tgt));
              }
            }
          }
          if (inPrint) {
            const sIn = smooth(seg(p, R.reveal[0], R.reveal[1]));
            const sOut = 1 - smooth(seg(p, R.approach[0], R.approach[1]));
            const s = Math.min(sIn, sOut);
            // ONE camera drives both the photograph and the card: a uniform scale + translate (the photo is never stretched). The card
            // is fixed to the counter in IMAGE coordinates (same 16:10 artwork, nothing inside re-laid-out, never zoomed on its own):
            // its width equals the panel's width and its text block sits on the panel. At s = 0 the camera is close enough that the panel
            // fills the view's width; the camera then pulls back to the reading view (s = 1).
            // 
            const { cs, tx, ty, cx0, cy0, cardW, cardH } = printGeom(s);
            const photoT = `translate3d(${tx}px, ${ty}px, 0) scale(${cs})`;
            printPhoto.style.transform = photoT;
            printShade.style.transform = photoT;
            // The window starts as the whole card (so the first frame is identical to the Digital card) and closes to the panel's
            // box in the first third of the pull-back, eased, while the card itself stays fixed on the counter and the camera glides.
            const m = smooth(seg(s, 0, 0.35));
            const wx0 = lerp(cx0, Math.max(bookArt[0].x, bookArt[3].x), m);
            const wy0 = lerp(cy0, Math.max(bookArt[0].y, bookArt[1].y), m);
            const wx1 = lerp(cx0 + cardW, Math.min(bookArt[1].x, bookArt[2].x), m);
            const wy1 = lerp(cy0 + cardH, Math.min(bookArt[2].y, bookArt[3].y), m);
            const L = wx0 * cs + tx;
            const T = wy0 * cs + ty;
            // the window is an axis-aligned box on an UNtransformed wrapper, so the card canvas only ever changes its transform
            // (no clip-path repaint, no re-rasterising, nothing to shimmer)
            printClip.style.cssText = `position:absolute;overflow:hidden;left:${L}px;top:${T}px;width:${(wx1 - wx0) * cs}px;height:${(wy1 - wy0) * cs}px`;
            const k = (cardW * cs) / AW; // card canvas px -> screen px
            printArtA.style.transform = `translate3d(${cx0 * cs + tx - L}px, ${cy0 * cs + ty - T}px, 0) scale(${k})`;
            // the artwork is a printed panel on the bin: one opaque layer the whole time (no crossfade, no shade)
            printArtA.style.opacity = "1";
            printArtM.style.opacity = "0";
            printShade.style.opacity = "0";
          }
          if (inWall) {
            const s = smooth(seg(p, R.wall[0], R.wall[1]));
            // One camera (uniform scale + shift, the photograph is never stretched) carries the wall photo and the painted artwork,
            // which is fixed to the wall plane (four-corner mapping of the measured wall face). s = 0: the camera is so close that the
            // card at the artwork's left end fills the view (= the POP card's final frame); s = 1: the original reading framing.
            const W2 = IMG;
            const c1 = Math.max(Vw / W2.w, Vh / W2.h);
            const cardCx = wallCard.reduce((a2, b2) => a2 + b2.x, 0) / 4;
            // a narrow (portrait) view can only show a slice of the long wall: centre it on the campaign's lettering
            const acx0 = wallArt.reduce((a2, b2) => a2 + b2.x, 0) / 4;
            const acx = Vw < Vh ? cardCx : acx0;
            const tx1 = Math.min(0, Math.max(Vw - W2.w * c1, Vw / 2 - acx * c1));
            const ty1 = (Vh - W2.h * c1) / 2;
                        const cardCy = wallCard.reduce((a2, b2) => a2 + b2.y, 0) / 4;
            const cardImgW = (Math.hypot(wallCard[1].x - wallCard[0].x, wallCard[1].y - wallCard[0].y) + Math.hypot(wallCard[2].x - wallCard[3].x, wallCard[2].y - wallCard[3].y)) / 2;
            const f0 = fillRect();
            const c0 = Math.max(c1, (f0[1].x - f0[0].x) / cardImgW);
            const cs = Math.exp(lerp(Math.log(c0), Math.log(c1), s));
            const g = c0 === c1 ? 1 : (1 / cs - 1 / c0) / (1 / c1 - 1 / c0);
            const fx = lerp(cardCx, (Vw / 2 - tx1) / c1, g);
            const fy = lerp(cardCy, (Vh / 2 - ty1) / c1, g);
            const tx = Math.min(0, Math.max(Vw - W2.w * cs, Vw / 2 - fx * cs));
            const ty = Math.min(0, Math.max(Vh - W2.h * cs, Vh / 2 - fy * cs));
            const wallT = `translate3d(${tx}px, ${ty}px, 0) scale(${cs})`;
            wallPhoto.style.transform = wallT;
            wallShade.style.transform = wallT;
            const proj = (q2: P2[]) => q2.map((c2) => ({ x: c2.x * cs + tx, y: c2.y * cs + ty }));
            const rectOf = (w2: number, h2: number): P2[] => [
              { x: 0, y: 0 },
              { x: w2, y: 0 },
              { x: w2, y: h2 },
              { x: 0, y: h2 },
            ];
            // the card's paper stays on the wall plane and dissolves underneath the pieces
            const cardP = proj(wallCard);
            // (the wall is photographed at a slight angle: the card settles onto it in the first fifth)
            const ka = smooth(seg(s, 0, 0.2));
            const cardTgt = cardP.map((q2, i) => ({ x: lerp(f0[i].x, q2.x, ka), y: lerp(f0[i].y, q2.y, ka) }));
            const Hc = solveHomography(rectOf(AW, AH), cardTgt);
            wallArtA.style.transform = matrix3d(Hc);
            wallArtA.style.opacity = String(1 - smooth(seg(s, 0.25, 0.65)));
            // the campaign pieces split off the card and each glides to its place in the wide wall composition (on the wall plane,
            // through the same camera): start = where the piece sits on the card now, end = where it is painted on the wall
            const Hm = solveHomography(rectOf(WALL_CW, WALL_CH), proj(wallArt));
            const corners = (r: { x: number; y: number; w: number; h: number }) => [
              [r.x, r.y],
              [r.x + r.w, r.y],
              [r.x + r.w, r.y + r.h],
              [r.x, r.y + r.h],
            ];
            const delay = [0.1, 0.0, 0.12, 0.16, 0.05]; // "Be chosen." leads so it clears the end of "Be seen." as that line grows
            wallEls.forEach((el, i) => {
              const part = wallParts[i];
              if (!part) return;
              const d0 = delay[i] ?? 0.05;
              const e = smooth(seg(s, d0, d0 + 0.5));
              const c0s = corners(part.card).map(([x, y]) => applyH(Hc, x, y));
              const c1s = corners(part.wall).map(([x, y]) => applyH(Hm, x, y));
              const tg = c0s.map((q2, k) => ({ x: lerp(q2.x, c1s[k].x, e), y: lerp(q2.y, c1s[k].y, e) }));
              el.style.transform = matrix3d(solveHomography(rectOf(part.w, part.h), tg));
              el.style.opacity = "1";
            });
            wallShade.style.opacity = "0";
          }
          const copy = SHOP.copy;
          for (const el of copies) {
            const c = copy[el.dataset.copy as keyof typeof copy];
            show(el, Math.min(smooth(seg(p, c[0], c[1])), 1 - smooth(seg(p, c[2], c[3]))));
          }
        };

        const layout = () => {
          rootEl.style.setProperty("--vs-header", `${headerH()}px`);
          Vw = stage.clientWidth;
          Vh = stage.clientHeight;
          // sit over the last frame of the Outdoor pin so this stage takes over in place
          rootEl.style.position = "relative";
          rootEl.style.zIndex = "2";
          rootEl.style.marginTop = `${-Vh}px`;
          buildKeys();
          render();
        };

        layout();
        ScrollTrigger.addEventListener("refreshInit", layout);
        // One progress source: ScrollTrigger reports the (Lenis-smoothed) scroll, and the camera follows
        // it through a short critically-damped glide on GSAP's ticker, so every layer moves together.
        // (opacity, not visibility: child layers set their own visibility)
        const showStage = (on: boolean) => {
          stage.style.opacity = on ? "1" : "0";
          stage.style.pointerEvents = on ? "" : "none";
        };
        showStage(false);
        // show only once the layers are decoded and measured (a refresh mid-chapter must not flash an unplaced frame)
        // Visible whenever the chapter is active or already passed (progress > 0), once its layers are decoded. Never
        // compare scroll() to start: onEnter fires a few px early (anticipatePin) and a failed compare would leave the
        // stage hidden (white page) for the whole chapter. Re-evaluated on every update, so it can never stick hidden.
        let shown = false;
        const syncStage = (t: ScrollTrigger) => {
          const on = ready && (t.isActive || t.progress > 0);
          if (on === shown) return;
          shown = on;
          showStage(on);
        };
        let target = 0;
        let cur = 0;
        const glide = (_t: number, dt: number) => {
          const d = target - cur;
          if (Math.abs(d) < 0.00002) {
            if (cur !== target) {
              cur = target;
              state.p = cur;
              render();
            }
            return;
          }
          cur += d * (1 - Math.exp(-(dt / 1000) * 16));
          state.p = cur;
          render();
        };
        gsap.ticker.add(glide);
        const st = ScrollTrigger.create({
          trigger: stage,
          pin: true,
          anticipatePin: 1,
          start: () => `top ${headerH()}px`,
          end: () => `+=${Math.round(stage.clientHeight * SHOP.scrollVh)}`,
          invalidateOnRefresh: true,
          // The stage stays hidden until the Outdoor chapter's pin ends, then takes over the same
          // frame in place (its first frame is the Outdoor end frame), so there is no seam.
          onEnter: (self) => syncStage(self),
          onLeaveBack: () => {
            shown = false;
            showStage(false);
          },
          onRefresh: (self) => {
            target = cur = self.progress;
            state.p = cur;
            syncStage(self);
            render();
          },
          onUpdate: (self) => {
            syncStage(self);
            target = self.progress;
            // a programmatic jump (refresh restore, skip link) lands on the new frame instead of gliding through the chapters
            if (ready && Math.abs(self.progress - cur) > 0.12) {
              cur = target;
              state.p = cur;
              render();
            }
          },
        });

        // Images load shortly before the chapter (never at page load) and the story starts only
        // once the layers it needs are decoded.
        let cancelled = false;
        const start = async () => {
          font = getComputedStyle(rootEl).fontFamily;
          const imgs = Array.from(stage.querySelectorAll<HTMLImageElement>("img[data-sh]"));
          imgs.forEach((i) => (i.loading = "eager"));
          await Promise.all([
            document.fonts.ready,
            ...imgs.map((i) => i.decode().catch(() => undefined)),
            logoImg.decode().catch(() => undefined),
          ]);
          if (cancelled) return;
          paintArt();
          ready = true;
          layout();
          target = cur = st.progress;
          state.p = cur;
          render();
          syncStage(st);
        };
        const io = new IntersectionObserver(
          (entries) => {
            if (entries.some((e) => e.isIntersecting)) {
              io.disconnect();
              void start();
            }
          },
          { rootMargin: "0px 0px 350% 0px" },
        );
        io.observe(rootEl);

        return () => {
          cancelled = true;
          io.disconnect();
          ScrollTrigger.removeEventListener("refreshInit", layout);
          gsap.ticker.remove(glide);
          st.kill();
          rootEl.removeAttribute("data-live");
          rootEl.style.removeProperty("--vs-header");
          for (const prop of ["position", "z-index", "margin-top"]) rootEl.style.removeProperty(prop);
          for (const el of [world, doorL, doorR, sideL, sideR, front, tone, aperture, interior, screen, screenClip, cardEl, print, printPhoto, printArtA, printArtM, printShade, printShade, wall, wallPhoto, wallArtA, ...wallEls, wallShade, wallShade, ...copies])
            for (const prop of ["transform", "opacity", "visibility", "overflow", "filter"]) el.style.removeProperty(prop);
          screenClip.style.removeProperty("clip-path"); // set by render(); never strip `front`'s doorway cut-out (it comes from the markup)
          stage.style.removeProperty("opacity");
          stage.style.removeProperty("pointer-events");
          sign.style.removeProperty("transform");
          board.style.removeProperty("transform");
        };
      });
    },
    { scope: root },
  );

  const staticImgs = [FILES.storefront, FILES.interior, FILES.tvStill, FILES.printing, FILES.wall];

  return (
    <section ref={root} id="shop-story" aria-label="Signage, fixtures, digital, print and wall advertising" className="sh">
      <div className="sh-static">
        <h2 className="sh-static-h">From the shopfront to the street wall</h2>
        <p className="sh-static-note">
          Generated scenes that demonstrate our capabilities. They are not client campaign work.
        </p>
        {SHOP_COPY.map((c, i) => (
          <article key={c.id} className="sh-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={staticImgs[i]} alt="" width={staticImgs[i] === FILES.printing ? PRINT_IMG.w : IMG.w} height={staticImgs[i] === FILES.printing ? PRINT_IMG.h : IMG.h} loading="lazy" decoding="async" />
            <div>
              <p className="sh-kicker">{c.label}</p>
              <h3 className="sh-h">{c.heading}</h3>
              <p className="sh-sub">{c.body}</p>
              <Link href={enquiryHref(`service:${c.service}`)} className="btn btn-secondary mt-4">
                {c.cta}
                <span aria-hidden="true" className="btn-arrow">
                  →
                </span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
        <filter id="sh-paint" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" result="g" />
          <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 2.05" result="a" />
          <feComposite in="d" in2="a" operator="in" />
        </filter>
      </svg>
      <div className="sh-stage" data-stage="">
        {/* storefront world: one coordinate system (the 1672x941 photograph) */}
        <div className="sh-world" data-world="" aria-hidden="true" style={{ width: IMG.w, height: IMG.h }}>
          <StorefrontScene />
        </div>
        <div className="sh-screenclip" data-screenclip="" aria-hidden="true">
          <canvas className="sh-screen" data-screen="" aria-hidden="true" />
        </div>
        {/* the campaign card, lifted out of the TV (one layer; transform set in render) */}
        <canvas className="sh-art" data-card="" aria-hidden="true" style={{ visibility: "hidden" }} />

        {/* printing & POP plate */}
        <div className="sh-layer" data-print="" aria-hidden="true">
          <div className="sh-plate" data-print-photo="" style={{ width: PRINT_IMG.w, height: PRINT_IMG.h }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-sh="" className="sh-fill" src={FILES.printing} alt="" width={PRINT_IMG.w} height={PRINT_IMG.h} loading="lazy" />
          </div>
          <div data-print-clip="" style={{ position: "absolute", overflow: "hidden" }}>
            <canvas className="sh-art" data-print-a="" style={{ willChange: "transform" }} />
          </div>
          <canvas className="sh-art sh-art-m sh-art-n" data-print-m="" />
          <div className="sh-plate sh-shade" data-print-shade="" style={{ width: PRINT_IMG.w, height: PRINT_IMG.h }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sh-fill" src={FILES.printing} alt="" width={PRINT_IMG.w} height={PRINT_IMG.h} loading="lazy" />
          </div>
        </div>

        {/* wall advertising plate */}
        <div className="sh-layer" data-wall="" aria-hidden="true">
          <div className="sh-plate" data-wall-photo="" style={{ width: IMG.w, height: IMG.h }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-sh="" className="sh-fill" src={FILES.wall} alt="" width={IMG.w} height={IMG.h} loading="lazy" />
          </div>
          <canvas className="sh-art" data-wall-a="" />
          {[0, 1, 2, 3, 4].map((i) => (
            <canvas key={i} className="sh-art sh-art-m" data-wall-e={i} />
          ))}
          <div className="sh-plate sh-shade" data-wall-shade="" style={{ width: IMG.w, height: IMG.h }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sh-fill" src={FILES.wall} alt="" width={IMG.w} height={IMG.h} loading="lazy" />
          </div>
        </div>

        <a href="#after-story" className="sh-skip link">
          Skip visual story
        </a>
        <div className="sh-copies">
          {SHOP_COPY.map((c) => (
            <div key={c.id} className="sh-copy" data-copy={c.id}>
              {c.id === "wall" && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    zIndex: -1,
                    inset: "-3rem -5rem -2.5rem -5rem",
                    pointerEvents: "none",
                    background: "radial-gradient(closest-side at 40% 60%, rgba(0,0,0,0.45), rgba(0,0,0,0))",
                  }}
                />
              )}
              <h2 className="sh-h">{c.heading}</h2>
              <p className="sh-sub">{c.body}</p>
              <Link href={enquiryHref(`service:${c.service}`)} className="btn btn-inverse mt-4">
                {c.cta}
                <span aria-hidden="true" className="btn-arrow">
                  →
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div id="after-story" />
    </section>
  );
}
