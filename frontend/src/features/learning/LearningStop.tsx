import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { MilestoneNode } from '@/components/canvas/nodes/MilestoneNode'
import type { LearningNodeData } from './layout'

// Keep the original expedition markers; only adapt persisted API data.
export function LearningStop(props: NodeProps<Node<LearningNodeData>>) {
  const { node, adaptive, recommended, activate, stepNumber } = props.data
  return <div className="relative w-[270px] h-[80px]">
    <Handle id="in" type="target" position={Position.Top} style={{ left: 22, top: 0, opacity: 0 }} />
    <Handle id="out" type="source" position={Position.Bottom} style={{ left: 22, bottom: 22, opacity: 0 }} />
    <button className="nodrag text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B7F36B] rounded-2xl" onClick={() => activate(node.id)} aria-label={`${node.title}${recommended ? ', önerilen durak' : ''}`}>
      <MilestoneNode {...props} hideHandles data={{ id: node.id, titleTr: node.title, titleEn: node.title,
        category: node.type === 'development_task' ? 'task' : node.type === 'submap' ? 'domain' : 'learning',
        status: node.status, estimatedHours: node.estimatedHours, isRemedial: adaptive,
        hasSubmap: !!node.adaptiveMapId || node.type === 'submap', milestoneScale: 'sm',
        labelPosition: 'right', stepNumber: String(stepNumber), domain: adaptive ? 'Öğrenme dalı' : undefined }} />
    </button>
    {recommended && <span className="absolute left-[58px] top-[52px] text-[10px] font-mono text-[#2B660E] dark:text-[#B7F36B]">Buradan devam et ↓</span>}
  </div>
}
