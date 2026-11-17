/**
 * Image-based shop story. ONE progress value (0..1, scrubbed by one ScrollTrigger) drives every
 * layer: camera-like pan/zoom over the photographs, door leaves, signage depth, the laptop screen,
 * the print and wall plates, and the chapter copy. No 3D: it is translation, scale, clipping and
 * planar (homography) mapping of supplied images.
 */
export const SHOP = {
  scrollVh: 10,
  R: {
    hold: 0.02,
    swap: [0.02, 0.08, 0.14], // still zoomed in: the Adinn art leaves to the left (to 0.08), then the Havells signboard enters from the right (to 0.14)
    plate: [0.15, 0.23], // the banner's surface settles into the fascia while the view zooms out (after the swap)
    depth: [0.04, 0.16], // signage edge depth
    door: [0.29, 0.38], // leaves slide apart while the approach is slow
    unclip: 0.42, // the doorway frame has left the view: the interior simply continues
    digital: [0.56, 0.73], // screen composition plays, resolves into the artwork
    grow: [0.64, 0.72], // screen plate grows from the laptop to full screen
    print: [0.735, 0.74], // swap to the print plate (artwork identical)
    reveal: [0.74, 0.8], // pull back from the page artwork to the full print scene
    approach: [0.85, 0.885], // back into the printed artwork
    wall: [0.885, 0.97], // wall plate: artwork fills the view, then pulls back
  },
  copy: {
    signage: [0.19, 0.22, 0.26, 0.29],
    fixtures: [0.47, 0.5, 0.55, 0.58],
    digital: [0.57, 0.6, 0.67, 0.7],
    printing: [0.77, 0.79, 0.83, 0.855],
    wall: [0.93, 0.95, 1.1, 1.2],
  },
} as const;

export const SHOP_COPY = [
  {
    id: "signage",
    service: "signage",
    label: "03 Signage",
    heading: "Make your presence unmistakable.",
    body: "Give your business a distinctive identity with signage designed for your space and built for visibility.",
    cta: "Discuss Your Signage",
  },
  {
    id: "fixtures",
    service: "fixtures",
    label: "04 Fixtures",
    heading: "Turn your space into a brand experience.",
    body: "Bring products into focus with custom fixtures, displays and retail environments.",
    cta: "Discuss Your Retail Space",
  },
  {
    id: "digital",
    service: "digital",
    label: "05 Digital Marketing",
    heading: "Turn attention into action.",
    body: "Connect content, search, media and websites to generate enquiries and support business growth.",
    cta: "Discuss Digital Marketing",
  },
  {
    id: "printing",
    service: "printing",
    label: "06 Printing & POP",
    heading: "Put your brand in their hands.",
    body: "Carry your message through print, packaging and point-of-purchase materials that support purchase decisions.",
    cta: "Discuss Printing & POP",
  },
  {
    id: "wall",
    service: "wall",
    label: "07 Wall Advertising",
    heading: "Become part of the everyday landscape.",
    body: "Build local visibility with wall advertising planned for the places your audience lives and travels.",
    cta: "Discuss Wall Advertising",
  },
] as const;

export function chapterAt(p: number): string {
  const c = SHOP.copy;
  if (p < c.fixtures[0] - 0.02) return "03 Signage";
  if (p < c.digital[0] - 0.02) return "04 Fixtures";
  if (p < c.printing[0] - 0.04) return "05 Digital Marketing";
  if (p < c.wall[0] - 0.04) return "06 Printing & POP";
  return "07 Wall Advertising";
}

/** Everything below is measured on the supplied 1672x941 images. */
export const IMG = { w: 1672, h: 941 };
export const FILES = {
  storefront: "/shop/signage-storefront.webp",
  interior: "/shop/interior-matched.webp",
  doorL: "/shop/door-left.webp",
  doorR: "/shop/door-right.webp",
  printing: "/shop/printing-pop.webp",
  wall: "/shop/wall.webp",
  tvStill: "/shop/digital-tv.webp",
  logo: "/Adinn.png",
  board: "/shop/havells-signboard.webp",
} as const;

/** Storefront: the white fascia and the clear inner doorway (steel inner edge, threshold line). */
/** The supplied Havells signboard photo (2170x725), fitted into the fascia with its aspect ratio kept. */
export const BOARD = { aspect: 2170 / 725, heightFrac: 0.5 };

export const FRONT = {
  fascia: { x: 203, y: 47, w: 1331, h: 213 },
  aperture: { x: 366, y: 291, w: 996, h: 537 },
  /** door leaves keep their natural proportion (878x1240 / 870x1235) at the aperture height. */
  doorW: 380,
};

/**
 * The interior photograph placed in storefront coordinates: found by correlating the doorway view
 * with the interior image (scale 1.3 interior px per storefront px; offset in interior px).
 */
/** The fixtures photograph, centred on the doorway aperture at 1.3x the aperture's scale. */
export const interiorPlace = {
  x: FRONT.aperture.x + (FRONT.aperture.w - IMG.w / 1.3) / 2,
  y: FRONT.aperture.y + (FRONT.aperture.h - IMG.h / 1.3) / 2,
  w: IMG.w / 1.3,
  h: IMG.h / 1.3,
};

/** TV screen inner corners in the interior image (interior px), clockwise from top-left. */
export const LAPTOP_SCREEN: [number, number][] = [
  [737, 461],
  [808, 461],
  [808, 501],
  [737, 501],
];

/** Printed booklet: right page corners and the artwork's rectangle on that page (unit coords). */
export const BOOK = {
  page: [
    [660, 478],
    [1118, 432],
    [1330, 745],
    [755, 815],
  ] as [number, number][],
  art: { u0: 0.08, u1: 0.92, v0: 0.1, v1: 0.49 },
};

/** Street wall plane corners on wall.webp, and the artwork's rectangle on it (unit coords). */
export const WALL = {
  quad: [
    [35, 103],
    [1360, 256],
    [1360, 655],
    [35, 836],
  ] as [number, number][],
  art: { u0: 0.4, u1: 0.86, v0: 0.12, v1: 0.78 },
};
