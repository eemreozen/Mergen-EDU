export type Point = [number, number]
export type Obstacle = { x: number; y: number; width: number; height: number }

// Check the whole segment, including diagonals, against an expanded node box.
export function crossesBox([ax, ay]: Point, [bx, by]: Point, box: Obstacle, padding = 12) {
  let low = 0, high = 1
  const left = box.x - padding, right = box.x + box.width + padding
  const top = box.y - padding, bottom = box.y + box.height + padding
  for (const [start, delta, min, max] of [[ax, bx - ax, left, right], [ay, by - ay, top, bottom]]) {
    if (!delta) { if (start <= min || start >= max) return false; continue }
    const a = (min - start) / delta, b = (max - start) / delta
    low = Math.max(low, Math.min(a, b)); high = Math.min(high, Math.max(a, b))
    if (low >= high) return false
  }
  return true
}

export function createRouter(obstacles: Obstacle[]) {
  const crossing = (a: Point, b: Point) => obstacles.some(box => crossesBox(a, b, box))
  return (start: Point, end: Point, preferred: Point[]): Point[] => {
    // The endpoints sit inside their own nodes; the middle route starts in
    // the column gaps, beyond both node bounds and the rounded-corner margin.
    const from: Point = [start[0] + 104, start[1]], to: Point = [end[0] - 104, end[1]]
    const middle = preferred.slice(1, -1)
    if (middle.length && middle.every((point, i) => !i || !crossing(middle[i - 1], point))) return preferred
    const xs = [...new Set([from[0], to[0], ...obstacles.flatMap(b => [b.x - 28, b.x + b.width + 28])])].sort((a,b) => a-b)
    const ys = [...new Set([from[1], to[1], ...obstacles.flatMap(b => [b.y - 28, b.y + b.height + 28])])].sort((a,b) => a-b)
    const source = ys.indexOf(from[1]) * xs.length + xs.indexOf(from[0])
    const target = ys.indexOf(to[1]) * xs.length + xs.indexOf(to[0])
    const point = (id: number): Point => [xs[id % xs.length], ys[Math.floor(id / xs.length)]]
    const distance = (a: Point, b: Point) => Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1])
    const costs = new Map([[source, 0]]), previous = new Map<number, number>()
    const open = [{ id: source, score: distance(from,to) }]
    const closed = new Set<number>()
    while (open.length) {
      open.sort((a,b) => b.score-a.score || b.id-a.id)
      const current = open.pop()!.id
      if (closed.has(current)) continue
      if (current === target) {
        const path: Point[] = [to]
        let id = target
        while (id !== source) { id = previous.get(id)!; path.unshift(point(id)) }
        // Remove collinear grid points before rounding the corners.
        const compact = path.filter((p,i) => !i || i === path.length-1 || !((p[0] === path[i-1][0] && p[0] === path[i+1][0]) || (p[1] === path[i-1][1] && p[1] === path[i+1][1])))
        return [start, ...compact, end]
      }
      closed.add(current)
      const x = current % xs.length, y = Math.floor(current / xs.length)
      const near = [x > 0 ? current-1 : -1, x < xs.length-1 ? current+1 : -1, y > 0 ? current-xs.length : -1, y < ys.length-1 ? current+xs.length : -1]
      for (const next of near) {
        if (next < 0 || closed.has(next) || crossing(point(current),point(next))) continue
        const cost = costs.get(current)! + distance(point(current),point(next)) + 0.01
        if (cost >= (costs.get(next) ?? Infinity)) continue
        costs.set(next,cost); previous.set(next,current)
        open.push({id:next, score:cost+distance(point(next),to)})
      }
    }
    // A valid layout always leaves an outer corridor. Do not draw through a
    // node if corrupt imported geometry makes even that corridor unreachable.
    return []
  }
}
