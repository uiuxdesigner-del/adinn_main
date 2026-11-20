"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, MOTION_OK, ScrollTrigger } from "@/lib/gsap";

/**
 * The single owner of smooth scrolling and ScrollTrigger housekeeping.
 *
 * - One Lenis instance, driven by GSAP's ticker (autoRaf off) so there is one RAF source.
 * - Native touch scrolling, keyboard scrolling, scrollbar dragging, anchors and
 *   nested scroll areas are left to the browser.
 * - Under reduced motion no Lenis instance is created.
 * - Cleanup removes exactly what this effect added.
 */
const SCROLL_KEY = "adinn:scroll:";
let scrollRestoreDone = false; // set when the restore has run (survives dev strict-mode re-mounts)

export function SmoothScroll() {
  const pathname = usePathname();

  // Keep the same view on refresh. The browser restores scroll before the pinned chapters have added their
  // height, so it clamps to the shorter page (and lands in the wrong chapter). Restore manually after the
  // pins are measured, then refresh once so every pinned story snaps to the restored progress.
  useEffect(() => {
    const key = SCROLL_KEY + window.location.pathname;
    history.scrollRestoration = "manual";
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    let saved = 0;
    try {
      saved = !scrollRestoreDone && nav && (nav.type === "reload" || nav.type === "back_forward") ? Number(sessionStorage.getItem(key)) || 0 : 0;
    } catch {}
    let restored = saved <= 0;
    if (restored) document.documentElement.removeAttribute("data-restoring");
    const save = () => {
      if (!restored) return;
      try {
        sessionStorage.setItem(key, String(Math.round(window.scrollY)));
      } catch {}
    };
    const finish = () => {
      if (restored) return;
      restored = true;
      scrollRestoreDone = true;
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      window.scrollTo(0, saved);
      ScrollTrigger.update();
      // Scrubbed stories follow scroll CHANGES only: put every scrubbed animation at its trigger's real progress
      // now (and finish any scrub in flight) so the restored frame is the exact frame, not the story's opening.
      for (const t of ScrollTrigger.getAll()) {
        if (t.animation && t.vars.scrub) {
          t.animation.progress(t.progress);
          t.getTween()?.progress(1);
        }
      }
      // Reveal only once the story images are decoded (so no half-painted frame) and the synced state has been
      // painted into the still-hidden stories; capped so a slow image can never keep the page hidden.
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("#outdoor-story img[data-ooh]"));
      const decoded = Promise.all(imgs.map((i) => i.decode().catch(() => undefined)));
      void Promise.race([decoded, new Promise((r) => window.setTimeout(r, 1500))]).then(() =>
        requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.removeAttribute("data-restoring"))),
      );
    };
    // ScrollTrigger re-applies its own scroll value on every refresh pass (images loading, fonts, pins being
    // built), so restore only once the refreshes have settled and the page is tall enough for the saved spot.
    let settle = 0;
    function onRefresh() {
      if (restored) return;
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (document.documentElement.scrollHeight - window.innerHeight >= saved - 1) finish();
      }, 400);
    }
    ScrollTrigger.addEventListener("refresh", onRefresh);
    onRefresh();
    // give up waiting after the page has settled (e.g. the saved position no longer exists)
    const giveUp = window.setTimeout(finish, 4000);
    window.addEventListener("scroll", save, { passive: true });
    window.addEventListener("pagehide", save);
    return () => {
      window.clearTimeout(giveUp);
      window.clearTimeout(settle);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      window.removeEventListener("scroll", save);
      window.removeEventListener("pagehide", save);
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia(MOTION_OK).matches) return;

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.14,
      wheelMultiplier: 1,
      smoothWheel: true,
      allowNestedScroll: true,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  // Refresh trigger positions after genuine layout changes: page load, route
  // changes, and body height changes (images, filters, review notes). Debounced.
  useEffect(() => {
    const refresh = gsap.delayedCall(0.15, () => ScrollTrigger.refresh());
    refresh.pause();
    const schedule = () => refresh.restart(true);

    let lastHeight = document.body.offsetHeight;
    const observer = new ResizeObserver(() => {
      const h = document.body.offsetHeight;
      if (Math.abs(h - lastHeight) > 2) {
        lastHeight = h;
        schedule();
      }
    });
    observer.observe(document.body);
    window.addEventListener("load", schedule);
    schedule();

    return () => {
      observer.disconnect();
      window.removeEventListener("load", schedule);
      refresh.kill();
    };
  }, [pathname]);

  return null;
}
