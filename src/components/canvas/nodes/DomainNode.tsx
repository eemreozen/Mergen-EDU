import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Database,
  Layers,
  Lock,
  Play,
  Smartphone,
  Terminal,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type NodeData } from '@/types/canvas'
import { useRoadmapStore } from '@/store/useRoadmapStore'

export function DomainNode({ data, selected }: NodeProps & { data: NodeData }) {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')
  const navigateToSubmap = useRoadmapStore(s => s.navigateToSubmap)

  const getDomainIcon = () => {
    switch (data.domain) {
      case 'Mobile':
        return <Smartphone className="w-5 h-5 text-sky-400" />
      case 'Backend':
        return <Terminal className="w-5 h-5 text-emerald-400" />
      case 'AI/ML':
        return <BrainCircuit className="w-5 h-5 text-[#B7F36B]" />
      case 'Database':
        return <Database className="w-5 h-5 text-amber-400" />
      default:
        return <Layers className="w-5 h-5 text-purple-400" />
    }
  }

  const getStatusBadge = () => {
    switch (data.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-[#B7F36B]/10 text-[#B7F36B] border border-[#B7F36B]/25">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isEn ? 'Completed' : 'Tamamlandı'}</span>
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <Play className="w-3 h-3 fill-amber-400" />
            <span>{isEn ? 'In Progress' : 'Devam Ediyor'}</span>
          </span>
        )
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/25">
            <span>{isEn ? 'Available' : 'Müsait'}</span>
          </span>
        )
      case 'locked':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-[#2A3038]/60 text-[#9CA3AF] border border-[#2A3038]">
            <Lock className="w-3 h-3" />
            <span>{isEn ? 'Locked' : 'Kilitli'}</span>
          </span>
        )
    }
  }

  const handleSubmapClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (data.hasSubmap && data.submapId) {
      navigateToSubmap(data.submapId)
    }
  }

  return (
    <div
      onDoubleClick={() => {
        if (data.hasSubmap && data.submapId) {
          navigateToSubmap(data.submapId)
        }
      }}
      className={`relative w-72 rounded-2xl p-4 border-2 transition-all duration-200 select-none bg-[#171A20] shadow-xl ${
        selected
          ? 'border-[#B7F36B] shadow-[0_0_18px_rgba(183,243,107,0.2)]'
          : 'border-[#2A3038] hover:border-[#3E4752]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 bg-[#B7F36B] border border-[#0B0D10]" />
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 bg-[#B7F36B] border border-[#0B0D10]" />
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-[#B7F36B] border border-[#0B0D10]" />
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-[#B7F36B] border border-[#0B0D10]" />

      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#20242B] border border-[#2A3038] flex items-center justify-center">
          {getDomainIcon()}
        </div>
        {getStatusBadge()}
      </div>

      <h4 className="text-sm font-bold text-[#E9EDF3] leading-snug mb-1">
        {isEn ? data.titleEn : data.titleTr}
      </h4>

      <p className="text-[11px] text-[#9CA3AF] line-clamp-2 leading-relaxed mb-3">
        {isEn ? data.whyNeededEn : data.whyNeededTr}
      </p>

      <div className="pt-2.5 border-t border-[#2A3038] flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#9CA3AF] flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{data.estimatedHours} {isEn ? 'hrs' : 'saat'}</span>
        </span>

        {data.hasSubmap && (
          <button
            type="button"
            onClick={handleSubmapClick}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-[#B7F36B]/15 text-[#B7F36B] hover:bg-[#B7F36B] hover:text-[#0B0D10] transition-colors cursor-pointer border border-[#B7F36B]/30"
          >
            <span>{isEn ? 'Open Submap' : 'Alt Haritayı Aç'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
