import { BaseEdge, type EdgeProps } from '@xyflow/react'
import { useTheme } from '@/hooks/useTheme'

// Rounded polylines: diagonal joins in the column gaps, clear bypasses for
// distant dependencies. Labels below the junction remain unobstructed.
function roundedPath(points: number[][]) {
  let path = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i]
    const previous = points[i - 1], next = points[i + 1]
    const before = Math.hypot(x - previous[0], y - previous[1])
    const after = Math.hypot(next[0] - x, next[1] - y)
    if (!before || !after) continue
    const radius = Math.min(16, before / 2, after / 2)
    path += ` L ${x + (previous[0] - x) * radius / before} ${y + (previous[1] - y) * radius / before} Q ${x} ${y} ${x + (next[0] - x) * radius / after} ${y + (next[1] - y) * radius / after}`
  }
  return `${path} L ${points.at(-1)![0]} ${points.at(-1)![1]}`
}

export function LearningRoute({ sourceX: sx, sourceY: sy, targetX: tx, targetY: ty, data }: EdgeProps) {
  const { isDark } = useTheme()
  const route = data as { points?: number[][]; gutterX?: number; gutterY?: number; optional?: boolean; isCompleted?: boolean; isRemedial?: boolean; isActive?: boolean }
  const exit = sx + 104, entry = tx - 104
  const points = route.gutterX !== undefined
    ? [[sx, sy], [route.gutterX, sy], [route.gutterX, ty], [tx, ty]]
    : route.gutterY !== undefined
      ? [[sx, sy], [exit, sy], [exit, route.gutterY], [entry, route.gutterY], [entry, ty], [tx, ty]]
      : [[sx, sy], [exit, sy], [entry, ty], [tx, ty]]
  const color = route.isRemedial ? (isDark ? '#D5AD62' : '#C5A36A') : route.isActive || route.isCompleted
    ? isDark ? '#B7F36B' : '#2B660E' : isDark ? '#485361' : '#BEC6D0'
  const routed = route.points ?? points
  if (!routed.length) return null
  return <BaseEdge path={roundedPath(routed)} style={{ stroke: color, strokeWidth: route.optional ? 2 : 4,
    strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: route.optional ? '4 8' : undefined,
    opacity: route.optional ? 0.45 : 0.85 }} />
}
