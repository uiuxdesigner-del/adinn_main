"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ExternalLink } from "@/components/ui";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ENQUIRY_HREF } from "@/lib/navigation";
import {
  closing,
  DEFAULT_FOCAL,
  journey,
  scenes as allScenes,
  type Cam,
  type Focal,
  type Pt,
  type Quad,
  type Rect,
} from "@/lib/story";
import { verticals } from "@/lib/verticals";

const LIVE_QUERY =
  "(min-width: 1024px) and (min-height: 520px) and (prefers-reduced-motion: no-preference)";

/** Scene units: each chapter is CH long; the story is one pinned stage. */
const CH = 1.15;
const PULL = 0.4; // pull-back after entering a chapter
const READ_IN = 0.44; // text appears once the view is established
const READ_OUT = 0.62; // and leaves before the next camera travel
const APPROACH = 0.7; // camera travel towards the next chapter starts here
const VH_PER_UNIT = 0.7;

const vertical = (id: string) => verticals.find((v) => v.id === id)!;
const src = (file: string, w: 1200 | 2800) => `/story/${file}-${w}.webp`;

function Card({ id }: { id: string }) {
  const v = vertical(id);
  return (
    <div className="vs-card" data-card="">
      <h2 className="text-h2">{v.name}</h2>
      <p className="mt-2 text-ash">{v.description}</p>
      {v.url && (
        <p className="mt-3">
          <ExternalLink href={v.url}>{v.action}</ExternalLink>
        </p>
      )}
    </div>
  );
}

// ---- projective maths ------------------------------------------------------
type P2 = { x: number; y: number };

/** 3x3 homography (h1..h8, h9 = 1) mapping four source points to four targets. */
function solveHomography(src4: P2[], dst4: P2[]): number[] {
  const A: number[][] = [];
  for (let k = 0; k < 4; k++) {
    const { x, y } = src4[k];
    const { x: X, y: Y } = dst4[k];
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y, X]);
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y, Y]);
  }
  for (let c = 0; c < 8; c++) {
    let piv = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    [A[c], A[piv]] = [A[piv], A[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k];
    }
  }
  return A.map((row, i) => row[8] / row[i]);
}
const matrix3d = (h: number[]) =>
  `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`;

const quadWidth = (q: P2[]) =>
  (Math.hypot(q[1].x - q[0].x, q[1].y - q[0].y) + Math.hypot(q[2].x - q[3].x, q[2].y - q[3].y)) / 2;
const centroid = (q: P2[]): P2 => ({
  x: (q[0].x + q[1].x + q[2].x + q[3].x) / 4,
  y: (q[0].y + q[1].y + q[2].y + q[3].y) / 4,
});
/**
 * Interpolates between two quads the way a camera does: size in log-space,
 * centre linearly, and the perspective shape (corner offsets relative to size)
 * linearly, so the surface squares up while it grows.
 */
function lerpQuad(a: P2[], b: P2[], t: number): P2[] {
  const wa = quadWidth(a);
  const wb = quadWidth(b);
  const ca = centroid(a);
  const cb = centroid(b);
  const w = Math.exp(Math.log(wa) + (Math.log(wb) - Math.log(wa)) * t);
  const c = { x: ca.x + (cb.x - ca.x) * t, y: ca.y + (cb.y - ca.y) * t };
  return a.map((p, k) => {
    const oa = { x: (p.x - ca.x) / wa, y: (p.y - ca.y) / wa };
    const ob = { x: (b[k].x - cb.x) / wb, y: (b[k].y - cb.y) / wb };
    return {
      x: c.x + w * (oa.x + (ob.x - oa.x) * t),
      y: c.y + w * (oa.y + (ob.y - oa.y) * t),
    };
  });
}

/**
 * Scroll-driven visual story.
 *
 * The server HTML is a plain, fully readable stack of scenes. After mount, on
 * wide screens without a reduced-motion preference, the section switches to a
 * pinned stage (data-live). One ScrollTrigger (driven by the existing Lenis
 * instance) scrubs a single number, u, and every frame is a pure function of u.
 *
 * Roadshow -> Outdoor: the LED surface on the vehicle shows the outdoor scene,
 * projected onto the screen's four corners. The camera (a projective transform
 * of the whole scene) squares up to the screen until it fills the viewport; the
 * outdoor scene then continues from exactly the same pixels and pulls back.
 * Outdoor -> Signage: the billboard face is squared up and enlarged, and its
 * artwork continues as the storefront sign. Later chapters still use a short
 * match dissolve between aligned regions: they have no spatial connection yet.
 */
