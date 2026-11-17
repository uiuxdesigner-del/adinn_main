"use client";

/* Plain <img> is deliberate: photographs are preloaded and decoded by hand so frames never go blank,
   and the logo bands are decorative. */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import {
  clientLogos,
  isValidHref,
  type ClientCampaign,
  type ClientLogo,
} from "@/lib/client-showcase";
import { createShakeDetector } from "./shake-detector";
import "./clients-showcase.css";

/* ---------- timing ---------- */
const AUTO_MS = 4500;
const FADE_MS = 700; // slide-and-mask change (not a fade)
const FADE_FAST_MS = 340;
const POINTER_IDLE_MS = 2000;
const SWIPE_MIN_PX = 48;

/* ---------- background logos ---------- */
/**
 * Each band is a ring of logos on the inside of a vertical cylinder seen from the front (a shallow
 * bowl). The ring turns slowly (pure CSS, see clients-showcase.css), the two bands in opposite
 * directions. Every logo is a rigid flat plane, so proportions are preserved; the stretched look is
 * perspective only: planes near the edges are closer (taller) and turned inwards.
 */
const AREA = 5.4 ** 2;
const MAX_W = 10.5;
const SLOTS = 12; // every logo once per ring, 30 degrees apart

type BandLogo = { key: string; logo: ClientLogo; w: number; h: number; a0: number };

function buildBand(offset: number, startAngle: number): BandLogo[] {
  return Array.from({ length: SLOTS }, (_, i) => {
    const logo = clientLogos[(i + offset) % clientLogos.length];
    const ar = logo.w / logo.h;
    const w = Math.min(MAX_W, Math.sqrt(AREA * ar));
    return {
      key: `${logo.id}-${i}`,
      logo,
      w: Number(w.toFixed(3)),
      h: Number((w / ar).toFixed(3)),
      a0: Number((startAngle + (i * 360) / SLOTS).toFixed(3)),
    };
  });
}

/* ---------- reduced motion (hydration-safe) ---------- */
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const getReducedServer = () => false;

const srcOf = (c: ClientCampaign) =>
  c.photo?.src ?? clientLogos.find((l) => l.id === c.clientId)?.src ?? "";

/* ---------- foreground photograph: at most two layers, one transition at a time ---------- */
type Layers = { base: ClientCampaign; incoming: ClientCampaign | null };

function PhotoStage({
  current,
  durationMs,
  dir,
  onError,
}: {
  current: ClientCampaign;
  durationMs: number;
  dir: 1 | -1;
  onError: (id: string) => void;
}) {
  const [layers, setLayers] = useState<Layers>({ base: current, incoming: null });

  // Derive the layer pair during render (no effect): the newest request replaces any in-flight
  // incoming layer, so requests coalesce instead of queueing and never stack beyond two photos.
  const top = layers.incoming ?? layers.base;
  if (top.id !== current.id) {
    setLayers(
      current.id === layers.base.id
        ? { base: layers.base, incoming: null }
        : { base: layers.base, incoming: current },
    );
  }

  const incomingId = layers.incoming?.id;
  useEffect(() => {
    if (!incomingId) return;
    const t = window.setTimeout(
      () => setLayers((l) => (l.incoming ? { base: l.incoming, incoming: null } : l)),
      durationMs + 40,
    );
    return () => window.clearTimeout(t);
  }, [incomingId, durationMs]);

  const img = (c: ClientCampaign, cls: string, hidden: boolean) => {
    const logo = clientLogos.find((l) => l.id === c.clientId);
    const size = c.photo ?? (logo ? { w: logo.w, h: logo.h } : { w: 1, h: 1 });
    return (
      <div
        key={cls === "cs-incoming" ? `in-${c.id}` : `base-${c.id}`}
        className={`cs-layer ${cls}`}
        data-leaving={hidden || undefined}
        aria-hidden={hidden || undefined}
      >
        <img
          className={c.photo ? "cs-photo" : "cs-logoimg"}
          src={srcOf(c)}
          alt={hidden ? "" : c.alt}
          width={size.w}
          height={size.h}
          decoding="async"
          draggable={false}
          style={c.photo ? { objectPosition: `${c.focal?.x ?? 50}% ${c.focal?.y ?? 50}%` } : undefined}
          onError={() => onError(c.id)}
        />
      </div>
    );
  };

  return (
    <div className="cs-frame" style={{ "--fade": `${durationMs}ms`, "--dir": dir } as CSSProperties}>
      {img(layers.base, "cs-base", Boolean(layers.incoming))}
      {layers.incoming ? img(layers.incoming, "cs-incoming", false) : null}
    </div>
  );
}

