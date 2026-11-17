/**
 * Roadshow audience arrival (image-based 2D walk, no 3D, no video).
 *
 * Two people from the supplied audience photograph (a: blue shirt, b: cream shirt) are prepared as
 * separate transparent layers (torso, and per leg: thigh, shank, shoe; see
 * scripts/prepare-audience-walkers.py) and walk up from the lower foreground to their original
 * spot. The rest of the audience (crowd-d-right-rest) stands still from the opening.
 *
 * Gait (all driven by ONE number, the distance walked, so feet never step faster than the body
 * travels): each leg alternates a planted stance and a swing. During stance the foot moves back
 * relative to the body at exactly the body's speed, so it stays fixed on the ground. The swing
 * carries the foot forward with a small lift. Joints: hip (pelvis pivot), knee (thigh/shank
 * split) and ankle (shank/shoe split); the leg parts foreshorten vertically as the foot moves
 * along the ground, as a person walking away from the camera does. The last step is half length,
 * the trailing foot closes up, and both feet end planted in the stationary pose.
 *
 * Switch: enableAudienceArrivalAnimation. false = the original stationary audience (nothing here
 * runs). To remove the feature: set it false, or delete this file, audience-walkers.manifest.ts,
 * public/outdoor/roadshow/walkers/ and the crowd-d-right-rest image, and drop the few marked lines
 * in outdoor-story.tsx.
 */
import { WALKER_ASSETS, WALKER_RESTCROWD, type WalkerAssets } from "./audience-walkers.manifest";

/**
 * Master switch. false = original stationary audience from the opening; no arrival code runs.
 *
 * Currently OFF: the articulated 2D walk failed the quality gate when watched in the browser (feet
 * are below the frame for most of the walk, so only rigid torsos/trousers rise; when a lifted shoe
 * is visible it detaches from the trouser leg and reads as a paper puppet). Re-enable only with
 * real walking footage or a coherent frame sequence (see AUDIENCE-ARRIVAL.md).
 */
export const enableAudienceArrivalAnimation = false;

export const audienceWalkersActive = enableAudienceArrivalAnimation && Object.keys(WALKER_ASSETS).length > 0;
/** The crowd layer that has the walkers removed (used only while the feature is active). */
export const audienceRestCrowdSrc = WALKER_RESTCROWD;

type Plan = {
  id: string;
  /** Where the walker starts, relative to the settled spot (crowd-layer px; +dy = nearer the camera). */
  start: { dx: number; dy: number };
  /** Share of the arrival progress (0..1) during which this person walks (staggered starts). */
  window: [number, number];
  /** Body travel per step in crowd-layer px at the settled scale (differs a little per person). */
  step: number;
};
const PLAN: Plan[] = [
  { id: "a", start: { dx: -70, dy: 640 }, window: [0.0, 0.82], step: 66 },
  { id: "b", start: { dx: 55, dy: 700 }, window: [0.16, 1.0], step: 72 },
];

/** Perspective: people shrink as they walk away: (0.45 crowd scale) / (feet ~421px below the horizon). */
const SCALE_PER_DY = 0.45 / 421;
/** Foot lift while swinging (crowd-layer px at settled scale). */
const LIFT = 19;
/** Torso sway about the pelvis (degrees). */
const SWAY = 0.4;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);

type StepTable = { start: number[]; len: number[]; total: number };

/**
 * Step table for a path of length L. Full steps (scaled by perspective) then one closing half
 * step; all rescaled so the table ends exactly at L.
 */
function buildSteps(L: number, step: number, scaleAt: (s: number) => number): StepTable {
  const raw: number[] = [];
  let s = 0;
  for (;;) {
    const l = step * scaleAt(s + (step * scaleAt(s)) / 2);
    raw.push(l);
    if (L - s <= l * 1.5) break;
    s += l;
  }
  const sum = raw.reduce((a, b) => a + b, 0) + raw[raw.length - 1] / 2;
  const k = L / sum;
  const len = raw.map((l) => l * k);
  len.push(len[len.length - 1] / 2); // the closing half step
  const start: number[] = [];
  let acc = 0;
  for (const l of len) {
    start.push(acc);
    acc += l;
  }
  return { start, len, total: acc };
}

/** Forward offset (px, + = ahead of the body) of each foot at distance s, plus the swing fraction. */
function feetAt(table: StepTable, s: number) {
  const { start, len } = table;
  const n = len.length;
  let i = n - 1;
  while (i > 0 && start[i] > s) i--;
  const t = clamp01((s - start[i]) / len[i]);
  const last = i === n - 1; // the closing half step
  const prevFull = len[Math.max(0, i - 1)];
  // the foot that swings now lands where the next stance begins: half of the next full step, or level (0) at the end
  const nextFull = i + 1 >= n - 1 ? (i + 1 === n - 1 ? len[n - 1] * 2 : 0) : len[i + 1];
  const a = last ? len[i] : len[i] / 2; // stance foot's offset at heel strike
  const stance = a - len[i] * t; // planted: moves back exactly as far as the body travels
  const swingStart = -prevFull / 2;
  const swingEnd = last ? 0 : nextFull / 2;
  const swing = swingStart + (swingEnd - swingStart) * smooth(t);
  const lift = Math.sin(Math.PI * t);
  const stanceIsLeft = i % 2 === 0;
  return {
    left: stanceIsLeft ? stance : swing,
    right: stanceIsLeft ? swing : stance,
    liftLeft: stanceIsLeft ? 0 : lift,
    liftRight: stanceIsLeft ? lift : 0,
    cyc: (i + t) / 2,
    last,
  };
}