/**
 * `start` skips the first chapters (the Roadshow and Outdoor chapters are told by
 * components/outdoor when ENABLE_OOH_STORY is on); the rest is unchanged.
 */
export function VisualStory({ start = 0 }: { start?: number }) {
  const scenes = allScenes.slice(start);
  const CLOSING_INDEX = scenes.length;
  const TOTAL = (scenes.length - 1) * CH + 1.75;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;
      const mm = gsap.matchMedia();

      mm.add(LIVE_QUERY, () => {
        const stage = rootEl.querySelector<HTMLElement>("[data-stage]")!;
        const sceneEls = Array.from(rootEl.querySelectorAll<HTMLElement>("[data-scene]"));
        const plateEls = sceneEls.map((s) => s.querySelector<HTMLElement>("[data-plate]"));
        const cardEls = sceneEls.map((s) => s.querySelector<HTMLElement>("[data-card]"));
        const ledEl = rootEl.querySelector<HTMLElement>("[data-led]");
        const closeItems = Array.from(rootEl.querySelectorAll<HTMLElement>("[data-close-item]"));
        const dots = Array.from(rootEl.querySelectorAll<HTMLElement>("[data-chapter-dot]"));
        const chapterName = rootEl.querySelector<HTMLElement>("[data-chapter-name]");

        rootEl.setAttribute("data-live", "");

        const headerH = () => document.querySelector("header")?.offsetHeight ?? 72;
        let Vw = 0;
        let Vh = 0;
        const T = (i: number) => i * CH;
        // Plates are laid out at the source resolution and scaled down by the camera,
        // so the browser rasterises them sharply when the camera moves in.
        const NATIVE_W = 2800;
        const native = (i: number) => ({ nw: NATIVE_W, nh: (NATIVE_W * scenes[i].ih) / scenes[i].iw });
        const LED_BOX = Math.round(journey.led.crop.w * NATIVE_W);

        /** Cover-fit size of a scene plate on the current stage. */
        const cover = (i: number) => {
          const sc = scenes[i];
          const ar = sc.iw / sc.ih;
          const cw = Math.max(Vw, Vh * ar);
          return { cw, ch: cw / ar };
        };

        // ---- camera poses -------------------------------------------------
        // A pose holds image point (cx, cy) at screen point (fx, fy) at scale s.
        type Pose = Cam & { fx: number; fy: number };
        const pose = (cam: Cam, f: Focal = DEFAULT_FOCAL): Pose => ({ ...cam, fx: f.x, fy: f.y });
        const regionPose = (i: number, r: Rect, f: Focal): Pose => ({
          s: Vw / (r.w * cover(i).cw),
          cx: r.cx,
          cy: r.cy,
          fx: f.x,
          fy: f.y,
        });
        const mix = (a: Pose, b: Pose, t: number): Pose => ({
          s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * t),
          cx: a.cx + (b.cx - a.cx) * t,
          cy: a.cy + (b.cy - a.cy) * t,
          fx: a.fx + (b.fx - a.fx) * t,
          fy: a.fy + (b.fy - a.fy) * t,
        });
        /** Screen position of an image-fraction point under a pose. */
        const toScreen = (i: number, p: Pose, q: Pt): P2 => {
          const { cw, ch } = cover(i);
          return {
            x: p.fx * Vw + p.s * (q[0] - p.cx) * cw,
            y: p.fy * Vh + p.s * (q[1] - p.cy) * ch,
          };
        };
        const setAffine = (i: number, p: Pose) => {
          const { cw, ch } = cover(i);
          const k = (p.s * cw) / native(i).nw;
          const tx = p.fx * Vw - p.s * p.cx * cw;
          const ty = p.fy * Vh - p.s * p.cy * ch;
          plateEls[i]!.style.transform = `matrix3d(${k},0,0,0,0,${k},0,0,0,0,1,0,${tx},${ty},0,1)`;
        };
        /** Projective camera: the plate is warped so quad Q lands on screen quad Tq. */
        const setProjective = (i: number, Q: Quad, Tq: P2[]) => {
          const { nw, nh } = native(i);
          const local = Q.map((q) => ({ x: q[0] * nw, y: q[1] * nh }));
          plateEls[i]!.style.transform = matrix3d(solveHomography(local, Tq));
        };

        // ---- connections between chapters ---------------------------------
        const crop = () => {
          const { x, y, w } = journey.led.crop;
          const o = allScenes[1];
          return { x, y, w, h: (w * o.iw) / o.ih };
        };
        /** Pose with which each chapter takes over from the previous one. */
        const entryPose = (i: number): Pose => {
          const prev = scenes[i - 1];
          if (prev.next === "led") {
            const c = crop();
            return {
              s: Vw / (c.w * cover(i).cw),
              cx: c.x + c.w / 2,
              cy: journey.led.handoffCy,
              fx: 0.5,
              fy: 0.5,
            };
          }
          if (prev.next === "face") {
            const f = journey.face;
            const logoPx = f.logoFrac * f.overscan * Vw;
            return {
              s: logoPx / (f.signLogo.w * cover(i).cw),
              cx: f.signLogo.cx,
              cy: f.signLogo.cy,
              fx: 0.5,
              fy: f.signFy,
            };
          }
          return regionPose(i, scenes[i].inRect, prev.focal ?? DEFAULT_FOCAL);
        };
        const exitPose = (i: number): Pose =>
          regionPose(i, scenes[i].outRect, scenes[i].focal ?? DEFAULT_FOCAL);

        /** Source quad and target quad (screen) at the end of a spatial approach. */
        const approachEnd = (i: number): { Q: Quad; T1: P2[] } | null => {
          const sc = scenes[i];
          if (sc.next === "led") {
            const c = crop();
            const ep = entryPose(i + 1);
            const sq: Quad = [
              [c.x, c.y],
              [c.x + c.w, c.y],
              [c.x + c.w, c.y + c.h],
              [c.x, c.y + c.h],
            ];
            return { Q: journey.led.quad, T1: sq.map((q) => toScreen(i + 1, ep, q)) };
          }
          if (sc.next === "face") {
            const f = journey.face;
            const w = f.overscan * Vw;
            const h = w / f.aspect;
            const cx = Vw / 2;
            const cy = Vh / 2;
            return {
              Q: f.quad,
              T1: [
                { x: cx - w / 2, y: cy - h / 2 },
                { x: cx + w / 2, y: cy - h / 2 },
                { x: cx + w / 2, y: cy + h / 2 },
                { x: cx - w / 2, y: cy + h / 2 },
              ],
            };
          }
          return null;
        };

        // ---- easing helpers -----------------------------------------------
        const clamp = (v: number) => Math.min(1, Math.max(0, v));
        const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
        const smooth = (t: number) => t * t * (3 - 2 * t);
        const inQuad = (t: number) => t * t;
        const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const inOutCubic = (t: number) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        // ---- one deterministic frame --------------------------------------
        // Everything on screen is a pure function of the scroll position u
        // (in scene units), so scrubbing, reversing and jumping cannot desync.
        const BRIDGE_LEAD = 0.05;
        const BRIDGE_TAIL = 0.02;
        let lastChapter = -1;
        const render = (u: number) => {
          scenes.forEach((sc, i) => {
            const el = sceneEls[i];
            const prevNext = i > 0 ? scenes[i - 1].next : null;
            const exactIn = prevNext === "led" || prevNext === "face";
            const t = u - T(i);

            // Visibility.
            let opacity = 1;
            let hidden = false;
            if (i > 0) {
              if (prevNext === "face") {
                // Same artwork on both sides: a very short blend hides the surface change.
                opacity = smooth(seg(u, T(i) - 0.04, T(i)));
                hidden = u < T(i) - 0.04;
              } else if (exactIn) hidden = u < T(i) - 0.0005;
              else {
                opacity = smooth(seg(u, T(i) - BRIDGE_LEAD, T(i) + BRIDGE_TAIL));
                hidden = u < T(i) - BRIDGE_LEAD;
              }
            }
            const exactOut = sc.next === "led" || sc.next === "face";
            const gone =
              sc.next === "dissolve"
                ? u >= T(i) + 1.1
                : exactOut
                  ? u >= T(i + 1)
                  : u >= T(i + 1) + BRIDGE_TAIL;
            if (gone) hidden = true;
            el.style.visibility = hidden ? "hidden" : "visible";
            el.style.opacity = String(opacity);
            if (hidden) return;

            // Camera.
            const est = pose(sc.est);
            const hold = pose(sc.hold);
            const end = approachEnd(i);
            if (t < PULL && i > 0) {
              setAffine(i, mix(entryPose(i), est, outCubic(clamp(t / PULL))));
            } else {
              const driftStart = i === 0 ? 0 : PULL;
              const drift = mix(est, hold, seg(t, driftStart, APPROACH));
              if (t < APPROACH || sc.next === "dissolve") setAffine(i, drift);
              else if (end) {
                const e = inOutCubic(seg(t, APPROACH, CH));
                const T0 = end.Q.map((q) => toScreen(i, hold, q));
                setProjective(i, end.Q, lerpQuad(T0, end.T1, e));
              } else {
                setAffine(i, mix(hold, exitPose(i), inQuad(seg(t, APPROACH, CH))));
              }
            }

            // LED surface on the vehicle: the outdoor scene appears on it while the text is read.
            if (i === 0 && ledEl) ledEl.style.opacity = String(smooth(seg(t, 0.5, 0.68)));

            // Text: after the view is established, out before the camera travels.
            const card = cardEls[i];
            if (card) {
              const show = i === 0 ? 1 : smooth(seg(t, READ_IN, READ_IN + 0.08));
              const outStart = sc.next === "dissolve" ? 0.66 : READ_OUT;
              const fade = 1 - smooth(seg(t, outStart, outStart + 0.07));
              const o = Math.min(show, fade);
              card.style.opacity = String(o);
              card.style.visibility = o < 0.01 ? "hidden" : "visible";
              card.style.transform = `translate3d(0, ${(1 - show) * 18 - (1 - fade) * 10}px, 0)`;
            }
          });

          // Closing scene.
          const closeEl = sceneEls[CLOSING_INDEX];
          const closeStart = T(scenes.length - 1) + 0.8;
          const co = smooth(seg(u, closeStart, closeStart + 0.3));
          closeEl.style.visibility = co > 0 ? "visible" : "hidden";
          closeEl.style.opacity = String(co);
          closeItems.forEach((item, k) => {
            const o = smooth(seg(u, closeStart + 0.32 + k * 0.05, closeStart + 0.6 + k * 0.05));
            item.style.opacity = String(o);
            item.style.transform = `translate3d(0, ${(1 - o) * 20}px, 0)`;
          });

          // Chapter indicator.
          const chapter = Math.min(scenes.length - 1, Math.max(0, Math.floor((u + 0.2) / CH)));
          if (chapter !== lastChapter) {
            lastChapter = chapter;
            dots.forEach((d, k) => d.toggleAttribute("data-active", k === chapter));
            if (chapterName) {
              chapterName.textContent = `${String(chapter + 1).padStart(2, "0")} ${vertical(scenes[chapter].id).name}`;
            }
          }
        };

        // ---- layout + scroll binding --------------------------------------
        const state = { u: 0 };
        const layout = () => {
          rootEl.style.setProperty("--vs-header", `${headerH()}px`);
          Vw = stage.clientWidth;
          Vh = stage.clientHeight;
          scenes.forEach((_, i) => {
            const { nw, nh } = native(i);
            const el = plateEls[i]!;
            el.style.width = `${nw}px`;
            el.style.height = `${nh}px`;
            el.style.left = "0px";
            el.style.top = "0px";
            el.style.transformOrigin = "0 0";
          });
          sceneEls.forEach((el, i) => {
            el.style.zIndex = String(i + 1);
          });
          // LED content: project the box (0,0)-(L,L) onto the screen corners (plate-local px).
          const { nw, nh } = native(0);
          const box: P2[] = [
            { x: 0, y: 0 },
            { x: LED_BOX, y: 0 },
            { x: LED_BOX, y: LED_BOX },
            { x: 0, y: LED_BOX },
          ];
          const local = journey.led.quad.map((q) => ({ x: q[0] * nw, y: q[1] * nh }));
          if (ledEl) {
            ledEl.style.width = `${LED_BOX}px`;
            ledEl.style.height = `${LED_BOX}px`;
            ledEl.style.transform = matrix3d(solveHomography(box, local));
          }
          render(state.u);
        };
        layout();
        ScrollTrigger.addEventListener("refreshInit", layout);

        gsap.to(state, {
          u: TOTAL,
          ease: "none",
          onUpdate: () => render(state.u),
          scrollTrigger: {
            trigger: stage,
            pin: true,
            anticipatePin: 1,
            start: () => `top ${headerH()}px`,
            end: () => `+=${Math.round(stage.clientHeight * VH_PER_UNIT * TOTAL)}`,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", layout);
          rootEl.removeAttribute("data-live");
          rootEl.style.removeProperty("--vs-header");
          [...sceneEls, ...plateEls, ...cardEls, ledEl, ...closeItems].forEach((el) =>
            el?.removeAttribute("style"),
          );
        };
      });
    },
    { scope: root },
  );

  const crop = (() => {
    const { x, y, w } = journey.led.crop;
    return { x, y, w, h: (w * allScenes[1].iw) / allScenes[1].ih };
  })();

  return (
    <>
      <section
        ref={root}
        id="visual-story"
        aria-label="How Adinn connects brands with people"
        className="vs"
      >
        <div className="vs-stage" data-stage="">
          <a href="#after-story" className="vs-skip link">
            Skip visual story
          </a>

          {scenes.map((sc, i) => (
            <div key={sc.id} className="vs-scene" data-scene="">
              <div className="vs-plate" data-plate="">
                {/* Pre-sized WebP variants; a plain img keeps both widths under our control. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src(sc.file, 1200)}
                  srcSet={`${src(sc.file, 1200)} 1200w, ${src(sc.file, 2800)} 2800w`}
                  sizes="(min-width: 1024px) 220vw, 92vw"
                  alt={sc.alt}
                  width={2800}
                  height={2333}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  style={{ objectPosition: `${sc.est.cx * 100}% ${sc.est.cy * 100}%` }}
                />
                {sc.id === "roadshows" && (
                  <div className="vs-led" data-led="" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src(allScenes[1].file, 2800)}
                      alt=""
                      width={2800}
                      height={2333}
                      loading="lazy"
                      decoding="async"
                      style={{
                        position: "absolute",
                        maxWidth: "none",
                        width: `${100 / crop.w}%`,
                        height: `${100 / crop.h}%`,
                        left: `${(-crop.x / crop.w) * 100}%`,
                        top: `${(-crop.y / crop.h) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>
              <Card id={sc.id} />
            </div>
          ))}

          <div className="vs-scene vs-scene-close" data-scene="">
            <div className="vs-close">
              <div className="vs-logo" data-close-item="">
                <Image src="/Adinn.png" alt="ADINN" width={516} height={201} sizes="160px" />
              </div>
              <h2 className="text-h1 mt-6" data-close-item="">
                {closing.title}
              </h2>
              <p className="mt-3 max-w-xl text-line" data-close-item="">
                {closing.text}
              </p>
              <ul className="vs-tiles" data-close-item="">
                {scenes.map((sc) => (
                  <li key={sc.id}>
                    <span className="vs-tile">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src(sc.file, 1200)}
                        alt=""
                        width={1200}
                        height={1000}
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className="vs-tile-name">{vertical(sc.id).name}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8" data-close-item="">
                <Link href={ENQUIRY_HREF} className="btn btn-inverse">
                  Discuss Your Requirement
                  <span aria-hidden="true" className="btn-arrow">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="vs-chapters" aria-hidden="true">
            <span className="vs-chapter-name" data-chapter-name="" />
            <span className="vs-chapter-dots">
              {scenes.map((sc) => (
                <span key={sc.id} className="vs-chapter-dot" data-chapter-dot="" />
              ))}
            </span>
          </div>
        </div>
      </section>
      <div id="after-story" />
    </>
  );
}
