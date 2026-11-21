"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LiquidGlass } from "@/components/liquid-glass";
import { mainNav } from "@/lib/navigation";

// The four links inside the pill, and the separate Contact pill after it.
const pillNav = mainNav.slice(0, 4);
const contactNav = mainNav[4];

type NavItem = { href: string; label: string };
type Tone = "light" | "dark";

// Every link is its own soft capsule inside the glass pill (no outlines: shape comes from soft inner shading only). Hover/focus change
// nothing but the word, which scales up. The current page is a slightly deeper capsule with a heavier word.
const capsule = "group rounded-full text-sm font-medium aria-[current=page]:font-semibold";
const word =
  "inline-block transition-transform duration-200 ease-out group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:scale-100";

const ink: Record<Tone, string> = {
  light: "text-[#141218]",
  dark: "text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]",
};
const pane: Record<Tone, string> = {
  light:
    "bg-[rgba(0,0,0,0.035)] shadow-[inset_2px_2px_5px_-2px_rgba(255,255,255,0.95),inset_-2px_-3px_6px_-3px_rgba(0,0,0,0.14),0_2px_6px_-3px_rgba(0,0,0,0.2)] aria-[current=page]:bg-[rgba(0,0,0,0.08)]",
  dark: "bg-white/[0.08] shadow-[inset_2px_2px_5px_-2px_rgba(255,255,255,0.4),inset_-2px_-3px_6px_-3px_rgba(0,0,0,0.4),0_2px_6px_-3px_rgba(0,0,0,0.4)] aria-[current=page]:bg-white/20",
};
// Contact is its own glass capsule; when it is the current page its text sits on a slightly deeper tint.
const contactCurrent: Record<Tone, string> = { light: "aria-[current=page]:bg-[rgba(0,0,0,0.06)]", dark: "aria-[current=page]:bg-white/15" };

// How bright is it behind a point on screen (0 black .. 255 white)? Images and canvases (the scroll stories are made of them) are sampled
// at the matching pixel; anything else uses its solid background colour. A section can force the answer with data-header-tone.
let sampler: CanvasRenderingContext2D | null | undefined;
// Exact pixel lookup assumes the element is only moved and scaled. A rotated or perspective-projected one (like the screen in the
// digital chapter) would map the point to the wrong pixel.
function axisAligned(el: Element): boolean {
  for (let n: Element | null = el; n; n = n.parentElement) {
    const t = getComputedStyle(n).transform;
    if (!t || t === "none") continue;
    const v = t.slice(t.indexOf("(") + 1, -1).split(",").map(Number);
    const m = t.startsWith("matrix3d") ? { skew: [v[1], v[4]], persp: [v[3], v[7]] } : { skew: [v[1], v[2]], persp: [0, 0] };
    if (m.skew.some((k) => Math.abs(k) > 1e-4) || m.persp.some((k) => Math.abs(k) > 1e-6)) return false;
  }
  return true;
}

function pixelLuminance(el: HTMLImageElement | HTMLCanvasElement, x: number, y: number): number | null {
  const box = el.getBoundingClientRect();
  const nw = el instanceof HTMLImageElement ? el.naturalWidth : el.width;
  const nh = el instanceof HTMLImageElement ? el.naturalHeight : el.height;
  if (!box.width || !box.height || !nw || !nh) return null;
  // exact lookup when the element is only moved/scaled; otherwise (rotated or projected) use its middle as a fair stand-in
  const exact = axisAligned(el);
  const u = exact ? (x - box.left) / box.width : 0.5;
  const v = exact ? (y - box.top) / box.height : 0.5;
  if (u < 0 || u > 1 || v < 0 || v > 1) return null;
  if (sampler === undefined) {
    const c = document.createElement("canvas");
    c.width = c.height = 8;
    sampler = c.getContext("2d", { willReadFrequently: true });
  }
  if (!sampler) return null;
  const sw = Math.max(2, nw * 0.05);
  const sh = Math.max(2, nh * 0.05);
  const sx = Math.min(Math.max(0, u * nw - sw / 2), nw - sw);
  const sy = Math.min(Math.max(0, v * nh - sh / 2), nh - sh);
  try {
    sampler.clearRect(0, 0, 8, 8);
    sampler.drawImage(el, sx, sy, sw, sh, 0, 0, 8, 8);
    const d = sampler.getImageData(0, 0, 8, 8).data;
    let sum = 0;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 128) continue;
      sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      n++;
    }
    return n > 20 ? sum / n : null; // mostly transparent: look through to what is below
  } catch {
    return null; // a cross-origin image cannot be read
  }
}

