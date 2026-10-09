import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  Lock,
  Play,
  Sparkles,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type NodeData } from '@/types/canvas'

export function LearningNode({ data, selected }: NodeProps & { data: NodeData }) {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const getStatusBadge = () => {
    switch (data.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#B7F36B]/15 text-[#B7F36B] border border-[#B7F36B]/30 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isEn ? 'Completed' : 'Tamamlandı'}</span>
          </span>
        )
      case 'needs_review':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold">
            <AlertCircle className="w-3 h-3" />
            <span>{isEn ? 'Needs Review' : 'Tekrar Gerekli'}</span>
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
            <Play className="w-2.5 h-2.5 fill-amber-400" />
            <span>{isEn ? 'In Progress' : 'Devam Ediyor'}</span>
          </span>
        )
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <span>{isEn ? 'Available' : 'Müsait'}</span>
          </span>
        )
      case 'locked':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#2A3038]/70 text-[#9CA3AF] border border-[#2A3038]">
            <Lock className="w-2.5 h-2.5" />
            <span>{isEn ? 'Locked' : 'Kilitli'}</span>
          </span>
        )
    }
  }

  return (
    <div
      className={`relative w-64 rounded-2xl p-3.5 border-2 transition-all duration-200 select-none bg-[#171A20] shadow-lg ${
        data.isRemedial
          ? 'border-amber-500/80 bg-amber-950/20 shadow-[0_0_16px_rgba(245,158,11,0.2)]'
          : selected
          ? 'border-[#B7F36B] shadow-[0_0_16px_rgba(183,243,107,0.25)]'
          : data.status === 'locked'
          ? 'border-[#2A3038]/60 opacity-75 hover:opacity-100 hover:border-[#3E4752]'
          : 'border-[#2A3038] hover:border-[#3E4752]'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-[#B7F36B] border border-[#0B0D10]" />
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-[#B7F36B] border border-[#0B0D10]" />

      {/* Top Banner tags if Remedial or SelfReported */}
      {data.isRemedial && (
        <div className="mb-2 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono uppercase tracking-wider font-semibold">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{isEn ? 'Adaptive Practice Node' : 'Uyarlanmış Ek Pratik'}</span>
        </div>
      )}

      {data.isSelfReported && (
        <div className="mb-2 flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono uppercase tracking-wider">
          <span>{isEn ? 'Self-Reported Skill' : 'Kişisel Beyanlı Bilgi'}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-[#20242B] border border-[#2A3038] flex items-center justify-center text-[#B7F36B]">
          <BookOpen className="w-3.5 h-3.5" />
        </div>
        {getStatusBadge()}
      </div>

      <h4 className="text-xs font-bold text-[#E9EDF3] leading-snug mb-1">
        {isEn ? data.titleEn : data.titleTr}
      </h4>

      <p className="text-[10px] text-[#9CA3AF] line-clamp-2 leading-relaxed mb-3">
        {isEn ? data.whyNeededEn : data.whyNeededTr}
      </p>

      <div className="pt-2 border-t border-[#2A3038] flex items-center justify-between text-[10px] font-mono text-[#9CA3AF]">
        <span className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          <span>{data.estimatedHours} {isEn ? 'hrs' : 'saat'}</span>
        </span>

        {data.quizId && (
          <span className="inline-flex items-center gap-1 text-[#B7F36B] font-semibold">
            <HelpCircle className="w-2.5 h-2.5" />
            <span>{isEn ? 'Quiz' : 'Test'}</span>
          </span>
        )}
      </div>
    </div>
  )
}
