"use client";

import { useRef, type ReactNode } from "react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Animates a group of content into view with GSAP + ScrollTrigger.
 *
 * - Server HTML and the first client render are identical and fully visible.
 * - Animation is created after mount, scoped to this wrapper, and reverted by
 *   useGSAP on unmount. Nothing outside this element is touched.
 * - By default the wrapper itself animates. With `items`, matching descendants
 *   (e.g. "[data-reveal-item]") animate in sequence instead, and the wrapper
 *   does not, so opacity and movement never compound.
 * - With `images`, `[data-photo] img` inside settles from a slight scale.
 * - Reduced motion: no animation is created.
 */
export function Reveal({
  children,
  className,
  items,
  images = false,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  items?: string;
  images?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const targets = items
          ? gsap.utils.toArray<HTMLElement>(items, root)
          : [root];
        if (targets.length === 0) return;
        const trigger = { trigger: root, start: "top 88%", once: true };

        gsap.from(targets, {
          y: 20,
          opacity: 0,
          duration: 0.7,
          delay,
          ease: "power3.out",
          stagger: items ? 0.1 : 0,
          clearProps: "transform,opacity",
          scrollTrigger: trigger,
        });

        if (images) {
          const imgs = gsap.utils.toArray<HTMLElement>("[data-photo] img", root);
          if (imgs.length) {
            gsap.from(imgs, {
              scale: 1.06,
              duration: 1.1,
              delay,
              ease: "power2.out",
              clearProps: "transform",
              scrollTrigger: trigger,
            });
          }
        }
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * A list whose direct children (cards) reveal in short, capped batches as each
 * row enters the viewport. Renders the same markup as a plain <ul>.
 */
export function StaggerList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const cards = gsap.utils.toArray<HTMLElement>(":scope > li", root);
        if (cards.length === 0) return;
        gsap.set(cards, { y: 20, opacity: 0 });
        ScrollTrigger.batch(cards, {
          start: "top 90%",
          once: true,
          batchMax: 4,
          interval: 0.08,
          onEnter: (batch) =>
            gsap.to(batch, {
              y: 0,
              opacity: 1,
              duration: 0.65,
              ease: "power3.out",
              stagger: 0.07,
              overwrite: true,
              clearProps: "transform,opacity",
            }),
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <ul ref={ref} className={className}>
      {children}
    </ul>
  );
}

/**
 * Short entrance for first-screen text. The hero photo is NOT inside this
 * wrapper, so it is never hidden or delayed.
 */
export function HeroIntro({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(gsap.utils.toArray<HTMLElement>(":scope > *", root), {
          y: 16,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          clearProps: "transform,opacity",
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
