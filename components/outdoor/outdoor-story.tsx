"use client";

import { audienceRestCrowdSrc, audienceWalkersActive, createAudienceArrival } from "./audience-arrival";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ENQUIRY_HREF } from "@/lib/navigation";
import { verticals } from "@/lib/verticals";
import { matrix3d, solveHomography, type P2 } from "./geometry";
import { StorefrontScene } from "../shop/storefront-scene";
import { OOH, OOH_COPY } from "./outdoor-config";

const LIVE_QUERY =
  "(min-width: 1024px) and (min-height: 520px) and (prefers-reduced-motion: no-preference)";

const { w: CW, h: CH } = OOH.canvas;
const CLOUDS = ["mist", "lower", "left", "right"] as const;
type CloudName = (typeof CLOUDS)[number];
const originPct = `${(OOH.opening[0] / CW) * 100}% ${(OOH.opening[1] / CH) * 100}%`;
const roadshow = verticals.find((v) => v.id === "roadshows")!;

/** The aerial scene layers on the shared canvas. Rendered for the stage and, again, inside the LED screen. */
function Layers() {
  const a = OOH.artwork;
  const H = solveHomography(
    [
      { x: 0, y: 0 },
      { x: a.w, y: 0 },
      { x: a.w, y: a.h },
      { x: 0, y: a.h },
    ],
    OOH.faceQuad.map(([x, y]) => ({ x, y })),
  );
  return (
    <>
      <div className="oo-layer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-ooh="" src={OOH.layers.background} alt="" width={CW} height={CH} decoding="async" />
      </div>
      <div className="oo-layer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-ooh="" src={OOH.layers.structure} alt="" width={CW} height={CH} decoding="async" />
        <div className="oo-art-holder" style={{ width: CW, height: CH }}>
          {/* The whole shop sits inside the board, zoomed in on its sign and masked by the board face;
              the next chapter pulls out of exactly this view. */}
          <div className="oo-art oo-art-shop" style={{ width: a.w, height: a.h, transform: matrix3d(H) }}>
            <div className="sh-embed" style={{ width: 1672, height: 941, transform: `translate(${a.w / 2}px, ${a.h / 2}px) scale(${a.h / 213}) translate(-868.5px, -153.5px)` }}>
              <StorefrontScene light />
            </div>
          </div>
        </div>
      </div>
      {CLOUDS.map((c) => (
        <div key={c} className="oo-layer oo-cloud" data-cloud={c} style={{ transformOrigin: originPct }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-ooh="" src={OOH.layers.clouds[c]} alt="" width={CW} height={CH} decoding="async" />
        </div>
      ))}
    </>
  );
}

/**
 * Roadshow -> Outdoor / OOH chapters (aerial, layered).
 *
 * Roadshow: the vehicle's LED screen shows the opening Outdoor frame (aerial scene with
 * all four cloud groups) projected onto the panel corners. One projective transform of
 * the whole truck world (vehicle + LED content) carries the screen up until it fills the
 * viewport; the aerial world then continues from the identical pixels. This is a
 * screen-to-environment match, not a physical flight.
 *
 * Outdoor: one aerial camera (translate + scale only, no tilt) over background, hoarding
 * and artwork, which share one transform so the pole stays planted. Four cloud groups sit
 * above, scaled about the opening and cleared in staggered, overlapping windows. Every
 * frame is a pure function of one scrubbed progress value, so stopping settles the scene
 * and reverse scrolling restores the same positions.
 *
 * Static layout (no JS, mobile, reduced motion): the chapters stack, clouds removed.
 */
export function OutdoorStory() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const rootEl = root.current;
      if (!rootEl) return;
      const mm = gsap.matchMedia();

      mm.add(LIVE_QUERY, () => {
        const stage = rootEl.querySelector<HTMLElement>("[data-stage]")!;
        const q = (s: string) => rootEl.querySelector<HTMLElement>(s)!;
        const truckWorld = q("[data-truck]");
        const led = q("[data-led]");
        const crowds = { left: q("[data-crowd=left]"), right: q("[data-crowd=right]") };
        // audience arrival feature (see audience-arrival.ts): walkers share the right crowd's transform
        const walkerHost = audienceWalkersActive ? rootEl.querySelector<HTMLElement>("[data-walkers]") : null;
        const arrival = walkerHost ? createAudienceArrival(walkerHost) : null;
        let arrivalLatch = 0;
        const plaza = q("[data-plaza]");
        const tg = q("[data-tg]");
        const frame = q("[data-main]");
        const world = q("[data-main] .oo-canvas");
        const clouds = Object.fromEntries(
          CLOUDS.map((c) => [c, world.querySelector<HTMLElement>(`[data-cloud="${c}"]`)!]),
        ) as Record<CloudName, HTMLElement>;
        const tRoad = q("[data-road]");
        const tIntro = q("[data-intro]");
        const tApproach = q("[data-approach]");
        const tClosing = q("[data-closing]");
        const hint = q("[data-hint]");
        const label = q("[data-label]");

        rootEl.setAttribute("data-live", "");
        const headerH = () => document.querySelector("header")?.offsetHeight ?? 72;
        let Vw = 0;
        let Vh = 0;
        const M = OOH.motion;
        const T = M.t;
        const { truck } = OOH;
        const ledW = truck.led[1][0] - truck.led[0][0];

        const clamp = (v: number) => Math.min(1, Math.max(0, v));
        const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
        const smooth = (t: number) => t * t * (3 - 2 * t);
        const outQuad = (t: number) => 1 - (1 - t) * (1 - t);
        const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
        const show = (el: HTMLElement, o: number, dy = 14) => {
          el.style.opacity = String(o);
          el.style.visibility = o < 0.01 ? "hidden" : "visible";
          el.style.transform = `translate3d(0, ${(1 - o) * dy}px, 0)`;
        };

        // ---- roadshow scene (one coordinate system; depth groups) --------------
        const SC = OOH.scene;
        const ts = SC.truck.scale;
        // Truck group: truck-image px -> scene px (LED centre on the viewing axis, wheels on groundY).
        const ledCxSrc = (truck.led[0][0] + truck.led[1][0]) / 2;
        const tTy = SC.truck.groundY - OOH.tyres.y * ts; // tyre-contact line, not the image bottom
        // Arrival path: it rolls in along the road lane and drifts gently to the parking spot over the
        // whole drive; size changes only slightly (no zoom-from-small). Wheels turn with the distance.
        const AR = OOH.arrival;
        const pathAt = (d: number) => {
          const k = smooth(d);
          const gy = AR.laneY + (SC.truck.groundY - AR.laneY) * k;
          const sc = ts * (AR.startScale + (1 - AR.startScale) * k);
          return { x: SC.truck.ledCx + (1 - d) * M.driveIn, gy, sc };
        };
        // wheel turn (radians) = distance rolled in truck px / wheel radius, integrated along the path
        const ROLL_N = 160;
        const roll: number[] = [0];
        for (let i = 1; i <= ROLL_N; i++) {
          const a = pathAt((i - 1) / ROLL_N);
          const b = pathAt(i / ROLL_N);
          const mid = pathAt((i - 0.5) / ROLL_N);
          roll.push(roll[i - 1] + (a.x - b.x) / mid.sc);
        }
        const rollAt = (d: number) => {
          const f = Math.min(ROLL_N, Math.max(0, d * ROLL_N));
          const i = Math.min(ROLL_N - 1, Math.floor(f));
          return roll[i] + (roll[i + 1] - roll[i]) * (f - i);
        };
        const wheelEls = {
          front: q("[data-wheel=front]"),
          rear: q("[data-wheel=rear]"),
        };
        const ledWorld = () => ({
          cx: SC.truck.ledCx,
          cy: tTy + ((truck.led[0][1] + truck.led[2][1]) / 2) * ts,
          w: ledW * ts,
        });
        /** Final LED rectangle: 2:1, covers the viewport. */
        const ledEnd = () => {
          const W = Math.max(2 * Vh, Vw);
          return { x: (Vw - W) / 2, y: (Vh - W / 2) / 2, w: W };
        };

        // ---- aerial camera ----------------------------------------------------
        type Pose = { s: number; cx: number; cy: number; fx: number; fy: number };
        const handoff = (): Pose => {
          const r = OOH.ledRegion;
          return { s: ledEnd().w / r.w, cx: r.x + r.w / 2, cy: r.y + r.h / 2, fx: 0.5, fy: 0.5 };
        };
        const mix = (a: Pose, b: Pose, t: number): Pose => ({
          s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * t),
          cx: a.cx + (b.cx - a.cx) * t,
          cy: a.cy + (b.cy - a.cy) * t,
          fx: a.fx + (b.fx - a.fx) * t,
          fy: a.fy + (b.fy - a.fy) * t,
        });
        const setWorld = (p: Pose) => {
          const tx = p.fx * Vw - p.s * p.cx;
          const ty = p.fy * Vh - p.s * p.cy;
          world.style.transform = `matrix3d(${p.s},0,0,0,0,${p.s},0,0,0,0,1,0,${tx},${ty},0,1)`;
        };

        // Approach: after the existing timeline, the camera closes on the advertising face until the
        // artwork fills the viewport (rectified, so it matches the flat shopfront fascia that follows).
        const FILL = 0.2;
        const fq = OOH.faceQuad;
        const fcx = (fq[0][0] + fq[1][0] + fq[2][0] + fq[3][0]) / 4;
        const fcy = (fq[0][1] + fq[1][1] + fq[2][1] + fq[3][1]) / 4;
        const fqW = (fq[1][0] - fq[0][0] + (fq[2][0] - fq[3][0])) / 2;
        const fqH = (fq[3][1] - fq[0][1] + (fq[2][1] - fq[1][1])) / 2;
        const rectQ: P2[] = [
          { x: fcx - fqW / 2, y: fcy - fqH / 2 },
          { x: fcx + fqW / 2, y: fcy - fqH / 2 },
          { x: fcx + fqW / 2, y: fcy + fqH / 2 },
          { x: fcx - fqW / 2, y: fcy + fqH / 2 },
        ];
        const artEl = q("[data-main] .oo-art");
        const artBox: P2[] = [
          { x: 0, y: 0 },
          { x: OOH.artwork.w, y: 0 },
          { x: OOH.artwork.w, y: OOH.artwork.h },
          { x: 0, y: OOH.artwork.h },
        ];
        const faceP: P2[] = fq.map(([x, y]) => ({ x, y }));
        const baseArt = matrix3d(solveHomography(artBox, faceP));
        const setArt = (w: number) =>
          (artEl.style.transform = matrix3d(
            solveHomography(
              artBox,
              faceP.map((a, i) => ({ x: a.x + (rectQ[i].x - a.x) * w, y: a.y + (rectQ[i].y - a.y) * w })),
            ),
          ));
        const state = { p: 0 };
        const render = () => {
          // Intro (empty road -> truck drives in -> audience gathers) occupies the first IE of
          // the scroll; everything after is the existing timeline, re-based to p = 0..1.
          const IE = M.introEnd;
          const qq = state.p;
          const pr = Math.min(1, qq / (1 - FILL));
          const aprch = seg(qq, 1 - FILL, 1);
          const p = seg(pr, IE, 1);
          // The truck brakes smoothly into its spot (ease-out), then the audience settles in.
          // slow roll in, slow roll out (sine in-out), spread over most of the intro scroll
          const drive = 0.5 - 0.5 * Math.cos(Math.PI * seg(pr, 0.01, IE * 0.8));
          // Arrival walk: deterministic in scroll progress, and latched so scrolling back holds the settled
          // audience (people never walk backwards); it resets only once the opening is out of view.
          // The audience arrives only AFTER the vehicle is parked (drive ends at pr = IE * 0.8). `aud` is a pure
          // function of scroll progress, so on reverse scroll or refresh it can never be ahead of the vehicle: the
          // audience leaves first, then the vehicle drives out.
          const parkedAt = IE * 0.8;
          const aud = smooth(seg(pr, parkedAt, IE - 0.005));
          if (pr < parkedAt) arrivalLatch = 0;
          arrivalLatch = Math.max(arrivalLatch, seg(pr, parkedAt, IE - 0.01));
          arrival?.update(arrivalLatch);
          const inTruck = p < T.approachEnd;
          truckWorld.style.visibility = inTruck ? "visible" : "hidden";
          frame.style.visibility = inTruck ? "hidden" : "visible";

          // 1. Roadshow: a forward dolly. One camera zoom; each depth group follows it with
          //    its own strength (near audience grows and moves outward faster).
          if (inTruck) {
            // Dolly: starts from rest, leaves with speed so the Outdoor scene carries the motion on.
            const t1 = seg(p, T.truckHold, T.approachEnd);
            const e = t1 * t1 * (2.6 - 1.6 * t1);
            const ePan = 1 - (1 - e) * (1 - e); // screen centres before the zoom lands
            const s0 = Vw / OOH.canvas.w;
            const lw = ledWorld();
            const s1 = ledEnd().w / lw.w;
            const S = Math.exp(Math.log(s0) + (Math.log(s1) - Math.log(s0)) * e);
            const cx = SC.startCx + (lw.cx - SC.startCx) * ePan;
            const cy = SC.startCy + (lw.cy - SC.startCy) * ePan;
            const place = (el: HTMLElement, m: number, inner = "") => {
              const Sg = s0 * Math.pow(S / s0, m);
              el.style.transform = `translate(${Vw / 2}px, ${Vh / 2}px) scale(${Sg}) translate(${-cx}px, ${-cy}px)${inner}`;
            };
            place(plaza, SC.depth.plaza);
            const tp = pathAt(drive);
            place(
              tg,
              SC.depth.truck,
              ` translate(${tp.x - ledCxSrc * tp.sc}px, ${tp.gy - OOH.tyres.y * tp.sc}px) scale(${tp.sc})`,
            );
            const turn = rollAt(drive);
            for (const k of ["front", "rear"] as const) {
              // driving left: the near side of each wheel turns counter-clockwise
              wheelEls[k].style.transform = `rotate(${(-turn / (OOH.wheels[k].d / 2)) * (180 / Math.PI)}deg)`;
            }
            const cw = OOH.crowds;
            const cin = (dx: number, dy: number, sc: number) =>
              ` translate(${dx}px, ${dy}px) translate(${cw.ax}px, ${cw.ay}px) scale(${sc}) translate(${-cw.ax}px, ${-cw.ay}px)`;
            // the crowds gather in from outside (M.gatherIn) as the audience arrives, hidden until the vehicle is parked
            const gather = M.gatherIn * (1 - aud);
            place(crowds.left, SC.depth.crowd, cin(cw.left.dx - gather, cw.left.dy, cw.left.scale));
            place(crowds.right, SC.depth.crowd, cin(cw.right.dx + gather, cw.right.dy, cw.right.scale));
            for (const el of [crowds.left, crowds.right]) {
              el.style.opacity = String(aud);
              // "inherit", never "visible": once the roadshow scene ends its parent is hidden and an explicit "visible" would keep
              // the audience standing in front of the billboard during the aerial zoom
              el.style.visibility = aud < 0.01 ? "hidden" : "inherit";
            }
            if (walkerHost) place(walkerHost, SC.depth.crowd, cin(cw.right.dx, cw.right.dy, cw.right.scale));
          }

          // 2. Aerial camera: handoff -> gentle enter -> focus on the hoarding.
          const hand = handoff();
          const f = OOH.camera.focus;
          const enter: Pose = { ...hand, s: hand.s * OOH.camera.enterZoom };
          const focus: Pose = { s: hand.s * f.zoom, cx: f.cx, cy: f.cy, fx: f.fx, fy: f.fy };
          const cam0 = mix(
            mix(hand, enter, outQuad(seg(p, T.approachEnd, T.enterEnd))),
            focus,
            inOut(seg(p, T.focusStart, T.focusEnd)),
          );
          const fillPose: Pose = { s: Math.max(Vh / fqH, Vw / fqW), cx: fcx, cy: fcy, fx: 0.5, fy: 0.5 };
          const cam = aprch > 0 ? mix(cam0, fillPose, inOut(aprch)) : cam0;
          if (!inTruck) setWorld(cam);
          setArt(smooth(seg(aprch, 0.3, 0.85)));

          // 3. Clouds: staggered, overlapping; nearer groups travel and grow faster.
          CLOUDS.forEach((c) => {
            const [a, b] = M.cloudWindow[c];
            const k = inOut(seg(p, a, b));
            const sc = 1 + (M.cloudScale[c] - 1) * smooth(seg(p, T.approachEnd, b));
            const tx = c === "left" || c === "right" ? M.cloudTravel[c] * CW * k : 0;
            const ty = c === "lower" || c === "mist" ? M.cloudTravel[c] * CH * k : 0;
            const el = clouds[c];
            el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${sc})`;
            el.style.opacity = c === "mist" ? String(1 - smooth(seg(p, a + 0.04, b))) : "1";
            el.style.visibility = k >= 1 ? "hidden" : "inherit";
          });

          // 4. Copy: ink on the bright cloud layer; each message leaves before the next move.
          show(tRoad, Math.min(smooth(seg(pr, IE * 0.5, IE * 0.8)), 1 - smooth(seg(p, 0.07, 0.14))));
          show(tIntro, Math.min(smooth(seg(p, 0.38, 0.46)), 1 - smooth(seg(p, 0.6, 0.67))));
          show(tApproach, Math.min(smooth(seg(p, 0.7, 0.77)), 1 - smooth(seg(p, 0.82, 0.88))));
          show(tClosing, Math.min(smooth(seg(p, 0.92, 0.98)), 1 - smooth(seg(aprch, 0, 0.3))));
          hint.style.opacity = String(1 - smooth(seg(pr, 0.01, 0.05)));
          const chapter = p < T.approachEnd ? "01 Roadshows" : "02 Outdoor / OOH";
          if (label.textContent !== chapter) label.textContent = chapter;
        };

        const layout = () => {
          rootEl.style.setProperty("--vs-header", `${headerH()}px`);
          Vw = stage.clientWidth;
          Vh = stage.clientHeight;
          // LED content: the aerial region projected onto the panel corners (truck px).
          const r = OOH.ledRegion;
          const box: P2[] = [
            { x: 0, y: 0 },
            { x: r.w, y: 0 },
            { x: r.w, y: r.h },
            { x: 0, y: r.h },
          ];
          led.style.width = `${r.w}px`;
          led.style.height = `${r.h}px`;
          led.style.transform = matrix3d(
            solveHomography(box, truck.led.map(([x, y]) => ({ x, y }))),
          );
          render();
        };
        layout();
        ScrollTrigger.addEventListener("refreshInit", layout);

        gsap.to(state, {
          p: 1,
          ease: "none",
          onUpdate: render,
          scrollTrigger: {
            trigger: stage,
            pin: true,
            anticipatePin: 1,
            start: () => `top ${headerH()}px`,
            end: () => `+=${Math.round((stage.clientHeight * M.scrollVh) / (1 - FILL))}`,
            scrub: M.scrub,
            invalidateOnRefresh: true,
            // Refresh / restore: put the animation at the trigger's real progress at once (the scrub tween only
            // follows scroll CHANGES, so a page that already sits mid-story would otherwise render the opening).
            onRefresh: (self) => {
              self.animation?.progress(self.progress);
            },
          },
        });

        const imgs = Array.from(rootEl.querySelectorAll<HTMLImageElement>("img[data-ooh]"));
        const refresh = () => ScrollTrigger.refresh();
        imgs.forEach((i) => {
          if (!i.complete) i.addEventListener("load", refresh, { once: true });
        });

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", layout);
          imgs.forEach((i) => i.removeEventListener("load", refresh));
          rootEl.removeAttribute("data-live");
          rootEl.style.removeProperty("--vs-header");
          artEl.style.transform = baseArt;
          arrival?.dispose();
          walkerHost?.removeAttribute("style");
          [truckWorld, led, plaza, tg, crowds.left, crowds.right, frame, world, ...Object.values(clouds), tRoad, tIntro, tApproach, tClosing, hint].forEach(
            (el) => el.removeAttribute("style"),
          );
          wheelEls.front.style.removeProperty("transform");
          wheelEls.rear.style.removeProperty("transform");
          label.textContent = "";
        };
      });
    },
    { scope: root },
  );

  // Static layout: scale the aerial canvas to its frame (the artwork's scale needs measuring).
  useEffect(() => {
    const host = root.current;
    const el = host?.querySelector<HTMLElement>("[data-main] .oo-canvas");
    if (!host || !el) return;
    const set = () => el.style.setProperty("--k", String(el.clientWidth / CW));
    set();
    host.setAttribute("data-art", "");
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => {
      ro.disconnect();
      host.removeAttribute("data-art");
    };
  }, []);

  const focus = {
    "--fx": OOH.desktopFocus[0] / CW,
    "--fy": OOH.desktopFocus[1] / CH,
    "--mfx": OOH.mobileFocus[0] / CW,
    "--mfy": OOH.mobileFocus[1] / CH,
  } as React.CSSProperties;

  return (
    <section
      ref={root}
      id="outdoor-story"
      aria-label="Roadshow and outdoor advertising"
      className="oo"
      style={focus}
    >
      <div className="oo-stage" data-stage="">
        <a href="#after-story" className="oo-skip link">
          Skip visual story
        </a>

        <div className="oo-chapter oo-chapter-road">
          <div className="oo-truckworld" data-truck="">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              data-plaza=""
              data-ooh=""
              className="oo-plaza"
              src={OOH.scene.plaza.src}
              alt=""
              width={OOH.scene.plaza.w}
              height={OOH.scene.plaza.h}
              decoding="async"
              style={{ left: OOH.scene.plaza.x, top: OOH.scene.plaza.y }}
            />
            <div className="oo-tg" data-tg="">
              {/* Tight contact shading directly under each tyre (the truck image is untouched). */}
              {(["front", "rear"] as const).map((t) => (
                <span
                  key={t}
                  className="oo-contact"
                  style={{
                    left: OOH.tyres[t].cx - OOH.tyres[t].w / 2,
                    top: OOH.tyres.y - 9,
                    width: OOH.tyres[t].w,
                  }}
                />
              ))}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-ooh=""
                className="oo-truck-img"
                src={OOH.truck.src}
                alt={OOH_COPY.roadshowAlt}
                width={OOH.truck.w}
                height={OOH.truck.h}
                decoding="async"
              />
              {(["front", "rear"] as const).map((k) => {
                const w = OOH.wheels[k];
                const size = w.d / w.fill; // the disc fills ~91% of its image
                return (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={k}
                    data-wheel={k}
                    data-ooh=""
                    className="oo-wheel"
                    src={w.src}
                    alt=""
                    width={size}
                    height={size}
                    decoding="async"
                    style={{ left: w.cx - size / 2, top: OOH.tyres.y - w.d / 2 - size / 2, width: size, height: size }}
                  />
                );
              })}
              <div className="oo-led" data-led="" aria-hidden="true">
                <div
                  className="oo-canvas oo-canvas-led"
                  style={{ ["--k" as string]: 1, left: -OOH.ledRegion.x, top: -OOH.ledRegion.y }}
                >
                  <Layers />
                </div>
              </div>
            </div>
            {(["left", "right"] as const).map((side) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={side}
                data-crowd={side}
                data-ooh=""
                className="oo-crowd"
                src={side === "right" && audienceWalkersActive ? audienceRestCrowdSrc : OOH.crowds[side].src}
                alt=""
                width={OOH.truck.w}
                height={OOH.truck.h}
                decoding="async"
              />
            ))}
            {/* audience arrival feature: layers are added by createAudienceArrival; shares the crowd's transform */}
            {audienceWalkersActive && <div className="oo-crowd" data-walkers="" aria-hidden="true" />}
          </div>
          <div className="oo-text" data-road="">
            <h2 className="oo-h">{roadshow.name}</h2>
            <p className="oo-sub">{roadshow.description}</p>
          </div>
        </div>

        <div className="oo-chapter oo-chapter-outdoor">
          <div className="oo-frame" data-main="" role="img" aria-label={OOH_COPY.outdoorAlt}>
            <div className="oo-canvas">
              <Layers />
            </div>
          </div>
          <div className="oo-copy">
            <div className="oo-intro" data-intro="">
              <h2 className="oo-h">{OOH_COPY.heading}</h2>
              <p className="oo-sub">{OOH_COPY.support}</p>
            </div>
            <p className="oo-approach" data-approach="">
              {OOH_COPY.approach}
            </p>
            <div className="oo-closing" data-closing="">
              <h2 className="oo-h">{OOH_COPY.closing}</h2>
              <Link href={ENQUIRY_HREF} className="btn btn-inverse mt-5">
                {OOH_COPY.cta}
                <span aria-hidden="true" className="btn-arrow">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="oo-foot" aria-hidden="true">
          <span data-label="" />
          <span className="oo-hint" data-hint="">
            Scroll to enter the screen
          </span>
        </div>
      </div>
    </section>
  );
}
