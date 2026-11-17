import type { VerticalId } from "@/config/site";

/**
 * Data for the scroll-driven visual story (components/story/visual-story.tsx).
 *
 * Images are the Adinn campaign artwork scenes published on adinn.com (see
 * IMAGE-SOURCES.md). Each shows the Adinn logo on a flat white panel, which is
 * what makes the match cuts possible: at every cut, the outgoing and incoming
 * scenes are aligned so the same artwork sits in the same on-screen window.
 *
 * Geometry is expressed as fractions so it survives resizing:
 * - Rect: a region of a scene. `cx`/`cy` is its centre and `w` its width, as
 *   fractions of the image. At a cut the rect's width spans the whole viewport.
 * - Cam: camera state. `cx`/`cy` is the image point held at the viewport centre
 *   and `s` the scale relative to the "cover" fit of the image.
 * - Focal: where on screen (fractions of the stage) the rect's centre sits at a
 *   cut. Both sides of a cut share it, so the artwork does not move.
 */
export type Rect = { cx: number; cy: number; w: number };
export type Cam = { s: number; cx: number; cy: number };
export type Pt = [number, number];
/** Four corners, clockwise from top-left, as fractions of the image. */
export type Quad = [Pt, Pt, Pt, Pt];
export type Focal = { x: number; y: number };

export const DEFAULT_FOCAL: Focal = { x: 0.5, y: 0.5 };

export type Scene = {
  id: VerticalId;
  /** File stem in public/story: `${file}-1200.webp` and `${file}-2800.webp`. */
  file: string;
  alt: string;
  /** Intrinsic size ratio of the source (all files are 6000x5000). */
  iw: number;
  ih: number;
  /** Region held on screen when this scene is entered. */
  inRect: Rect;
  /** Region held on screen when this scene is left. */
  outRect: Rect;
  /** Framing once the scene has settled. */
  est: Cam;
  /** Slow drift while the text is read. */
  hold: Cam;
  /**
   * How this scene hands over to the next one.
   * - led: the camera travels into the LED screen, which already shows the next scene.
   * - face: the camera squares up to the billboard face, whose artwork continues in the next scene.
   * - bridge: short match dissolve between aligned regions (no spatial connection yet).
   * - dissolve: into the closing scene.
   */
  next: "led" | "face" | "bridge" | "dissolve";
  /** Where the artwork sits on screen at the cut to the next scene. */
  focal?: Focal;
};

const dims = { iw: 6000, ih: 5000 };

/**
 * Story order follows the brief. Where both sides of a cut show the logo, the
 * rects are sized so the logo has the same width inside the window on both
 * sides (a true match cut). Where they do not, regions are chosen to align
 * comparable surfaces instead (glass entrance, display panel, printed pieces).
 */