type Leg = { thigh: HTMLImageElement; shank: HTMLImageElement; shoe: HTMLImageElement };
type Walker = {
  plan: Plan;
  assets: WalkerAssets;
  root: HTMLDivElement;
  torso: HTMLImageElement;
  legL: Leg;
  legR: Leg;
  path: number;
  table: StepTable;
};

export type AudienceArrival = { update: (arrival: number) => void; dispose: () => void };

/** Builds the walker layers inside `host` (an empty element that shares the right crowd's transform). */
export function createAudienceArrival(host: HTMLElement): AudienceArrival {
  const walkers: Walker[] = [];
  const mk = (src: string, x: number, y: number, w: number, h: number, ox: number, oy: number) => {
    const img = new Image();
    img.decoding = "async";
    img.alt = "";
    img.draggable = false;
    img.src = src;
    Object.assign(img.style, {
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
      width: `${w}px`,
      height: `${h}px`,
      maxWidth: "none",
      transformOrigin: `${ox}px ${oy}px`,
      willChange: "transform",
    });
    return img;
  };

  for (const plan of PLAN) {
    const assets = WALKER_ASSETS[plan.id];
    if (!assets) continue;
    const { parts, joints, feet: ft } = assets;
    const root = document.createElement("div");
    Object.assign(root.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: "1672px",
      height: "941px",
      transformOrigin: `${ft.x}px ${ft.y}px`,
      willChange: "transform",
    });
    const part = (name: string, ox: number, oy: number) => {
      const p = parts[`${plan.id}-${name}`];
      return mk(p.file, p.x, p.y, p.w, p.h, ox, oy);
    };
    // pivots: thigh and torso at the pelvis cut line; shank at the knee line; the shoe is only translated
    const leg = (side: "l" | "r"): Leg => {
      const th = parts[`${plan.id}-thigh-${side}`];
      const sh = parts[`${plan.id}-shank-${side}`];
      return {
        thigh: part(`thigh-${side}`, 0, joints.hip - th.y),
        shank: part(`shank-${side}`, 0, joints.knee - joints.overlap - sh.y),
        shoe: part(`shoe-${side}`, 0, 0),
      };
    };
    const tp = parts[`${plan.id}-torso`];
    const torso = part("torso", assets.pelvisX - tp.x, joints.hip - tp.y);
    const legL = leg("l");
    const legR = leg("r");
    // stacking, back to front: legs (thigh, shank, shoe), then the torso over the hips
    for (const l of [legR, legL]) root.append(l.thigh, l.shank, l.shoe);
    root.append(torso);
    root.style.visibility = "hidden";
    host.append(root);
    const L = Math.hypot(plan.start.dx, plan.start.dy);
    const scaleAt = (s: number) => 1 + SCALE_PER_DY * plan.start.dy * (1 - s / L);
    walkers.push({ plan, assets, root, torso, legL, legR, path: L, table: buildSteps(L, plan.step, scaleAt) });
  }

  let lastKey = "";
  const update = (arrival: number) => {
    const key = arrival.toFixed(4);
    if (key === lastKey) return;
    lastKey = key;
    for (const w of walkers) {
      const { plan, assets, table } = w;
      const tau = seg(arrival, plan.window[0], plan.window[1]);
      // distance walked: eases to a stop (decelerating); the gait below is a function of distance only
      const walked = w.path * (1 - Math.pow(1 - tau, 1.35));
      const rem = 1 - walked / w.path;
      const sc = 1 + SCALE_PER_DY * plan.start.dy * rem;
      const settled = tau >= 1;
      w.root.style.visibility = "visible";
      w.root.style.transform = settled ? "none" : `translate(${plan.start.dx * rem}px, ${plan.start.dy * rem}px) scale(${sc})`;
      const f = settled
        ? { left: 0, right: 0, liftLeft: 0, liftRight: 0, cyc: 0, last: true }
        : feetAt(table, Math.min(walked, table.total - 1e-6));
      const j = assets.joints;
      const lenThigh = j.knee - j.hip;
      const lenShank = j.ankle - j.knee + j.overlap * 2;
      const apply = (leg: Leg, ahead: number, lift: number) => {
        // foot height on screen: ahead of the body = higher, lifted = higher (px at this scale -> layer px)
        const dFoot = (-ahead - lift * LIFT * sc) / sc;
        const dKnee = dFoot * 0.5;
        leg.thigh.style.transform = `scaleY(${1 + dKnee / lenThigh})`;
        leg.shank.style.transform = `translateY(${dKnee}px) scaleY(${1 + (dFoot - dKnee) / lenShank})`;
        leg.shoe.style.transform = `translateY(${dFoot}px)`;
      };
      apply(w.legL, f.left, f.liftLeft);
      apply(w.legR, f.right, f.liftRight);
      // subtle sway of the upper body about the pelvis; zero in the stationary pose
      const env = settled || f.last ? 0 : 1;
      w.torso.style.transform = `rotate(${(env * SWAY * Math.sin(2 * Math.PI * f.cyc)).toFixed(3)}deg)`;
    }
  };
  update(0);
  return {
    update,
    dispose: () => {
      for (const w of walkers) w.root.remove();
      walkers.length = 0;
    },
  };
}
