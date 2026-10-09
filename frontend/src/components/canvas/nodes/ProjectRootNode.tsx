import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Dumbbell, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type NodeData } from '@/types/canvas'

export function ProjectRootNode({ data, selected }: NodeProps & { data: NodeData }) {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  return (
    <div
      className={`relative w-80 rounded-3xl p-5 border-2 transition-all duration-200 select-none bg-[#171A20] shadow-2xl ${
        selected
          ? 'border-[#B7F36B] shadow-[0_0_24px_rgba(183,243,107,0.25)]'
          : 'border-[#2A3038] hover:border-[#3E4752]'
      }`}
    >
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#B7F36B] border-2 border-[#0B0D10]" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#B7F36B] border-2 border-[#0B0D10]" />
      <Handle type="source" position={Position.Left} className="w-3 h-3 bg-[#B7F36B] border-2 border-[#0B0D10]" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-[#B7F36B]/15 border border-[#B7F36B]/30 flex items-center justify-center text-[#B7F36B]">
          <Dumbbell className="w-6 h-6" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold bg-[#B7F36B]/10 text-[#B7F36B] border border-[#B7F36B]/30">
          <Sparkles className="w-3 h-3" />
          <span>{isEn ? 'Core Objective' : 'Ana Proje Hedefi'}</span>
        </span>
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#E9EDF3] mb-1">
        {isEn ? data.titleEn : data.titleTr}
      </h3>

      <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed mb-4">
        {isEn ? data.whyNeededEn : data.whyNeededTr}
      </p>

      <div className="pt-3 border-t border-[#2A3038] flex items-center justify-between text-xs font-mono text-[#9CA3AF]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#B7F36B] animate-pulse" />
          <span>{isEn ? '5 Domains' : '5 Alan'}</span>
        </span>
        <span className="text-[#E9EDF3] font-semibold">~120 {isEn ? 'Hours' : 'Saat'}</span>
      </div>
    </div>
  )
}
