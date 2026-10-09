import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react'
import { useTheme } from '@/hooks/useTheme'

export function LearningRoute(props: EdgeProps) {
  const { isDark } = useTheme()
  const { sourceX: sx, sourceY: sy, targetX: tx, targetY: ty, data } = props
  const route = data as { gutterX?: number; optional?: boolean; isCompleted?: boolean; isRemedial?: boolean; isActive?: boolean }
  let path: string
  if (route.gutterX !== undefined) {
    const x = route.gutterX
    const y1 = sy + 28
    const y2 = ty - 28
    // Dedicated vertical gutter and horizontal row gaps preserve readable labels.
    path = `M ${sx} ${sy} L ${sx} ${y1 - 10} Q ${sx} ${y1} ${sx + Math.sign(x - sx) * 10} ${y1} L ${x - Math.sign(x - sx) * 10} ${y1} Q ${x} ${y1} ${x} ${y1 + Math.sign(y2 - y1) * 10} L ${x} ${y2 - Math.sign(y2 - y1) * 10} Q ${x} ${y2} ${x + Math.sign(tx - x) * 10} ${y2} L ${tx - Math.sign(tx - x) * 10} ${y2} Q ${tx} ${y2} ${tx} ${y2 + 10} L ${tx} ${ty}`
  } else {
    [path] = getBezierPath({ ...props, curvature: 0.35 })
  }
  const color = route.isRemedial ? '#D99B27' : route.isActive || route.isCompleted
    ? isDark ? '#B7F36B' : '#5E8A3D' : isDark ? '#45505C' : '#C3CCD5'
  return <BaseEdge path={path} style={{ stroke: color, strokeWidth: route.isActive ? 2.5 : 1.8,
    strokeDasharray: route.optional || route.isRemedial ? '5 6' : undefined,
    opacity: route.optional ? 0.5 : 0.85 }} />
}
