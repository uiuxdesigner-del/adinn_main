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
export function SmoothScroll() {
  const pathname = usePathname();

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
