"use client";

type Dl = { push: (e: Record<string, unknown>) => void };

/**
 * Pushes a measurement event to window.dataLayer when a tag manager or analytics tag has created it.
 * No vendor is installed here: add GTM/GA4 (or similar) to the layout and these events flow through.
 */
export function track(event: string, params: Record<string, unknown> = {}) {
  try {
    const w = window as unknown as { dataLayer?: Dl };
    w.dataLayer?.push({ event, ...params });
  } catch {
    /* measurement must never break the page */
  }
}
