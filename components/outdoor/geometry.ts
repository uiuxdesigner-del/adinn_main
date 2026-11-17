export type P2 = { x: number; y: number };

/** 3x3 homography (h9 = 1) mapping four source points onto four targets. */
export function solveHomography(src: P2[], dst: P2[]): number[] {
  const A: number[][] = [];
  for (let k = 0; k < 4; k++) {
    const { x, y } = src[k];
    const { x: X, y: Y } = dst[k];
    A.push([x, y, 1, 0, 0, 0, -X * x, -X * y, X]);
    A.push([0, 0, 0, x, y, 1, -Y * x, -Y * y, Y]);
  }
  for (let c = 0; c < 8; c++) {
    let piv = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    [A[c], A[piv]] = [A[piv], A[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k < 9; k++) A[r][k] -= f * A[c][k];
    }
  }
  return A.map((row, i) => row[8] / row[i]);
}

export const matrix3d = (h: number[]) =>
  `matrix3d(${h[0]},${h[3]},0,${h[6]},${h[1]},${h[4]},0,${h[7]},0,0,1,0,${h[2]},${h[5]},0,1)`;