const shown = (el: Element) => {
  // a layer that is faded out (itself or through a parent) is not what the eye sees
  let o = 1;
  for (let n: Element | null = el; n && o > 0.5; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
  return o > 0.5;
};

function lumAt(x: number, y: number, header: Element | null): number {
  for (const el of document.elementsFromPoint(x, y)) {
    if (header?.contains(el)) continue;
    const forced = el.closest<HTMLElement>("[data-header-tone]");
    if (forced) return forced.dataset.headerTone === "dark" ? 0 : 255;
    if (!shown(el)) continue;
    if (el instanceof HTMLImageElement || el instanceof HTMLCanvasElement) {
      const l = pixelLuminance(el, x, y);
      if (l !== null) return l;
    }
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (!m) continue;
    const [r, g, b, a = 1] = m.map(Number);
    if (a < 0.5) continue;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  return 255;
}

export function Header() {
  const pathname = usePathname();
  // The menu is "open" only for the page it was opened on, so navigating closes it.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>("a")?.focus();
  }, [open]);

  // Each glass part (and the logo) looks at what is behind it, on scroll and resize, so glass, text and logo stay legible.
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [tones, setTones] = useState<Record<"logo" | "pill" | "contact" | "menu", Tone>>({
    logo: "light",
    pill: "light",
    contact: "light",
    menu: "light",
  });

  useEffect(() => {
    const header = headerRef.current;
    let frame = 0;
    const probe = (el: HTMLElement | null, was: Tone): Tone | null => {
      const box = el?.getBoundingClientRect();
      if (!box || !box.width) return null;
      // a grid across the element (5 x 3), so a backdrop that is half dark and half light averages out instead of hinging on one point
      const pts = [0.1, 0.3, 0.5, 0.7, 0.9].flatMap((fx) =>
        [0.2, 0.5, 0.8].map((fy) => lumAt(box.left + box.width * fx, box.top + box.height * fy, header)),
      );
      const avg = pts.reduce((a, b) => a + b, 0) / pts.length;
      // hysteresis: switch to dark below 120, back to light above 150, so it does not flicker around the middle
      return was === "dark" ? (avg > 150 ? "light" : "dark") : avg < 120 ? "dark" : "light";
    };
    const check = () => {
      frame = 0;
      setTones((cur) => {
        const next = {
          logo: probe(logoRef.current, cur.logo) ?? cur.logo,
          pill: probe(pillRef.current, cur.pill) ?? cur.pill,
          contact: probe(contactRef.current, cur.contact) ?? cur.contact,
          menu: probe(menuRef.current, cur.menu) ?? cur.menu,
        };
        return cur.logo === next.logo && cur.pill === next.pill && cur.contact === next.contact && cur.menu === next.menu ? cur : next;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  // Only real pages are ever "current". Anchor links (/#solutions, /#services) never match a pathname, so they are not marked.
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Clicking an anchor link whose hash is already in the URL does not scroll by itself: do it explicitly (scroll-margin-top clears the header).
  const handleClick = (item: NavItem, after?: () => void) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const [path, hash] = item.href.split("#");
    if (hash && pathname === (path || "/") && window.location.hash === `#${hash}`) {
      e.preventDefault();
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    after?.();
  };

  const navLink = (item: NavItem, className: string, after?: () => void, wordClass = "") => (
    <Link
      href={item.href}
      onClick={handleClick(item, after)}
      aria-current={isActive(item.href) ? "page" : undefined}
      className={`${capsule} ${className}`}
    >
      <span className={`${word} ${wordClass}`}>{item.label}</span>
    </Link>
  );

  const logoDark = tones.logo === "dark";

  // The homepage has the full-screen scroll stories. They pin themselves below the header, using its measured height, so an in-flow
  // header leaves a plain page-coloured strip above them. On the homepage the header therefore takes no layout height (the stories
  // measure 0 and run to the top of the screen, behind the glass), and an invisible spacer keeps the hero's top spacing unchanged.
  // Every other page keeps the normal in-flow header.
  const floating = pathname === "/";

  return (
    <>
    <header
      ref={headerRef}
      data-float={floating ? "" : undefined}
      className={`sticky top-0 z-40 ${floating ? "h-0" : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          setOpenFor(null);
          buttonRef.current?.focus();
        }
      }}
    >
      <div className={floating ? "absolute inset-x-0 top-0" : undefined}>
      {/* Desktop: logo, nav pill and Contact pill form ONE group, centred as a whole. Mobile: logo left, menu button right. The bar itself
          never catches clicks (it is transparent); only the logo, glass parts and menu do. */}
      <div className="pointer-events-none mx-auto flex h-[4.5rem] max-w-[96rem] items-center justify-between px-5 sm:px-8 md:justify-center md:gap-5">
        <div ref={logoRef} className="pointer-events-auto shrink-0">
          <Link href="/" className="block rounded-sm" aria-label="ADINN Advertising Services Ltd., home">
            {/* Both versions are always loaded; the one that suits the backdrop is shown (an instant swap, no cross-fade). */}
            <span className="relative block h-8" style={{ aspectRatio: "516 / 201" }}>
              <Image
                src="/Adinn.png"
                alt=""
                width={516}
                height={201}
                priority
                className={`absolute inset-0 h-full w-full ${logoDark ? "invisible" : ""}`}
              />
              <Image
                src="/Adinn-dark-bg.png"
                alt=""
                width={516}
                height={201}
                priority
                className={`absolute inset-0 h-full w-full ${logoDark ? "" : "invisible"}`}
              />
            </span>
          </Link>
        </div>

        <nav aria-label="Main" className="pointer-events-auto hidden items-center gap-5 md:flex">
          <LiquidGlass ref={pillRef} tone={tones.pill} className="rounded-full px-3.5 py-[9px]">
            <ul className="flex items-center gap-2.5">
              {pillNav.map((item) => (
                <li key={item.href}>
                  {navLink(item, `inline-flex h-9 items-center px-4 ${ink[tones.pill]} ${pane[tones.pill]}`)}
                </li>
              ))}
            </ul>
          </LiquidGlass>
          <LiquidGlass ref={contactRef} tone={tones.contact} className="rounded-full">
            {navLink(
              contactNav,
              `inline-flex h-11 items-center px-6 text-[0.9375rem] ${ink[tones.contact]} ${contactCurrent[tones.contact]}`,
            )}
          </LiquidGlass>
        </nav>

        <LiquidGlass ref={menuRef} tone={tones.menu} className="pointer-events-auto -mr-2 rounded-full md:hidden">
          <button
            ref={buttonRef}
            type="button"
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-5 text-sm font-medium ${ink[tones.menu]}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpenFor(open ? null : pathname)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </LiquidGlass>
      </div>

      <div id="mobile-menu" ref={panelRef} className={open ? "pointer-events-auto px-3 pb-3 sm:px-6 md:hidden" : "hidden"}>
        <LiquidGlass tone={tones.menu} className="mx-auto max-w-[96rem] rounded-3xl p-3">
          <nav aria-label="Main (mobile)">
            <ul className="space-y-2">
              {mainNav.map((item) => (
                <li key={item.href}>
                  {navLink(
                    item,
                    `flex min-h-12 items-center px-5 text-[0.9375rem] ${ink[tones.menu]} ${pane[tones.menu]}`,
                    () => setOpenFor(null),
                    "origin-left",
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </LiquidGlass>
      </div>
      </div>
    </header>
    {floating && <div aria-hidden="true" className="h-[4.5rem]" />}
    </>
  );
}
