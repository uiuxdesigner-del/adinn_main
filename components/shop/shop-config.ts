/**
 * Image-based shop story. ONE progress value (0..1, scrubbed by one ScrollTrigger) drives every
 * layer: camera-like pan/zoom over the photographs, door leaves, signage depth, the laptop screen,
 * the print and wall plates, and the chapter copy. No 3D: it is translation, scale, clipping and
 * planar (homography) mapping of supplied images.
 */
export const SHOP = {
  scrollVh: 12, // was 10: more scroll distance for the Printing & POP and Wall chapters (the earlier chapters keep their share, so they are 20% slower too)
  R: {
    hold: 0.02,
    swap: [0.02, 0.08, 0.14], // still zoomed in: the Adinn art leaves to the left (to 0.08), then the Havells signboard enters from the right (to 0.14)
    plate: [0.15, 0.23], // the banner's surface settles into the fascia while the view zooms out (after the swap)
    depth: [0.04, 0.16], // signage edge depth
    door: [0.27, 0.36], // leaves slide apart while the approach is slow
    digital: [0.63, 0.70], // the screen composition plays once the camera has filled the display with the TV
    cardLift: [0.7, 0.735], // then only the card comes out of the TV and zooms (hands off to the print scene)
    print: [0.735, 0.74], // swap to the print plate (artwork identical)
    reveal: [0.74, 0.82], // pull back from the page artwork to the full print scene
    approach: [0.87, 0.925], // back into the printed artwork
    wall: [0.925, 0.99], // wall plate: artwork fills the view, then pulls back
  },
  copy: {
    signage: [0.19, 0.22, 0.26, 0.29],
    fixtures: [0.43, 0.46, 0.5, 0.53],
    digital: [0.53, 0.55, 0.57, 0.595], // clears before the white screen reaches the copy (no dark backing behind it any more)
    printing: [0.775, 0.8, 0.845, 0.87],
    wall: [0.955, 0.975, 1.1, 1.2],
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
  storefront: "/shop/signage-storefront.webp", // original 1672x941 photo (static no-JS fallback only)
  storefrontWide: "/shop/storefront-wide.webp", // extended exterior (1851x849), registered into the 1672x941 world by BG below
  interior: "/shop/interior-hd.webp", // 2x Lanczos + light sharpen of interior-matched.webp (same framing), so the close approach to the TV is less soft
  doorL: "/shop/door-left.webp",
  doorR: "/shop/door-right.webp",
  printing: "/shop/printing-pop-wide.webp", // wide retail long-shot (1774x887) with the central red POP display
  wall: "/shop/wall-road.webp", // blank roadside wall (1672x941)
  tvStill: "/shop/digital-tv.webp",
  logo: "/Adinn-hd.png", // 4x resampled + sharpened copy of Adinn.png (516x201): the banner/fascia/card art magnifies the logo, so the small file looked soft
  board: "/shop/havells-signboard.webp",
} as const;

/** Storefront: the white fascia and the clear inner doorway (steel inner edge, threshold line). */
/** The supplied Havells signboard photo (2170x725), fitted into the fascia with its aspect ratio kept. */
export const BOARD = { aspect: 2170 / 725, heightFrac: 0.8 };
/** The generated sign-board panel on the fascia: its inset from the fascia edges (fractions of the fascia width / height). */
export const BOARD_PANEL = { inset: 0.03, insetY: 0.1 };

/**
 * The extended exterior background placed in storefront (IMG) coordinates. Registered against the original photo by
 * normalised gradient cross-correlation of the unchanged exterior (marble piers, fascia edges, threshold, pavement; doorway and
 * sign interiors masked): one uniform scale 1.158 (sign width 1334 -> 1152 px: 1.158) and offset (-237, 0). The image's
 * left/top edges sit at x = -237, y = 0 in world units; it reaches x = 1906.5 and y = 983. Doors, interior and sign keep IMG coordinates.
 */
export const BG_SRC = { w: 1851, h: 849 };
export const BG = { s: 1.158, x: -237, y: 0, w: 1851 * 1.158, h: 849 * 1.158 };

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

/** TV inner screen corners in interior-matched.webp (1672x941), bezel excluded (measured: black panel 737-807 x 461-500), clockwise from top-left. */
export const LAPTOP_SCREEN: [number, number][] = [
  [739, 463],
  [806, 463],
  [806, 499],
  [739, 499],
];

/**
 * Printing & POP scene: the supplied supermarket photograph (public/shop/printing-pop.webp, 3:2, upscaled 2x from the
 * 900x600 original). Its own size, not IMG's.
 */
export const PRINT_IMG = { w: 1774, h: 887 };
/** Centre of the red "Everyday Essentials" POP display (header to base: x 765-1025, y 265-672 on PRINT_IMG). The pulled-back reading view is centred on it. */
export const PRINT_FOCUS = { x: 895, y: 468 };

/**
 * The POP display: the large front-left face of the red cardboard bin, as its four photographed corners
 * (PRINT_IMG px, clockwise from top-left), and the campaign artwork's rectangle on that face (unit coords).
 */
export const BOOK = {
  // The blank beige print panel on the checkout counter front (PRINT_IMG px, clockwise from top-left). The campaign artwork
  // lands on it, so the red POP display itself stays untouched and fully visible.
  // Measured on the full-resolution 1774x887 photo: the panel's outer edge pixels including its 1px bevel rim, so the card
  // covers the whole panel (no beige rim showing) without touching the wood, countertop or metal base.
  page: [
    [1116.5, 520],
    [1514.5, 519],
    [1513, 642.5],
    [1115.8, 644.5],
  ] as [number, number][],
  art: { u0: 0, u1: 1, v0: 0, v1: 1 }, // the card fills the panel edge to edge
};

/** Street wall plane corners on wall.webp, and the artwork's rectangle on it (unit coords). */
export const WALL = {
  // The cream wall face above the black plinth, measured on wall-road.webp (1672x941), clockwise from top-left.
  quad: [
    [138, 258],
    [1383, 306],
    [1383, 493],
    [140, 543],
  ] as [number, number][],
  // The painted campaign: a wide composition on the cream face with equal margins (28px on the 1245x236 plane) to every edge.
  art: { u0: 0.0227, u1: 0.9773, v0: 0.12, v1: 0.88 },
};
