/**
 * Deliberate cursor-shake detection from recent pointer history, in any direction.
 *
 * Pure and framework-free: feed it (time, x, y) samples measured relative to the panel; it returns
 * a result only when the recent path is a real back-and-forth shake. All state is in closure arrays, so
 * calling `push` on every pointermove causes no React work.
 */
export type ShakeConfig = {
  windowMs: number;
  /** Minimum extent along the stronger axis inside the window, CSS px. */
  minExcursion: number;
  minReversals: number;
  /** A direction change only counts after this much travel the other way, CSS px. */
  minSegment: number;
  /** Minimum accumulated path length inside the window, CSS px. */
  minTravel: number;
  /** Minimum average pointer speed across the window, px/s. */
  minSpeed: number;
  /** Window span needed before a result is possible, ms. */
  minSpanMs: number;
  /** Movement must still be happening now: speed over the last `recentMs`, px/s. */
  recentMs: number;
  minRecentSpeed: number;
  /** Change interval at slow-qualifying and fast shaking, ms (never below `capMs`). */
  slowIntervalMs: number;
  fastIntervalMs: number;
  slowSpeed: number;
  fastSpeed: number;
  /** Hard cap: at most four changes per second. */
  capMs: number;
};

export const DEFAULT_SHAKE: ShakeConfig = {
  windowMs: 450,
  minExcursion: 70,
  minReversals: 2,
  minSegment: 20,
  minTravel: 160,
  minSpeed: 520,
  minSpanMs: 160,
  recentMs: 200,
  minRecentSpeed: 380,
  slowIntervalMs: 800,
  fastIntervalMs: 270,
  slowSpeed: 600,
  fastSpeed: 2000,
  capMs: 250,
};

export type ShakeResult = { speed: number; intervalMs: number; reversals: number };

/** Number of direction reversals in a series, ignoring back-swings shorter than `minSegment`. */
function turns(v: number[], minSegment: number): number {
  let dir = 0;
  let ext = v[0];
  let count = 0;
  for (let i = 1; i < v.length; i++) {
    const x = v[i];
    if (dir === 0) {
      if (Math.abs(x - ext) >= minSegment) {
        dir = x > ext ? 1 : -1;
        ext = x;
      }
    } else if (dir > 0) {
      if (x > ext) ext = x;
      else if (ext - x >= minSegment) {
        count++;
        dir = -1;
        ext = x;
      }
    } else if (x < ext) ext = x;
    else if (x - ext >= minSegment) {
      count++;
      dir = 1;
      ext = x;
    }
  }
  return count;
}

function extent(v: number[]): number {
  let lo = v[0];
  let hi = v[0];
  for (const x of v) {
    if (x < lo) lo = x;
    if (x > hi) hi = x;
  }
  return hi - lo;
}

export function createShakeDetector(config: Partial<ShakeConfig> = {}) {
  const c = { ...DEFAULT_SHAKE, ...config };
  let ts: number[] = [];
  let xs: number[] = [];
  let ys: number[] = [];

  function reset() {
    ts = [];
    xs = [];
    ys = [];
  }

  function push(t: number, x: number, y: number): ShakeResult | null {
    // A clock that goes backwards means a stale history: start again.
    if (ts.length && t < ts[ts.length - 1]) reset();
    ts.push(t);
    xs.push(x);
    ys.push(y);
    let drop = 0;
    while (drop < ts.length - 1 && t - ts[drop] > c.windowMs) drop++;
    if (drop) {
      ts = ts.slice(drop);
      xs = xs.slice(drop);
      ys = ys.slice(drop);
    }
    const n = ts.length;
    if (n < 4) return null;
    const span = ts[n - 1] - ts[0];
    if (span < c.minSpanMs) return null;

    // Direction-agnostic: left-right, up-down, diagonal and circular shaking all count. Each axis is
    // analysed on its own and the stronger one decides.
    const recentCut = ts[n - 1] - c.recentMs;
    let recentStart = ts[n - 1];
    let travel = 0;
    let recentTravel = 0;
    for (let i = 1; i < n; i++) {
      const step = Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
      travel += step;
      if (ts[i] >= recentCut) {
        recentTravel += step;
        if (ts[i - 1] < recentStart) recentStart = ts[i - 1];
      }
    }
    const rx = turns(xs, c.minSegment);
    const ry = turns(ys, c.minSegment);
    const reversals = Math.max(rx, ry);
    const excursion = Math.max(extent(xs), extent(ys));

    if (reversals < c.minReversals) return null;
    if (excursion < c.minExcursion) return null;
    if (travel < c.minTravel) return null;
    const speed = (travel / span) * 1000;
    if (speed < c.minSpeed) return null;
    const recentSpan = Math.max(ts[n - 1] - recentStart, 16);
    if ((recentTravel / recentSpan) * 1000 < c.minRecentSpeed) return null;

    const k = Math.min(1, Math.max(0, (speed - c.slowSpeed) / (c.fastSpeed - c.slowSpeed)));
    const intervalMs = Math.max(c.capMs, c.slowIntervalMs + (c.fastIntervalMs - c.slowIntervalMs) * k);
    return { speed, intervalMs, reversals };
  }

  return { push, reset };
}
