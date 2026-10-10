import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { Check, Layers, Lock, ArrowRight } from 'lucide-react'
import { STOP_HEIGHT, STOP_WIDTH, type LearningNodeData } from './layout'

// The circular junction and rounded connectors share Mergen's logo geometry.
export function LearningStop({ data }: NodeProps<Node<LearningNodeData>>) {
  const { node, adaptive, recommended, activate, stepNumber } = data
  const completed = node.status === 'completed'
  const locked = node.status === 'locked'
  const active = recommended || node.status === 'in_progress'
  const marker = completed || active
    ? 'bg-[#2B660E] text-white dark:bg-[#B7F36B] dark:text-[#17210F]'
    : locked ? 'bg-[#E0E4E9] text-[#87919E] dark:bg-[#36404D] dark:text-[#95A0AD]'
      : 'bg-white text-[#2B660E] ring-2 ring-[#8DAE76] dark:bg-[#202B22] dark:text-[#B7F36B]'
  return <div className="relative" style={{ width: STOP_WIDTH, height: STOP_HEIGHT }}>
    <Handle id="in" type="target" position={Position.Left} style={{ left: 84, top: 32, opacity: 0 }} />
    <Handle id="out" type="source" position={Position.Right} style={{ left: 136, right: 'auto', top: 32, opacity: 0 }} />
    <button title={node.title} onClick={() => activate(node.id)} aria-label={`${node.title}${recommended ? ', önerilen durak' : ''}`}
      className="nodrag group flex w-full h-full flex-col items-center text-center cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-[#6D9B4F]">
      <span className={`relative mt-[6px] flex size-[52px] shrink-0 items-center justify-center rounded-full border-[5px] border-[#F6F7F9] dark:border-[#141B24] transition-transform group-hover:scale-110 ${marker} ${active ? 'shadow-[0_0_0_5px_#2b660e12]' : ''}`}>
        {completed ? <Check size={19} strokeWidth={3} /> : locked ? <Lock size={15} /> : <span className="text-sm font-semibold tabular-nums">{stepNumber}</span>}
        {node.childMapId && <Layers size={13} className="absolute -right-3 -bottom-1 rounded-full bg-white text-[#5E8A3D] dark:bg-[#141B24]" />}
      </span>
      <span className={`mt-3 max-w-[204px] text-[13px] leading-[19px] font-medium line-clamp-2 ${active ? 'text-[#2B660E] dark:text-[#B7F36B]' : 'text-[#3B4552] dark:text-[#D1D8E1]'}`}>{node.title}</span>
      <span className="mt-1 flex items-center gap-2 text-[10px] tracking-wide text-[#8A94A1] dark:text-[#8D99A8]">
        <span>{String(stepNumber).padStart(2, '0')} ADIM</span><span>·</span><span>{node.estimatedHours} sa</span>
        {adaptive && <span className="text-[#AF7C22]">· Pekiştirme</span>}
      </span>
      {recommended && <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-[#2B660E] dark:text-[#B7F36B]">Buradan devam et <ArrowRight size={11} /></span>}
    </button>
  </div>
}
