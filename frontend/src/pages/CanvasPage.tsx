import { Navigate, useSearchParams } from 'react-router-dom'
import { ReactFlowProvider } from '@xyflow/react'
import { LearningCanvas } from '@/components/canvas/LearningCanvas'

export function CanvasPage() {
  const [params] = useSearchParams()
  if (params.get('demo') !== '1') return <Navigate to={`/learn${params.size ? `?${params.toString()}` : ''}`} replace />
  return (
    <ReactFlowProvider>
      <LearningCanvas />
    </ReactFlowProvider>
  )
}
