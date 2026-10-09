import { Handle, Position, type NodeProps } from '@xyflow/react'
import { CheckCircle2, Code2, Lock, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type NodeData } from '@/types/canvas'

export function PracticalTaskNode({ data, selected }: NodeProps & { data: NodeData }) {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  return (
    <div
      className={`relative w-72 rounded-2xl p-4 border-2 transition-all duration-200 select-none bg-[#171A20] shadow-xl ${
        selected
          ? 'border-[#B7F36B] shadow-[0_0_20px_rgba(183,243,107,0.25)]'
          : 'border-[#2A3038] hover:border-[#3E4752]'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-[#B7F36B] border border-[#0B0D10]" />
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-[#B7F36B] border border-[#0B0D10]" />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <Code2 className="w-4 h-4" />
        </div>

        {data.status === 'completed' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-[#B7F36B]/15 text-[#B7F36B] border border-[#B7F36B]/30 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{isEn ? 'Completed' : 'Tamamlandı'}</span>
          </span>
        ) : data.status === 'in_progress' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
            <Play className="w-2.5 h-2.5 fill-amber-400" />
            <span>{isEn ? 'In Progress' : 'Devam Ediyor'}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider bg-[#2A3038]/70 text-[#9CA3AF] border border-[#2A3038]">
            <Lock className="w-2.5 h-2.5" />
            <span>{isEn ? 'Locked' : 'Kilitli'}</span>
          </span>
        )}
      </div>

      <div className="mb-1 text-[10px] font-mono uppercase tracking-wider text-purple-400 font-semibold">
        {isEn ? 'Milestone Deliverable' : 'Uygulamalı Proje Görevi'}
      </div>

      <h4 className="text-sm font-bold text-[#E9EDF3] leading-snug mb-1.5">
        {isEn ? data.titleEn : data.titleTr}
      </h4>

      <p className="text-[11px] text-[#9CA3AF] line-clamp-2 leading-relaxed mb-3">
        {isEn ? data.whyNeededEn : data.whyNeededTr}
      </p>

      <div className="pt-2 border-t border-[#2A3038] flex items-center justify-between text-[11px] font-mono text-[#9CA3AF]">
        <span>{isEn ? 'Target' : 'Hedef'}: FastAPI Model Server</span>
        <span className="text-[#E9EDF3] font-semibold">{data.estimatedHours} {isEn ? 'hrs' : 'saat'}</span>
      </div>
    </div>
  )
}
