import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react'
import { useTheme } from '@/hooks/useTheme'

export function ExpeditionEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const { isDark } = useTheme()

  // Generate smooth organic Bézier curve between milestones
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.35,
  })

  const isCompleted = (data as { isCompleted?: boolean } | undefined)?.isCompleted || false
  const isRemedial = (data as { isRemedial?: boolean } | undefined)?.isRemedial || false
  const isActive = (data as { isActive?: boolean } | undefined)?.isActive || false

  let strokeColor = isDark ? '#2A3038' : '#E3E7EC'
  let strokeWidth = 2.5
  let strokeDasharray = undefined

  if (isCompleted) {
    strokeColor = isDark ? '#B7F36B' : '#2B660E'
    strokeWidth = 3
  } else if (isRemedial) {
    strokeColor = '#F59E0B'
    strokeWidth = 2.5
    strokeDasharray = '6 6'
  } else if (isActive) {
    strokeColor = isDark ? '#B7F36B' : '#2B660E'
    strokeWidth = 2.5
    strokeDasharray = '6 6'
  }

  return (
    <>
      {/* Background shadow path for depth */}
      <path
        d={edgePath}
        fill="none"
        stroke={isDark ? '#07090C' : '#F1F3F5'}
        strokeWidth={strokeWidth + 3}
        strokeLinecap="round"
      />

      {/* Main Expedition Route Path */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
          strokeLinecap: 'round',
          transition: 'stroke 0.4s ease, stroke-width 0.4s ease',
        }}
      />
    </>
  )
}
