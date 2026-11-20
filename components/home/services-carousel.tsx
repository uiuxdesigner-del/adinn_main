"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CtaLink } from "@/components/cta-link";
import { enquiryHref } from "@/lib/navigation";

export type ServiceSlide = {
  id: string;
  /** "01" ... "08" */
  no: string;
  /** Category label, e.g. "Outdoor / OOH". */
  label: string;
  /** What the client achieves: the slide heading. */
  heading: string;
  /** What Adinn delivers: the slide body. */
  body: string;
  /** How this service connects with the others. */
  connects: string;
  /** "Discuss Outdoor" */
  cta: string;
  image: string;
  alt: string;
};

/**
 * "Eight connected services": a thumbnail rail (left), the service copy (centre) and one large picture (right) with
 * previous / next controls and a 01 / 08 counter. One picture is visible at a time: the next one slides in from the
 * side it was chosen from; the old one is gone at that instant (no cross-fade, no double image). All eight pictures
 * are mounted so a change never waits for a download.
 */
export function ServicesCarousel({ slides }: { slides: ServiceSlide[] }) {
  const [{ i, dir }, setPos] = useState({ i: 0, dir: 1 });
  const n = slides.length;
  const go = useCallback(
    (to: number) => {
      const next = ((to % n) + n) % n;
      setPos((p) => ({ i: next, dir: next >= p.i ? 1 : -1 }));
    },
    [n],
  );
  const s = slides[i];
  const rail = useRef<HTMLOListElement>(null);
  // Phone layout: the thumbnail strip scrolls sideways; keep the active thumbnail in view (horizontal only, never the page).
  useEffect(() => {
    const el = rail.current;
    const t = el?.children[i] as HTMLElement | undefined;
    if (!el || !t || el.scrollWidth <= el.clientWidth) return;
    el.scrollTo({ left: t.offsetLeft - (el.clientWidth - t.clientWidth) / 2, behavior: "smooth" });
  }, [i]);

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      aria-roledescription="carousel"
      className="sc"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          go(i + 1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          go(i - 1);
        }
      }}
    >
      <div className="sc-wrap">
        <header className="sc-head">
          <h2 id="services-heading" className="sc-title">
            Eight connected services.
          </h2>
          <p className="sc-count" aria-hidden="true">
            <b>{s.no}</b> / {String(n).padStart(2, "0")}
          </p>
        </header>

        <div className="sc-body">
          <ol ref={rail} className="sc-rail" aria-label="Choose a service">
            {slides.map((x, k) => (
              <li key={x.id}>
                <button
                  type="button"
                  className="sc-thumb"
                  aria-current={k === i ? "true" : undefined}
                  aria-label={`${x.no} ${x.label}`}
                  onClick={() => go(k)}
                >
                  <span className="sc-thumbimg">
                    <Image src={x.image} alt="" fill sizes="96px" className="object-cover" />
                  </span>
                  <span className="sc-no">{x.no}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="sc-copy" aria-live="polite">
            <p className="sc-label">{s.label}</p>
            <h3 key={`h-${s.id}`} className="sc-h sc-in" style={{ ["--d" as string]: dir }}>
              {s.heading}
            </h3>
            <p key={`p-${s.id}`} className="sc-p sc-in" style={{ ["--d" as string]: dir }}>
              {s.body}
            </p>
            <p key={`c-${s.id}`} className="sc-p sc-in" style={{ ["--d" as string]: dir, marginTop: "0.75rem", fontSize: "0.9375rem" }}>
              <b>Connects with:</b> {s.connects}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "1.5rem" }}>
              <CtaLink href={enquiryHref(`service:${s.id}`)} label={`service_${s.id}`} className="sc-cta">
                {s.cta}
                <span aria-hidden="true" className="sc-arrow">
                  →
                </span>
              </CtaLink>
              <CtaLink href={`/verticals/${s.id}`} label={`service_page_${s.id}`} className="link" style={{ marginTop: "1.5rem", padding: "0.5rem 0" }}>
                About {s.label}
                <span aria-hidden="true"> →</span>
              </CtaLink>
            </div>
          </div>

          <div className="sc-stage">
            <div className="sc-frame">
              {slides.map((x, k) => (
                <Image
                  key={x.id}
                  src={x.image}
                  alt={k === i ? x.alt : ""}
                  aria-hidden={k === i ? undefined : true}
                  fill
                  priority={k === 0}
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className={`sc-pic object-cover ${k === i ? "sc-pic-on" : ""}`}
                  style={{ ["--d" as string]: dir }}
                />
              ))}
            </div>
            <div className="sc-ctrl">
              <button type="button" className="sc-btn" aria-label="Previous service" onClick={() => go(i - 1)}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className="sc-btn" aria-label="Next service" onClick={() => go(i + 1)}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
