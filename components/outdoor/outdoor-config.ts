/**
 * Typed configuration for the Roadshow -> Outdoor / OOH chapters.
 * Everything that depends on the supplied artwork lives here. See ASSETS.md.
 *
 * All coordinates are PIXELS ON THE SHARED AERIAL CANVAS (canvas.w x canvas.h),
 * except `truck`, which uses the truck image's own pixel grid.
 */
export type Px = [number, number];

export const OOH = {
  /** Every aerial layer has exactly these pixel dimensions (shared canvas). */
  canvas: { w: 1672, h: 941 },

  /** Files in public/outdoor/aerial/ (all on the shared canvas). */
  layers: {
    background: "/outdoor/aerial/background.webp",
    structure: "/outdoor/aerial/hoarding-structure.webp",
    /**
     * Cloud groups, drawn back to front. DERIVED from the single supplied cloud
     * image by a transmittance-preserving soft split around its opening (see
     * ASSETS.md); replace with independently photographed groups when available.
     */
    clouds: {
      mist: "/outdoor/aerial/clouds-mist.webp",
      lower: "/outdoor/aerial/clouds-lower.webp",
      left: "/outdoor/aerial/clouds-left.webp",
      right: "/outdoor/aerial/clouds-right.webp",
    },
  },

  /**
   * Roadshow world: the supplied 1672x941 truck, left crowd and right crowd share this
   * canvas (full-canvas PNG placement preserved). Coordinates are in these pixels.
   */
  truck: {
    src: "/outdoor/roadshow/truck.webp",
    w: 1672,
    h: 941,
    /** LED panel corners on the truck image, clockwise from top-left. Measured. */
    led: [
      [641, 199],
      [1475, 199],
      [1475, 615],
      [641, 615],
    ] as [Px, Px, Px, Px],
  },

  /**
   * Roadshow scene, viewed from behind the audience. One shared coordinate system
   * (the 1672x941 canvas, with overscan). Depth, far to near: plaza (horizon) -> truck
   * -> audience. Measured on the transparent PNGs' visible content: crowd spans
   * x 10-1650 (feet ~y 935), truck body x 126-1504, wheels' ground line y 858.
   */
  scene: {
    /** Supplied road photo (1672x941), drawn with ~5% overscan so the dolly never shows an edge. Road edge at y~530, paved foreground below. */
    plaza: { src: "/story-assets/roadshow-street.webp", x: -40, y: -20, w: 1752, h: 986 },
    /** Truck: scale (about 45% of scene width), LED centre placed on the audience's viewing axis. */
    /** Real-world ratio: truck ~3.2m, adults ~1.65m; people nearer the camera than the tyre line are scaled by their depth below the horizon (y~500). */
    truck: { scale: 0.50, ledCx: 857, groundY: 720 },
    /** Opening camera: scene point at the screen centre (scale = viewport width / canvas width). */
    startCx: 836,
    startCy: 510,
    /** How strongly each depth group follows the camera zoom (1 = rigid with the truck). */
    depth: { plaza: 0.55, truck: 1, crowd: 1.55 },
  },
  /**
   * Audience (second supplied set). Two layers on the shared canvas that together form one loose
   * crowd (the supplied full-crowd image is reference only and is not rendered). Scaled about the
   * feet line and lowered so the whole figures sit in the lower foreground, heads just below the LED.
   */
  crowds: {
    left: { src: "/outdoor/roadshow/crowd-d-left.webp", dx: -150, dy: -2, scale: 0.45    },
    right: { src: "/outdoor/roadshow/crowd-d-right.webp", dx: 200, dy: -5, scale: 0.45 },
    ax: 836,
    ay: 940,
  },
  /** Tyre contact (truck-image px): the lowest visible tyre pixels are at y = 857 for both tyres. */
  tyres: { y: 857, front: { cx: 328, w: 150 }, rear: { cx: 1127, w: 140 } },
  /**
   * Rolling wheels (transparent tyre + rim discs) laid exactly over the wheels baked into the truck
   * image so they can turn with the distance driven. d = visible tyre diameter in truck px.
   */
  wheels: {
    front: { src: "/outdoor/roadshow/wheel-front.webp", cx: 327, d: 148, fill: 0.914 },
    rear: { src: "/outdoor/roadshow/wheel-rear.webp", cx: 1127, d: 144, fill: 0.906 },
  },
  /** Truck arrival: it rolls in along the near lane of the road (about 90% of its parked size, so it never visibly swells), drifting gently toward its parking spot over the whole drive. */
  arrival: { laneY: 640, startScale: 0.9 },

  /**
   * The part of the aerial canvas shown on the LED screen (same 2:1 aspect as the
   * panel). When the screen fills the viewport this is exactly what is on screen,
   * and the aerial chapter continues from the identical pixels.
   */
  ledRegion: { x: 0, y: 60, w: 1672, h: 836 },

  /** Pole base on the ground (hoarding-structure.webp plinth, bottom centre). */
  base: [1176, 706] as Px,

  /**
   * Advertising-face corners on the canvas, clockwise from top-left. Measured by
   * line-fitting the edges of the plain face of hoarding-structure.webp, inset ~1.5px.
   */
  faceQuad: [
    [1041.5, 433.5],
    [1289, 440.5],
    [1288.5, 567.5],
    [1041.5, 545.5],
  ] as [Px, Px, Px, Px],

  /** Artwork authoring size (px); same aspect as the face. */
  artwork: { w: 2000, h: 970, logo: "/Adinn.png", line1: "Think Big.", line2: "Think Different." },

  /** Centre of the cloud opening (canvas px); clouds scale about it. */
  opening: [1090, 500] as Px,

  /** Camera: canvas point held at a screen point (fractions of the stage). */
  camera: {
    /** Final framing on the hoarding. `zoom` is relative to the handoff scale. */
    focus: { cx: 1165, cy: 505, fx: 0.63, fy: 0.5, zoom: 1.7 },
    /** Gentle forward approach while clouds are still in place. */
    enterZoom: 1.25,
  },

  /** Desktop and mobile focal points (canvas px) for the static layout. */
  desktopFocus: [1100, 470] as Px,
  mobileFocus: [1165, 500] as Px,

  motion: {
    /** Pinned scroll distance in viewport (stage) heights. */
    scrollVh: 8.4,
    /** Share of the scroll used by the intro (empty road, truck arrives, audience gathers). */
    introEnd: 0.3,
    /** Scene px the truck starts to the left of its parked spot, and the crowds start outward. */
    driveIn: 2300,
    gatherIn: 260,
    /** ScrollTrigger scrub smoothing, seconds. */
    scrub: 0.5,
    /** Progress breakpoints (0-1). */
    t: {
      truckHold: 0.12,
      approachEnd: 0.34, // screen fills the viewport; aerial takes over
      enterEnd: 0.5,
      clearStart: 0.46,
      clearEnd: 0.84,
      focusStart: 0.78,
      focusEnd: 0.97,
    },
    /** Extra scale cloud groups gain while clearing, on top of the camera (nearer = faster). */
    cloudScale: { left: 1.22, right: 1.22, lower: 1.18, mist: 1.08 },
    /** How far each group travels, as a fraction of the canvas. */
    cloudTravel: { left: -0.82, right: 0.82, lower: 1.0, mist: -0.06 },
    /** Staggered clearing windows (progress), overlapping. */
    cloudWindow: {
      left: [0.46, 0.7] as [number, number],
      right: [0.5, 0.74] as [number, number],
      lower: [0.54, 0.8] as [number, number],
      mist: [0.62, 0.86] as [number, number],
    },
  },
} as const;

export const OOH_COPY = {
  roadshowAlt:
    "An LED roadshow vehicle in side view; its screen shows an aerial view of a city boulevard with a hoarding",
  outdoorAlt:
    "An elevated view of a landscaped Indian boulevard with a unipole hoarding standing in the greenery",
  heading: "Be seen where the city moves.",
  support: "Bring your brand into the streets, routes and everyday journeys of your audience.",
  approach: "The right location gives your message a place in everyday life.",
  closing: "Let’s find the right place for your brand.",
  cta: "Discuss Your Outdoor Campaign",
} as const;
