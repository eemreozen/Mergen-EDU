import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  AlertCircle,
  BrainCircuit,
  Check,
  ChevronRight,
  Code2,
  Compass,
  Dumbbell,
  Layers,
  Lock,
  Smartphone,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type NodeData } from '@/types/canvas'

export function MilestoneNode({ data, selected, hideHandles = false }: NodeProps & { data: NodeData; hideHandles?: boolean }) {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const title = isEn ? data.titleEn : data.titleTr
  const status = data.status
  const isCompleted = status === 'completed'
  const isInProgress = status === 'in_progress'
  const isNeedsReview = status === 'needs_review'
  const isLocked = status === 'locked'
  const isAvailable = status === 'available'
  const isRemedial = data.isRemedial
  const hasSubmap = data.hasSubmap

  const scale = data.milestoneScale || (data.category === 'root' ? 'lg' : data.category === 'domain' ? 'md' : 'sm')
  const labelPos = data.labelPosition || (scale === 'lg' ? 'bottom' : 'right')

  // Contextual icon based on category or domain
  const getIcon = () => {
    if (isCompleted) return <Check className="w-5 h-5 stroke-[2.5]" />
    if (isNeedsReview) return <AlertCircle className="w-5 h-5 text-rose-400" />
    if (isLocked) return <Lock className="w-4 h-4 text-[#9CA3AF]" />
    if (data.category === 'root') return <Dumbbell className="w-6 h-6" />
    if (data.domain === 'AI/ML' || hasSubmap) return <BrainCircuit className="w-5 h-5" />
    if (data.domain === 'Mobile') return <Smartphone className="w-5 h-5" />
    if (data.domain === 'Backend') return <Terminal className="w-5 h-5" />
    if (data.category === 'task') return <Code2 className="w-5 h-5" />
    return data.stepNumber ? <span className="font-mono text-xs font-bold">{data.stepNumber}</span> : <Compass className="w-4 h-4" />
  }

  // Size configurations
  const sizeClasses = {
    sm: 'w-11 h-11 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-16 h-16 text-base',
  }[scale]

  // Status visual treatment
  let markerStyle = 'bg-[#171A20] border-[#2A3038] text-[#9CA3AF]'
  let ringAnimation = ''

  if (isCompleted) {
    markerStyle = 'bg-[#2B660E] dark:bg-[#B7F36B] border-[#2B660E] dark:border-[#B7F36B] text-white dark:text-[#0B0D10] shadow-[0_0_20px_rgba(183,243,107,0.3)]'
  } else if (isInProgress || isAvailable) {
    markerStyle = 'bg-[#171A20] border-[#2B660E] dark:border-[#B7F36B] text-[#2B660E] dark:text-[#B7F36B] shadow-[0_0_16px_rgba(183,243,107,0.2)]'
    ringAnimation = 'ring-4 ring-[#2B660E]/20 dark:ring-[#B7F36B]/25 animate-pulse'
  } else if (isRemedial) {
    markerStyle = 'bg-amber-950/40 border-amber-500 text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.25)]'
    ringAnimation = 'ring-4 ring-amber-500/20 animate-pulse'
  } else if (isNeedsReview) {
    markerStyle = 'bg-rose-950/40 border-rose-500 text-rose-400'
  } else if (isLocked) {
    markerStyle = 'bg-[#111318] border-[#22272E] text-[#64748B] opacity-75'
  }

  return (
    <div
      className={`relative group flex items-center select-none transition-transform duration-200 ${
        labelPos === 'bottom' ? 'flex-col gap-2' : labelPos === 'left' ? 'flex-row-reverse gap-3.5' : 'flex-row gap-3.5'
      } ${selected ? 'scale-105' : 'hover:scale-105'}`}
    >
      {/* Handles: source at TOP, target at BOTTOM for bottom-to-top route flow */}
      {!hideHandles && <><Handle
        type="target"
        position={Position.Bottom}
        className="w-2.5 h-2.5 !bg-transparent !border-0 opacity-0 pointer-events-none"
      />
      <Handle
        type="source"
        position={Position.Top}
        className="w-2.5 h-2.5 !bg-transparent !border-0 opacity-0 pointer-events-none"
      />
      {/* Lateral handles for branching convergence */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-transparent !border-0 opacity-0 pointer-events-none"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 !bg-transparent !border-0 opacity-0 pointer-events-none"
      /></>}

      {/* 1. The Compact Circular Milestone Marker */}
      <div
        className={`relative rounded-2xl border-2 flex items-center justify-center font-mono font-bold transition-all duration-200 cursor-pointer ${sizeClasses} ${markerStyle} ${ringAnimation} ${
          selected ? 'border-[#B7F36B] ring-4 ring-[#B7F36B]/30' : ''
        }`}
      >
        {getIcon()}

        {/* Nested Submap Layers Badge */}
        {hasSubmap && (
          <div
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#171A20] border border-[#2B660E] dark:border-[#B7F36B] flex items-center justify-center text-[#2B660E] dark:text-[#B7F36B] shadow-sm"
            title={isEn ? 'Nested Submap Available' : 'Alt Harita Mevcut'}
          >
            <Layers className="w-3 h-3" />
          </div>
        )}

        {/* Remedial Detour Badge */}
        {isRemedial && (
          <div
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-[#0B0D10] flex items-center justify-center font-bold"
            title={isEn ? 'Adaptive Remedial Detour' : 'Uyarlanmış Ek Pratik'}
          >
            <Sparkles className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* 2. The Clean Editorial Label (Beside or Beneath the Marker) */}
      <div
        className={`flex flex-col max-w-[210px] text-left pointer-events-auto cursor-pointer ${
          labelPos === 'bottom' ? 'items-center text-center' : ''
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-semibold tracking-tight transition-colors line-clamp-2 ${
              isCompleted
                ? 'text-[#111318] dark:text-[#E9EDF3] font-bold'
                : isInProgress || isAvailable
                ? 'text-[#2B660E] dark:text-[#B7F36B] font-bold'
                : 'text-[#68717D] dark:text-[#9CA3AF]'
            } ${selected ? 'text-[#2B660E] dark:text-[#B7F36B]' : ''}`}
          >
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-[#9CA3AF] dark:text-[#64748B]">
          {data.estimatedHours && <span>{data.estimatedHours}h</span>}
          {hasSubmap && (
            <span className="text-[#2B660E] dark:text-[#B7F36B] flex items-center font-medium">
              <span>{isEn ? 'Submap' : 'Alt Harita'}</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          )}
          {isCompleted && (
            <span className="text-[#2B660E] dark:text-[#B7F36B] font-medium">
              {isEn ? 'Done' : 'Bitti'}
            </span>
          )}
          {isNeedsReview && (
            <span className="text-rose-400 font-medium">
              {isEn ? 'Review' : 'Tekrar'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
