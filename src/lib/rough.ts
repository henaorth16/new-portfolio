// Tiny helpers that generate wobbly, "drawn by hand" SVG paths.
// Seeded so the same box always gets the same wobble (no flicker on re-render).

function mulberry32(a: number): () => number {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const f = (n: number): number => Math.round(n * 10) / 10

export interface RoughRectOptions {
  wobble?: number
  overshoot?: number
}

/** Four chalk strokes that slightly overshoot at the corners, like a real hand-drawn box. */
export function roughRectPath(
  w: number,
  h: number,
  seed = 1,
  { wobble = 1.5, overshoot = 5 }: RoughRectOptions = {},
): string {
  if (!w || !h) return ''
  const r = mulberry32(seed)
  const j = (n = wobble) => (r() - 0.5) * 2 * n
  const o = () => r() * overshoot
  const p = 2
  const line = (x1: number, y1: number, x2: number, y2: number): string => {
    const dx = x2 - x1
    const dy = y2 - y1
    const len = Math.hypot(dx, dy)
    if (len < 60) {
      const mx = (x1 + x2) / 2 + j(wobble * 1.5)
      const my = (y1 + y2) / 2 + j(wobble * 1.5)
      return `M${f(x1 + j())} ${f(y1 + j())} Q${f(mx)} ${f(my)} ${f(x2 + j())} ${f(y2 + j())}`
    }
    // Subdivide into natural organic hand-drawn curves
    const midX = (x1 + x2) / 2 + j(wobble * 1.3)
    const midY = (y1 + y2) / 2 + j(wobble * 1.3)
    const c1x = x1 + dx * 0.25 + j(wobble * 1.6)
    const c1y = y1 + dy * 0.25 + j(wobble * 1.6)
    const c2x = x1 + dx * 0.75 + j(wobble * 1.6)
    const c2y = y1 + dy * 0.75 + j(wobble * 1.6)
    return `M${f(x1 + j())} ${f(y1 + j())} Q${f(c1x)} ${f(c1y)} ${f(midX)} ${f(midY)} Q${f(c2x)} ${f(c2y)} ${f(x2 + j())} ${f(y2 + j())}`
  }
  return [
    line(p - o(), p, w - p + o(), p),
    line(w - p, p - o(), w - p, h - p + o()),
    line(w - p + o(), h - p, p - o(), h - p),
    line(p, h - p + o(), p, p - o()),
  ].join(' ')
}
