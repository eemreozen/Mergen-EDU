import '@xyflow/react/dist/style.css'
import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  type NodeTypes,
  useReactFlow,
} from '@xyflow/react'
import { AnimatePresence, motion } from 'motion/react'
import { Maximize2, Minus, Plus, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CanvasHeader } from './CanvasHeader'
import { DomainNode } from './nodes/DomainNode'
import { LearningNode } from './nodes/LearningNode'
import { PracticalTaskNode } from './nodes/PracticalTaskNode'
import { ProjectRootNode } from './nodes/ProjectRootNode'
import { QuizModal } from '@/components/assessment/QuizModal'
import { AiAdvisorPanel } from '@/components/drawer/AiAdvisorPanel'
import { NodeDetailPanel } from '@/components/drawer/NodeDetailPanel'
import { useTheme } from '@/hooks/useTheme'
import { useRoadmapStore } from '@/store/useRoadmapStore'

function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  return (
    <div className="absolute bottom-6 left-6 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF]/90 dark:bg-[#171A20]/90 backdrop-blur-md shadow-xl">
      <button
        type="button"
        onClick={() => zoomIn()}
        className="p-2 rounded-xl text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:bg-[#F0F2F5] dark:hover:bg-[#20242B] transition-colors cursor-pointer"
        title={isEn ? 'Zoom In' : 'Yakınlaştır'}
      >
        <Plus className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => zoomOut()}
        className="p-2 rounded-xl text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:bg-[#F0F2F5] dark:hover:bg-[#20242B] transition-colors cursor-pointer"
        title={isEn ? 'Zoom Out' : 'Uzaklaştır'}
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="h-4 w-[1px] bg-[#E3E7EC] dark:bg-[#2A3038]" />

      <button
        type="button"
        onClick={() => fitView({ padding: 0.2, duration: 400 })}
        className="p-2 rounded-xl text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:bg-[#F0F2F5] dark:hover:bg-[#20242B] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
        title={isEn ? 'Fit View' : 'Merkeze Odakla'}
      >
        <Maximize2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{isEn ? 'Fit' : 'Odakla'}</span>
      </button>
    </div>
  )
}

function CanvasFlowInner() {
  const { isDark } = useTheme()
  const { fitView } = useReactFlow()

  const currentLevel = useRoadmapStore(s => s.currentLevel)
  const rootNodes = useRoadmapStore(s => s.rootNodes)
  const rootEdges = useRoadmapStore(s => s.rootEdges)
  const mlSubmapNodes = useRoadmapStore(s => s.mlSubmapNodes)
  const mlSubmapEdges = useRoadmapStore(s => s.mlSubmapEdges)
  const onNodesChange = useRoadmapStore(s => s.onNodesChange)
  const onEdgesChange = useRoadmapStore(s => s.onEdgesChange)
  const selectNode = useRoadmapStore(s => s.selectNode)
  const adaptiveNotice = useRoadmapStore(s => s.adaptiveNotice)
  const clearAdaptiveNotice = useRoadmapStore(s => s.clearAdaptiveNotice)

  const activeNodes = currentLevel === 'root' ? rootNodes : mlSubmapNodes
  const activeEdges = currentLevel === 'root' ? rootEdges : mlSubmapEdges

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      projectRoot: ProjectRootNode,
      domain: DomainNode,
      learning: LearningNode,
      task: PracticalTaskNode,
    }),
    []
  )

  // Smooth fit to view when level changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.22, duration: 500 })
    }, 100)
    return () => clearTimeout(timer)
  }, [currentLevel, fitView])

  return (
    <div className="w-full h-full relative select-none">
      {/* Top Header */}
      <CanvasHeader />

      {/* Adaptive Roadmap Notice Toast / Banner */}
      <AnimatePresence>
        {adaptiveNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-lg w-full px-4"
          >
            <div className="p-3.5 rounded-2xl border border-amber-500/40 bg-[#171A20] text-amber-300 shadow-2xl flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <span>{adaptiveNotice}</span>
              </div>
              <button
                type="button"
                onClick={clearAdaptiveNotice}
                className="p-1 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* React Flow Viewport */}
      <ReactFlow
        nodes={activeNodes}
        edges={activeEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => selectNode(node)}
        onPaneClick={() => selectNode(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          style: {
            stroke: isDark ? '#2A3038' : '#CBD5E1',
            strokeWidth: 2,
          },
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-[#F7F8FA] dark:bg-[#0B0D10]"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color={isDark ? '#2A3038' : '#CBD5E1'}
          className="opacity-70"
        />

        <MiniMap
          nodeColor={node => {
            if (node.data?.status === 'completed') return '#B7F36B'
            if (node.data?.status === 'in_progress') return '#F59E0B'
            if (node.data?.isRemedial) return '#F59E0B'
            return isDark ? '#2A3038' : '#CBD5E1'
          }}
          maskColor={isDark ? 'rgba(11, 13, 16, 0.75)' : 'rgba(247, 248, 250, 0.75)'}
          className="!bottom-6 !right-24 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] !bg-[#FFFFFF]/90 dark:!bg-[#171A20]/90 !shadow-lg hidden md:block"
        />

        <CanvasControls />
      </ReactFlow>

      {/* Right Drawer: Node Detail Panel */}
      <NodeDetailPanel />

      {/* Floating AI Advisor */}
      <AiAdvisorPanel />

      {/* Quiz Modal */}
      <QuizModal />
    </div>
  )
}

export function LearningCanvas() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-[#F7F8FA] dark:bg-[#0B0D10]">
      <CanvasFlowInner />
    </div>
  )
}
