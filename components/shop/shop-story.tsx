"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { enquiryHref } from "@/lib/navigation";
import { matrix3d, solveHomography, type P2 } from "../outdoor/geometry";
import { ART_ASPECT, canvasOf, drawArtwork, drawDigital } from "./shop-art";
import { StorefrontScene } from "./storefront-scene";
import {
  BOOK,
  FILES,
  FRONT,
  IMG,
  interiorPlace,
  LAPTOP_SCREEN,
  SHOP,
  SHOP_COPY,
  WALL,
} from "./shop-config";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const LIVE = "(prefers-reduced-motion: no-preference) and (min-height: 420px)";

const AW = 1600;
const AH = 1000;
const SW = 1536;
const SH = 960;
const BZ = 48; // laptop bezel (px of the plate canvas)
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
        const print = q("[data-print]");
        const printPhoto = q("[data-print-photo]");
        const printArtA = q<HTMLCanvasElement>("[data-print-a]");
        const printArtM = q<HTMLCanvasElement>("[data-print-m]");
        const printShade = q("[data-print-shade]");
        const wall = q("[data-wall]");
        const wallPhoto = q("[data-wall-photo]");
        const wallArtA = q<HTMLCanvasElement>("[data-wall-a]");
        const wallArtM = q<HTMLCanvasElement>("[data-wall-m]");
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

        // ---- laptop screen in storefront coordinates (the interior is placed there) ---------------
        // The fixtures interior is FIXED: one scale for the whole chapter, the smallest that still covers the
        // doorway (no gaps, nothing zooming or shaking on its own). Everything mapped onto it (the TV) uses it.
        const ik = interiorPlace.w / IMG.w;
        const apC = { x: FRONT.aperture.x + FRONT.aperture.w / 2, y: FRONT.aperture.y + FRONT.aperture.h / 2 };
        const interiorK = Math.max(FRONT.aperture.w / interiorPlace.w, FRONT.aperture.h / interiorPlace.h);
        const lapWorld: P2[] = LAPTOP_SCREEN.map(([x, y]) => {
          const wx = interiorPlace.x + x * ik;
          const wy = interiorPlace.y + y * ik;
          return { x: apC.x + (wx - apC.x) * interiorK, y: apC.y + (wy - apC.y) * interiorK };
        });
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
        const drawScreen = (u: number) => {
          if (Math.abs(u - lastU) < 0.002) return;
          lastU = u;
          drawDigital(uctx, SW, SH, u, font, art);
          sctx.clearRect(0, 0, screen.width, screen.height);
          sctx.fillStyle = "#101112";
          sctx.beginPath();
          sctx.roundRect(0, 0, screen.width, screen.height, 36);
          sctx.fill();
          sctx.drawImage(ui, BZ, BZ);
        };
        const paintArt = () => {
          drawArtwork(actx, AW, AH, font, logoImg);
          for (const c of [printArtA, printArtM, wallArtA, wallArtM]) {
            c.width = AW;
            c.height = AH;
            c.getContext("2d")!.drawImage(art, 0, 0);
          }
          lastU = -1;
          drawScreen(clamp(seg(state.p, R.digital[0], R.digital[1])));
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
        /**
         * Release a plate: s = 0 shows the artwork rectified to fill the view, s = 1 shows the whole
         * photograph (cover, centred on the artwork). Intermediate frames interpolate the four
         * corners, so straight edges stay straight and the same artwork stays attached to the plane.
         */
        const artRect: P2[] = [
          { x: 0, y: 0 },
          { x: AW, y: 0 },
          { x: AW, y: AH },
          { x: 0, y: AH },
        ];
        const plateTo = (photos: HTMLElement[], arts: HTMLElement[], quad: P2[], s: number) => {
          const t0 = fillRect();
          const c = Math.max(Vw / IMG.w, Vh / IMG.h);
          const acx = quad.reduce((a, b) => a + b.x, 0) / 4;
          const ox = Math.min(0, Math.max(Vw - IMG.w * c, Vw / 2 - acx * c));
          const oy = (Vh - IMG.h * c) / 2;
          const t1 = quad.map((p) => ({ x: p.x * c + ox, y: p.y * c + oy }));
          const tgt = t0.map((a, i) => ({ x: lerp(a.x, t1[i].x, s), y: lerp(a.y, t1[i].y, s) }));
          // photo and artwork get their own single transform (no nesting, so both stay sharp)
          const mp = matrix3d(solveHomography(quad, tgt));
          for (const el of photos) el.style.transform = mp;
          const ma = matrix3d(solveHomography(artRect, tgt));
          for (const el of arts) el.style.transform = ma;
        };
        const blend = (a: HTMLElement, m: HTMLElement, shade: HTMLElement, s: number, shadeMax = 0.85) => {
          const mm2 = smooth(seg(s, 0, 0.55));
          a.style.opacity = String(1 - mm2);
          m.style.opacity = String(0.96 * mm2);
          shade.style.opacity = String(shadeMax * mm2);
        };

        // ---- camera keys (storefront coordinates) ---------------------------------------------------
        const zero = (x: number) => x * 0;
        const fns = { cx: zero, cy: zero, ls: zero };
        const buildKeys = () => {
          const portrait = Vw < Vh;
          const fill = Math.max(Vw / ap.w, Vh / ap.h); // doorway covers the view
          const cx0 = fa.x + fa.w / 2;
          const cy0 = fa.y + fa.h / 2;
          // Opening frame: the Outdoor board's art fills the view exactly (so the zoom continues); never
          // smaller than the cover scale, so the photograph always fills the view (no exposed gaps).
          const cover = Math.max(Vw / IMG.w, Vh / IMG.h);
          const sFascia = Math.max(cover, portrait ? Math.min(Vw / (2000 * kArt), Vh / fa.h) : Math.max(Vw / (2000 * kArt), Vh / fa.h));
          const sWide = portrait ? Math.max(Vw / 760, (Vh / IMG.h) * 1.02) : Math.max(Vw / 1440, Math.max(Vw / IMG.w, Vh / IMG.h) * 1.02);
          const tvW = Math.hypot(lapWorld[1].x - lapWorld[0].x, lapWorld[1].y - lapWorld[0].y);
          // the whole interior photograph (as placed in the doorway) fits the view
          const sFull = Math.min(Vw / (interiorPlace.w * interiorK), Vh / (interiorPlace.h * interiorK));
          const sLap = Math.max(2.75 * fill, (0.5 * Vw) / tvW); // the small TV fills about half the view
          type K = [number, number, number, number]; // p, cx, cy, s
          // Evenly paced: each stretch changes the framing by a modest amount per scroll distance.
          const keys: K[] = [
            [0, cx0, cy0, sFascia],
            [0.15, cx0, cy0, sFascia], // hold on the zoomed-in board while the sign swap plays
            [0.23, cx0, 0, sWide], // then zoom out (cy 0 clamps to the top of the photograph: the whole fascia stays in view)
            [0.25, cx0, 0, sWide * 1.03],
            // Fixtures chapter: the camera settles on the WHOLE interior photograph (contained, never cropped) and holds.
            [0.4, apC.x, apC.y, sFull],
            [0.56, apC.x, apC.y, sFull],
            [0.62, (850 + lapCx) / 2, (580 + lapCy) / 2, 1.95 * fill],
            [0.67, 850 + (lapCx - 850) * 0.85, 580 + (lapCy - 580) * 0.85, Math.sqrt(1.95 * fill * sLap)],
            [0.72, lapCx, lapCy, sLap],
            [1, lapCx, lapCy, sLap],
          ];
          // never expose the photograph's edge: clamp every key's centre to the image
          for (const kk of keys) {
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
          vis(wall, inWall);

          if (inWorld) {
            const s = Math.exp(fns.ls(p));
            const cx = fns.cx(p);
            const cy = fns.cy(p);
            world.style.transform = `translate3d(${Vw / 2}px, ${Vh / 2}px, 0) scale(${s}) translate3d(${-cx}px, ${-cy}px, 0)`;
            // doors: both leaves, one progress, clipped inside the aperture
            const d = smooth(seg(p, R.door[0], R.door[1]));
            // The doors and the side glass slide fully out of the doorway (behind its frame), so the whole interior
            // photograph is unobstructed; nothing is left overlapping the picture.
            const sideW = (FRONT.aperture.w - FRONT.doorW * 2) / 2;
            const exit = FRONT.doorW + sideW + 14;
            doorL.style.transform = `translate3d(${-d * exit}px,0,0)`;
            doorR.style.transform = `translate3d(${d * exit}px,0,0)`;
            sideL.style.transform = `translate3d(${-d * (sideW + 14)}px,0,0)`;
            sideR.style.transform = `translate3d(${d * (sideW + 14)}px,0,0)`;
            // the banner's surface settles into the fascia as the view pulls back
            tone.style.opacity = String(1 - smooth(seg(p, R.plate[0], R.plate[1])));
            // the Adinn art leaves to the left and the Havells signboard enters from the right (one progress, both inside the fascia)
            const swOut = smooth(seg(p, R.swap[0], R.swap[1]));
            const swIn = smooth(seg(p, R.swap[1], R.swap[2]));
            sign.style.transform = `translateX(${(-swOut * (fa.w / 2 + kArt * 1000 + 24)).toFixed(2)}px)`;
            board.style.transform = `translateX(${((1 - swIn) * (fa.w + 24)).toFixed(2)}px)`;
            // once the frame has left the view, the doorway's interior simply continues (no swap)
            const open = p >= R.unclip;
            front.style.visibility = open ? "hidden" : "visible";
            aperture.style.overflow = "hidden"; // the interior now exactly fills the doorway; the frame clips what slides out

            // laptop screen: always mapped into the photographed corners; grows to full screen
            // The TV is already on: it is always there, and only the sliding door leaf covers it
            // (the clip follows the leaf's edge, so it is revealed exactly as the doors open).
            const on = true;
            vis(screen, on);
            const dOpen = smooth(seg(p, R.door[0], R.door[1]));
            const leafEdge = ap.x + (ap.w - FRONT.doorW * 2) / 2 + FRONT.doorW - dOpen * (FRONT.doorW - 4);
            screenClip.style.clipPath = dOpen >= 1 ? "none" : `inset(0 0 0 ${Math.max(0, (leafEdge - cx) * s + Vw / 2)}px)`;
            if (on) {
              const g = smooth(seg(p, R.grow[0], R.grow[1]));
              const cam = lapWorld.map((w) => ({ x: (w.x - cx) * s + Vw / 2, y: (w.y - cy) * s + Vh / 2 }));
              const full = fillRect();
              const inner = cam.map((c, i) => ({ x: lerp(c.x, full[i].x, g), y: lerp(c.y, full[i].y, g) }));
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
              drawScreen(clamp(seg(p, R.digital[0], R.digital[1])));
            }
          }
          if (inPrint) {
            const sIn = smooth(seg(p, R.reveal[0], R.reveal[1]));
            const sOut = 1 - smooth(seg(p, R.approach[0], R.approach[1]));
            const s = Math.min(sIn, sOut);
            plateTo([printPhoto, printShade], [printArtA, printArtM], bookArt, s);
            blend(printArtA, printArtM, printShade, s);
          }
          if (inWall) {
            const s = smooth(seg(p, R.wall[0], R.wall[1]));
            plateTo([wallPhoto, wallShade], [wallArtA, wallArtM], wallArt, s);
            blend(wallArtA, wallArtM, wallShade, s, 0);
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
          onEnter: () => {
            showStage(true);
          },
          onLeaveBack: () => {
            showStage(false);
          },
          onRefresh: (self) => {
            target = cur = self.progress;
            state.p = cur;
            showStage(self.scroll() >= self.start - 1);
            render();
          },
          onUpdate: (self) => {
            target = self.progress;
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
          for (const el of [world, doorL, doorR, sideL, sideR, front, tone, aperture, interior, screen, screenClip, print, printPhoto, printArtA, printArtM, printShade, printShade, wall, wallPhoto, wallArtA, wallArtM, wallShade, wallShade, ...copies])
            for (const prop of ["transform", "opacity", "visibility", "overflow"]) el.style.removeProperty(prop);
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
            <img src={staticImgs[i]} alt="" width={IMG.w} height={IMG.h} loading="lazy" decoding="async" />
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

        {/* printing & POP plate */}
        <div className="sh-layer" data-print="" aria-hidden="true">
          <div className="sh-plate" data-print-photo="" style={{ width: IMG.w, height: IMG.h }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-sh="" className="sh-fill" src={FILES.printing} alt="" width={IMG.w} height={IMG.h} loading="lazy" />
          </div>
          <canvas className="sh-art" data-print-a="" />
          <canvas className="sh-art sh-art-m" data-print-m="" />
          <div className="sh-plate sh-shade" data-print-shade="" style={{ width: IMG.w, height: IMG.h }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sh-fill" src={FILES.printing} alt="" width={IMG.w} height={IMG.h} loading="lazy" />
          </div>
        </div>

        {/* wall advertising plate */}
        <div className="sh-layer" data-wall="" aria-hidden="true">
          <div className="sh-plate" data-wall-photo="" style={{ width: IMG.w, height: IMG.h }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-sh="" className="sh-fill" src={FILES.wall} alt="" width={IMG.w} height={IMG.h} loading="lazy" />
          </div>
          <canvas className="sh-art" data-wall-a="" />
          <canvas className="sh-art sh-art-m sh-paint" data-wall-m="" />
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
