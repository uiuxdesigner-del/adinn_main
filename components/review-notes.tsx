"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const ReviewNotesContext = createContext<{
  show: boolean;
  setShow: (value: boolean) => void;
}>({ show: false, setShow: () => {} });

export function ReviewNotesProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <ReviewNotesContext.Provider value={{ show, setShow }}>
      {children}
    </ReviewNotesContext.Provider>
  );
}

export function ReviewNotesToggle() {
  const { show, setShow } = useContext(ReviewNotesContext);
  return (
    <button
      type="button"
      aria-pressed={show}
      onClick={() => setShow(!show)}
      className="text-note shrink-0 self-start rounded-full border border-ink bg-white px-4 py-2.5 font-medium transition-colors hover:bg-line"
    >
      Show Review Notes <span aria-hidden="true">· {show ? "on" : "off"}</span>
    </button>
  );
}

export type ReviewNoteProps = {
  purpose: string;
  needed?: string[];
  awaiting?: string[];
};

/** Internal note for the review team. Hidden until the toggle is on. */
export function ReviewNote({ purpose, needed, awaiting }: ReviewNoteProps) {
  const { show } = useContext(ReviewNotesContext);
  if (!show) return null;
  return (
    <aside
      aria-label="Review note (internal)"
      className="text-note mb-6 border-l-4 border-ink bg-line px-4 py-3"
    >
      <p>
        <strong>Review note · purpose:</strong> {purpose}
      </p>
      {needed && needed.length > 0 && (
        <p className="mt-1">
          <strong>Content needed:</strong> {needed.join(" ")}
        </p>
      )}
      {awaiting && awaiting.length > 0 && (
        <p className="mt-1">
          <strong>Awaiting approval:</strong> {awaiting.join(" ")}
        </p>
      )}
    </aside>
  );
}