/* ---------- main component ---------- */
type Active = { id: string; fast: boolean; dir: 1 | -1 };
type Source = "auto" | "manual" | "shake" | "swipe";

export function ClientsShowcase({ campaigns }: { campaigns: ClientCampaign[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [failed, setFailed] = useState<string[]>([]);
  const list = useMemo(
    () =>
      campaigns.filter(
        (c) => !failed.includes(c.id) && (!c.clientId || clientLogos.some((l) => l.id === c.clientId)),
      ),
    [campaigns, failed],
  );
  const [active, setActive] = useState<Active>({ id: campaigns[0]?.id ?? "", fast: false, dir: 1 });
  const [announce, setAnnounce] = useState("");
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, getReducedServer);

  // Mutable, render-free state shared with listeners.
  const live = useRef({
    list,
    activeId: active.id,
    pending: null as string | null,
    paused: false,
    reduced: false,
    inView: false,
    tabVisible: true,
    pointerActive: false,
    focusInside: false,
  });
  const preloads = useRef(new Map<string, Promise<boolean>>());
  const api = useRef<{
    sync: (restart?: boolean) => void;
    step: (d: number, s: Source) => void;
    kick: (level: number) => void;
  }>({
    sync: () => {},
    step: () => {},
    kick: () => {},
  });

  const markFailed = useCallback((id: string) => {
    setFailed((f) => (f.includes(id) ? f : [...f, id]));
  }, []);

  const preload = useCallback((c: ClientCampaign) => {
    let p = preloads.current.get(c.id);
    if (!p) {
      p = new Promise<boolean>((resolve) => {
        const im = new Image();
        im.src = srcOf(c);
        im.decode().then(
          () => resolve(true),
          () => resolve(false),
        );
      });
      preloads.current.set(c.id, p);
    }
    return p;
  }, []);

  const index = Math.max(0, list.findIndex((c) => c.id === active.id));
  const current = list[index];
  const currentId = current?.id ?? "";

  // Keep the mutable mirror current. If the active photograph failed and left the list, the render
  // above already falls back to the first remaining one; the mirror follows it.
  useEffect(() => {
    live.current.list = list;
    live.current.activeId = currentId;
  }, [list, currentId]);

  /** Move to a campaign by relative step. Only the latest request is committed. */
  const goStep = useCallback(
    function step(delta: number, source: Source, fast = false) {
      const L = live.current;
      const l = L.list;
      if (l.length < 2) return;
      const fromId = L.pending ?? L.activeId;
      const from = Math.max(0, l.findIndex((c) => c.id === fromId));
      const target = l[(from + delta + l.length * 4) % l.length];
      L.pending = target.id;
      void preload(target).then((ok) => {
        if (L.pending !== target.id) return; // superseded by a newer request
        if (!ok) {
          // Skip a photograph that will not load: drop it and take the same step again.
          markFailed(target.id);
          L.list = l.filter((c) => c.id !== target.id);
          L.pending = null;
          step(delta, source, fast);
          return;
        }
        L.pending = null;
        L.activeId = target.id;
        setActive({ id: target.id, fast, dir: delta < 0 ? -1 : 1 });
        if (source === "manual" || source === "swipe") {
          const pos = l.findIndex((c) => c.id === target.id) + 1;
          const logo = clientLogos.find((x) => x.id === target.clientId);
          setAnnounce(`${logo?.name ?? target.title ?? "Photograph"}, ${pos} of ${l.length}`);
        }
      });
    },
    [preload, markFailed],
  );

  // Warm the next photographs.
  useEffect(() => {
    if (list.length < 2) return;
    for (let k = 1; k <= 2; k++) {
      const c = list[(index + k) % list.length];
      void preload(c).then((ok) => {
        if (!ok) markFailed(c.id);
      });
    }
  }, [list, index, preload, markFailed]);

  /* One scoped effect owns every listener, observer and timer. */
  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return;
    const L = live.current;
    // Tuned so a mild shake counts; most visitors will not know to shake hard.
    const detector = createShakeDetector({
      minExcursion: 28,
      minSegment: 8,
      minReversals: 1,
      minTravel: 60,
      minSpeed: 140,
      minSpanMs: 100,
      minRecentSpeed: 80,
      slowSpeed: 200,
      fastSpeed: 1500,
      slowIntervalMs: 650,
    });
    // Plain movement also moves the carousel: every TRAVEL_STEP px of travel steps once.
    const TRAVEL_STEP = 100;
    const TRAVEL_MIN_MS = 300;
    let travelX = 0;
    let travelY = 0;
    let lastX = 0;
    let lastY = 0;
    let haveLast = false;
    let lastTravelStep = -1e9;
    let autoTimer = 0;
    let idleTimer = 0;
    let lastShakeStep = -1e9;
    let rectLeft = panel.getBoundingClientRect().left;
    let rectTop = panel.getBoundingClientRect().top;
    L.tabVisible = !document.hidden;

    const shouldRun = () =>
      !L.paused && !L.reduced && L.inView && L.tabVisible && !L.pointerActive && !L.focusInside && L.list.length > 1;

    const sync = (restart = false) => {
      if (restart && autoTimer) {
        window.clearTimeout(autoTimer);
        autoTimer = 0;
      }
      if (shouldRun()) {
        if (!autoTimer) {
          autoTimer = window.setTimeout(() => {
            autoTimer = 0;
            goStep(1, "auto");
          }, AUTO_MS);
        }
      } else if (autoTimer) {
        window.clearTimeout(autoTimer);
        autoTimer = 0;
      }
    };
    // Background speed: the bands' CSS animations are sped up (playbackRate keeps them continuous)
    // and ease back to normal, so shaking makes them surge instead of jump.
    let rate = 1;
    let raf = 0;
    let lastFrame = 0;
    const applyRate = () => {
      panel.querySelectorAll<HTMLElement>(".cs-band").forEach((el) => {
        el.getAnimations().forEach((a) => {
          a.playbackRate = rate;
        });
      });
    };
    const decay = (now: number) => {
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      rate = 1 + (rate - 1) * Math.exp(-dt / 0.7);
      if (rate < 1.03) {
        rate = 1;
        applyRate();
        raf = 0;
        return;
      }
      applyRate();
      raf = requestAnimationFrame(decay);
    };
    const kick = (level: number) => {
      if (L.reduced) return;
      rate = Math.max(rate, level);
      applyRate();
      if (!raf) {
        lastFrame = performance.now();
        raf = requestAnimationFrame(decay);
      }
    };
    api.current = { sync, step: (d, s) => goStep(d, s), kick };

    const markActive = () => {
      window.clearTimeout(idleTimer);
      if (!L.pointerActive) {
        L.pointerActive = true;
        sync();
      }
      idleTimer = window.setTimeout(() => {
        L.pointerActive = false;
        detector.reset();
        travelX = 0;
        travelY = 0;
        haveLast = false;
        sync();
      }, POINTER_IDLE_MS);
    };

    const refreshRect = () => {
      const r = panel.getBoundingClientRect();
      rectLeft = r.left;
      rectTop = r.top;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        detector.reset();
        return;
      }
      markActive();
      if (L.reduced || L.list.length < 2) return;
      const t = performance.now();
      const x = e.clientX - rectLeft;
      const y = e.clientY - rectTop;
      const res = detector.push(t, x, y);
      if (res) kick(5 + Math.min(14, res.speed / 110));
      if (res && t - lastShakeStep >= res.intervalMs && t - lastTravelStep >= TRAVEL_MIN_MS) {
        lastShakeStep = t;
        travelX = 0;
        travelY = 0;
        goStep(1, "shake", res.intervalMs < 450);
      } else if (!res) {
        if (haveLast) {
          travelX += x - lastX;
          travelY += y - lastY;
        }
        // Right/down move forward, left/up move back; whichever axis travelled further decides.
        const lead = Math.abs(travelX) >= Math.abs(travelY) ? travelX : travelY;
        if (Math.abs(lead) >= TRAVEL_STEP && t - Math.max(lastShakeStep, lastTravelStep) >= TRAVEL_MIN_MS) {
          lastTravelStep = t;
          goStep(lead > 0 ? 1 : -1, "shake", false);
          kick(5);
          travelX = 0;
          travelY = 0;
        }
      }
      lastX = x;
      lastY = y;
      haveLast = true;
    };
    const onEnter = (e: PointerEvent) => {
      refreshRect();
      if (e.pointerType !== "mouse") detector.reset();
      else markActive();
    };
    const onLeave = () => {
      detector.reset();
      travelX = 0;
      travelY = 0;
      haveLast = false;
    };

    let swipe: { id: number; x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      detector.reset(); // input switched away from a mouse
      markActive();
      swipe = (e.target as Element).closest("a,button") ? null : { id: e.pointerId, x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (!swipe || swipe.id !== e.pointerId) return;
      const dx = e.clientX - swipe.x;
      const dy = e.clientY - swipe.y;
      swipe = null;
      if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) goStep(dx < 0 ? 1 : -1, "swipe");
    };
    const onCancel = () => {
      swipe = null;
    };

    const onVisibility = () => {
      L.tabVisible = !document.hidden;
      detector.reset();
      sync();
    };

    const onFocusIn = (e: FocusEvent) => {
      L.focusInside = (e.target as Element).matches(":focus-visible");
      sync();
    };
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Element | null;
      L.focusInside = Boolean(next && root.contains(next) && next.matches(":focus-visible"));
      sync();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      goStep(e.key === "ArrowRight" ? 1 : -1, "manual");
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        L.inView = entry.isIntersecting;
        if (!entry.isIntersecting) detector.reset();
        sync();
      },
      { threshold: 0.3 },
    );
    io.observe(root);
    const ro = new ResizeObserver(refreshRect);
    ro.observe(panel);

    panel.addEventListener("pointermove", onMove, { passive: true });
    panel.addEventListener("pointerenter", onEnter);
    panel.addEventListener("pointerleave", onLeave);
    panel.addEventListener("pointerdown", onDown);
    panel.addEventListener("pointerup", onUp);
    panel.addEventListener("pointercancel", onCancel);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    root.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", refreshRect, { passive: true });

    return () => {
      window.clearTimeout(autoTimer);
      window.clearTimeout(idleTimer);
      io.disconnect();
      ro.disconnect();
      panel.removeEventListener("pointermove", onMove);
      panel.removeEventListener("pointerenter", onEnter);
      panel.removeEventListener("pointerleave", onLeave);
      panel.removeEventListener("pointerdown", onDown);
      panel.removeEventListener("pointerup", onUp);
      panel.removeEventListener("pointercancel", onCancel);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      root.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", refreshRect);
      L.pending = null;
      cancelAnimationFrame(raf);
      api.current = { sync: () => {}, step: () => {}, kick: () => {} };
    };
  }, [goStep]);

  // Playback/preference changes and every committed change restart the 4.5s countdown.
  useEffect(() => {
    live.current.reduced = reduced;
    api.current.sync(true);
    api.current.kick(3); // a gentle surge of the background on every change
  }, [reduced, currentId, list.length]);

  const bands = useMemo(() => [buildBand(0, 0), buildBand(6, 12)], []);

  if (!current) return null;
  const logo = clientLogos.find((l) => l.id === current.clientId);
  const href = isValidHref(current.href) ? current.href : null;
  const fadeMs = reduced ? 0 : active.fast ? FADE_FAST_MS : FADE_MS;

  return (
    <section ref={rootRef} className="cs-section" aria-label="Clients">
      <div ref={panelRef} className="cs-panel">
        <h2 className="cs-srOnly">Clients</h2>

        {/* Decorative background: whole subtree hidden from assistive technology. */}
        <div className="cs-stage" aria-hidden="true">
          {bands.map((band, b) => (
            <div key={b} className="cs-band" data-dir={b === 0 ? "1" : "-1"} style={{ "--row": b === 0 ? -1 : 1 } as CSSProperties}>
              {band.map((p) => (
                <div
                  key={p.key}
                  className="cs-logo"
                  data-active={p.logo.id === current.clientId ? "true" : undefined}
                  style={{ "--w": p.w, "--h": p.h, "--a0": p.a0 } as CSSProperties}
                >
                  <img src={p.logo.src} alt="" width={p.logo.w} height={p.logo.h} draggable={false} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="cs-quiet" aria-hidden="true" />

        <figure className="cs-focus">
          <PhotoStage current={current} durationMs={fadeMs} dir={active.dir} onError={markFailed} />
          <figcaption className="cs-caption">
            <div className="cs-captionRow">
              {logo && current.photo && <img className="cs-captionLogo" src={logo.src} alt="" width={logo.w} height={logo.h} />}
              <span className="cs-client">{logo ? logo.name : current.title}</span>
            </div>
            {((logo && current.title) || href) && (
              <div className="cs-captionRow">
                {logo && current.title ? <span className="cs-title">{current.title}</span> : <span />}
                {href &&
                  (href.startsWith("/") ? (
                    <Link className="cs-link" href={href}>
                      View campaign<span className="cs-srOnly">: {logo?.name ?? current.title}</span>
                    </Link>
                  ) : (
                    <a className="cs-link" href={href} rel="noopener noreferrer">
                      View campaign<span className="cs-srOnly">: {logo?.name ?? current.title}</span>
                    </a>
                  ))}
              </div>
            )}
          </figcaption>
        </figure>

        {/* Announced only after a deliberate manual change, never for automatic cycling. */}
        <p className="cs-srOnly" aria-live="polite" aria-atomic="true">
          {announce}
        </p>
      </div>
    </section>
  );
}