export const scenes: Scene[] = [
  {
    id: "roadshows",
    file: "roadshow",
    alt: "An Adinn mobile LED vehicle showing the Adinn logo on a city street at dusk while people wait beside it",
    ...dims,
    inRect: { cx: 0.437, cy: 0.474, w: 0.4 },
    outRect: { cx: 0.437, cy: 0.474, w: 0.4 },
    est: { s: 1, cx: 0.5, cy: 0.52 },
    hold: { s: 1.08, cx: 0.47, cy: 0.5 },
    next: "led",
    focal: { x: 0.5, y: 0.46 },
  },
  {
    id: "outdoor",
    file: "outdoor",
    alt: "A large roadside billboard on a steel pole showing the Adinn logo, above a palm-lined road",
    ...dims,
    inRect: { cx: 0.508, cy: 0.216, w: 0.707 },
    outRect: { cx: 0.508, cy: 0.216, w: 0.54 },
    est: { s: 1, cx: 0.5, cy: 0.34 },
    hold: { s: 1.06, cx: 0.52, cy: 0.34 },
    next: "face",
    focal: { x: 0.5, y: 0.38 },
  },
  {
    id: "signage",
    file: "signage",
    alt: "A shopfront with a large illuminated Adinn sign above a glass entrance, with scooters and an autorickshaw outside",
    ...dims,
    inRect: { cx: 0.491, cy: 0.195, w: 0.8 },
    outRect: { cx: 0.49, cy: 0.645, w: 0.55 },
    est: { s: 1, cx: 0.5, cy: 0.37 },
    hold: { s: 1.06, cx: 0.5, cy: 0.37 },
    next: "bridge",
  },
  {
    id: "fixtures",
    file: "fixtures",
    alt: "Inside a bright retail store with wooden shelving, a glass display counter and an Adinn-branded display panel",
    ...dims,
    inRect: { cx: 0.6, cy: 0.45, w: 0.5 },
    outRect: { cx: 0.55, cy: 0.66, w: 0.5 },
    est: { s: 1, cx: 0.5, cy: 0.5 },
    hold: { s: 1.08, cx: 0.46, cy: 0.52 },
    next: "bridge",
  },
  {
    id: "printing",
    file: "printing",
    alt: "A retail display with a lit poster panel and printed brochures and offer cards on a white counter",
    ...dims,
    inRect: { cx: 0.575, cy: 0.375, w: 0.4 },
    outRect: { cx: 0.62, cy: 0.77, w: 0.5 },
    est: { s: 1, cx: 0.5, cy: 0.55 },
    hold: { s: 1.08, cx: 0.53, cy: 0.58 },
    next: "bridge",
    focal: { x: 0.5, y: 0.38 },
  },
  {
    id: "events",
    file: "events",
    alt: "An event hall with a stage and large LED backdrop showing the Adinn logo, with staff and guests on the floor",
    ...dims,
    inRect: { cx: 0.495, cy: 0.196, w: 0.618 },
    outRect: { cx: 0.495, cy: 0.196, w: 0.618 },
    est: { s: 1, cx: 0.5, cy: 0.4 },
    hold: { s: 1.05, cx: 0.5, cy: 0.42 },
    next: "bridge",
  },
  {
    id: "wall",
    file: "wall",
    alt: "A white painted wall beside a street carrying a blue headline and the Adinn logo",
    ...dims,
    inRect: { cx: 0.545, cy: 0.515, w: 0.573 },
    outRect: { cx: 0.545, cy: 0.515, w: 0.573 },
    est: { s: 1, cx: 0.5, cy: 0.5 },
    hold: { s: 1.06, cx: 0.52, cy: 0.48 },
    next: "bridge",
  },
  {
    id: "digital",
    file: "digital",
    alt: "A desk with a laptop, tablet and large monitor, the laptop and tablet showing the Adinn logo",
    ...dims,
    inRect: { cx: 0.233, cy: 0.694, w: 0.367 },
    outRect: { cx: 0.233, cy: 0.694, w: 0.367 },
    est: { s: 1, cx: 0.45, cy: 0.56 },
    hold: { s: 1.06, cx: 0.47, cy: 0.58 },
    next: "dissolve",
  },
];

/** Index of the closing scene (built from markup, not an image). */
export const CLOSING_INDEX = scenes.length;

export const closing = {
  title: "Every touchpoint, one company",
  text: "Outdoor, roadshows, events, stores, print, walls and digital, planned together.",
};

/**
 * Spatially connected journey: Roadshow -> Outdoor -> Signage.
 *
 * led: the roadshow vehicle's LED surface (quad measured on roadshow-2800.webp)
 * shows a square crop of the outdoor scene, projected onto the screen corners.
 * The camera squares up to the screen and that crop fills the viewport; the
 * outdoor scene then takes over with the same pixels at the same scale and pulls
 * back, so nothing is swapped or faded.
 *
 * face: the billboard face (quad measured on outdoor-2800.webp) is squared up and
 * enlarged until it fills the viewport. The Adinn artwork on it continues as the
 * storefront sign (same logo, same size), then the camera pulls back to reveal
 * the shopfront.
 */
export const journey = {
  led: {
    quad: [
      [0.315, 0.3276],
      [0.5564, 0.331],
      [0.5571, 0.6166],
      [0.3136, 0.6192],
    ] as Quad,
    /** Square (in pixels) crop of the outdoor image shown on the LED. */
    crop: { x: 0.12, y: 0.0, w: 0.75 },
    /** Image y held at the viewport centre when the outdoor scene takes over. */
    handoffCy: 0.25,
  },
  face: {
    quad: [
      [0.287, 0.123],
      [0.736, 0.06],
      [0.736, 0.316],
      [0.287, 0.363],
    ] as Quad,
    /** Width / height of the physical face. */
    aspect: 2.0,
    /** The face is enlarged to this multiple of the viewport width. */
    overscan: 1.06,
    /** Logo width as a fraction of the face width. */
    logoFrac: 0.67,
    /** Where the same logo sits in the storefront image, and its width. */
    signLogo: { cx: 0.491, cy: 0.195, w: 0.425 },
    /** Screen height (fraction) at which the sign logo is held, to sit where the billboard logo was. */
    signFy: 0.53,
  },
};
