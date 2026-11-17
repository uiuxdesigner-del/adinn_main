"use client";

import { useState } from "react";
import { track } from "@/lib/track";

/** The film is fetched from Adinn's site only after the visitor asks for it (no heavy preload). */
export function CaseFilm({ src, client }: { src: string; client: string }) {
  const [on, setOn] = useState(false);
  if (!on) {
    return (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => {
          setOn(true);
          track("case_film_play", { client });
        }}
      >
        Watch the {client} film
      </button>
    );
  }
  return (
    <video
      className="mt-1 aspect-video w-full rounded-lg bg-ink"
      src={src}
      controls
      autoPlay
      playsInline
      preload="metadata"
      aria-label={`${client} campaign film`}
    />
  );
}
