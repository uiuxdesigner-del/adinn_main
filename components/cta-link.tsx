"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "@/lib/track";

/** A normal link that also reports a meaningful CTA interaction (cta_click) to the data layer. */
export function CtaLink({
  event = "cta_click",
  label,
  ...props
}: ComponentProps<typeof Link> & { label: string; event?: string }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        track(event, { label, href: typeof props.href === "string" ? props.href : undefined });
      }}
    />
  );
}

/** Plain anchor (tel:, mailto:, wa.me) with the same tracking. */
export function TrackedAnchor({
  event,
  label,
  ...props
}: ComponentProps<"a"> & { event: string; label: string }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        track(event, { label });
      }}
    />
  );
}
