"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode, Ref } from "react";

/**
 * A liquid-glass surface, built from the things that make glass look like glass:
 *
 *  1. Refraction. Along the whole edge (straight sides and corners alike) the surface has a curved bevel. Light passing through it is
 *     bent along the surface normal, so the page behind appears to wrap around the rim, strongest at the very edge and fading to
 *     nothing toward the middle, which stays clear. The bend is an SVG displacement map computed from the element's real rounded
 *     shape, applied as part of the backdrop filter.
 *  2. Dispersion. Red, green and blue are bent by slightly different amounts, which leaves the faint colour fringe real glass has at
 *     its edge.
 *  3. A light blur, extra saturation and brightness for what is seen through it.
 *  4. Specular light: a thin bright highlight on the top-left and bottom-right edges only (see `.lg-glass::after` in globals.css),
 *     plus soft inner glow and a soft lift. No outline anywhere.
 *
 * `tone` says what is behind it ("light" or "dark") so tint, glow and highlight stay legible on both.
 *
 * Refraction needs an SVG filter inside `backdrop-filter`, which only Chromium supports. Elsewhere you get the same glass without
 * the bending (blur, saturation, tint, glow, highlight).
 */
const MAX_SHIFT = 13; // px the backdrop is moved at the very edge (red channel; green and blue move a little less)
const BEZEL = 24; // px, how far in from the edge the curved bevel reaches (capped to 45% of the element's height)
const DISPERSION = [1, 0.86, 0.72] as const; // relative bend for red, green, blue

const supportsRefraction = () =>
  typeof CSS !== "undefined" &&
  CSS.supports("backdrop-filter", "url(#a) blur(1px)") &&
  ((navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } }).userAgentData?.brands.some((b) => /Chromium/.test(b.brand)) ?? false);

/**
 * The displacement map for a w x h rounded rectangle with corner radius r. Each pixel stores which way, and how far, to look
 * instead: 128 means "stay", above/below means "look that way". At the bevel the look-direction points inward (along the negative
 * surface normal), with a strength that is 1 at the edge and falls smoothly to 0 at the bevel's inner boundary.
 */
function displacementMap(w: number, h: number, r: number, bezel: number): string {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(w, h);
  const hx = w / 2;
  const hy = h / 2;
  const ix = hx - r;
  const iy = hy - r;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hx;
      const py = y + 0.5 - hy;
      const qx = Math.abs(px) - ix;
      const qy = Math.abs(py) - iy;
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const len = Math.hypot(ox, oy);
      const inside = -(len + Math.min(Math.max(qx, qy), 0) - r); // distance in from the edge
      let nx = 0;
      let ny = 0;
      if (len > 0) {
        nx = (ox / len) * Math.sign(px);
        ny = (oy / len) * Math.sign(py);
      } else if (qx > qy) nx = Math.sign(px);
      else ny = Math.sign(py);
      const t = inside / bezel;
      const m = inside < 0 || t >= 1 ? 0 : Math.pow(1 - t, 1.6);
      const i = (y * w + x) * 4;
      img.data[i] = Math.round(128 - 127 * nx * m);
      img.data[i + 1] = Math.round(128 - 127 * ny * m);
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}

// A colour matrix that keeps one channel (and alpha) and zeroes the others.
const keepChannel = (channel: 0 | 1 | 2) =>
  [0, 1, 2]
    .map((row) => [0, 1, 2, 3, 4].map((col) => (row === channel && col === channel ? 1 : 0)).join(" "))
    .concat("0 0 0 1 0")
    .join(" ");

export function LiquidGlass({
  tone,
  className = "",
  children,
  ref,
}: {
  tone: "light" | "dark";
  className?: string;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}) {
  const id = `lg${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const own = useRef<HTMLDivElement | null>(null);
  const [shape, setShape] = useState<{ w: number; h: number; r: number } | null>(null);
  const [refract, setRefract] = useState(false);

  // Hand the element to both our own ref and the caller's.
  const setRefs = useCallback(
    (el: HTMLDivElement | null) => {
      own.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = el;
    },
    [ref],
  );

  useEffect(() => {
    const el = own.current;
    if (!el) return;
    const measure = () => {
      setRefract(supportsRefraction());
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) return;
      const w = Math.round(b.width);
      const h = Math.round(b.height);
      const r = Math.min(h / 2, w / 2, parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0);
      setShape((cur) => (cur && cur.w === w && cur.h === h && cur.r === r ? cur : { w, h, r }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bezel = shape ? Math.min(BEZEL, shape.h * 0.45) : BEZEL;
  const map = useMemo(() => (refract && shape ? displacementMap(shape.w, shape.h, shape.r, bezel) : ""), [refract, shape, bezel]);

  const on = !!map && !!shape;
  const style: CSSProperties | undefined = on ? { backdropFilter: `blur(2px) saturate(1.6) brightness(1.08) url(#${id})` } : undefined;
  const S = MAX_SHIFT * 2; // the map moves a pixel by +-(S * 127 / 255), i.e. about half of S

  return (
    <div ref={setRefs} data-tone={tone} className={`lg-glass ${className}`} style={style}>
      {on && shape && (
        <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: "absolute" }}>
          <filter id={id} x="0" y="0" width={shape.w} height={shape.h} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feImage href={map} x="0" y="0" width={shape.w} height={shape.h} preserveAspectRatio="none" result="map" />
            {([0, 1, 2] as const).map((ch) => (
              <feDisplacementMap key={`d${ch}`} in="SourceGraphic" in2="map" scale={S * DISPERSION[ch]} xChannelSelector="R" yChannelSelector="G" result={`d${ch}`} />
            ))}
            {([0, 1, 2] as const).map((ch) => (
              <feColorMatrix key={`c${ch}`} in={`d${ch}`} type="matrix" values={keepChannel(ch)} result={`c${ch}`} />
            ))}
            <feBlend in="c0" in2="c1" mode="screen" result="rg" />
            <feBlend in="rg" in2="c2" mode="screen" />
          </filter>
        </svg>
      )}
      {children}
    </div>
  );
}
