import { ReactFlowProvider } from '@xyflow/react'
import { LearningCanvas } from '@/components/canvas/LearningCanvas'

export function CanvasPage() {
  return (
    <ReactFlowProvider>
      <LearningCanvas />
    </ReactFlowProvider>
  )
}
