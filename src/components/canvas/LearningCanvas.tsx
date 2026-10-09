import '@xyflow/react/dist/style.css'
import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  type EdgeTypes,
  type NodeTypes,
  useReactFlow,
} from '@xyflow/react'
import { AnimatePresence, motion } from 'motion/react'
import { Compass, Maximize2, Minus, Plus, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CanvasHeader } from './CanvasHeader'
import { FocusViewModal } from './FocusViewModal'
import { ExpeditionEdge } from './edges/ExpeditionEdge'
import { MilestoneNode } from './nodes/MilestoneNode'
import { QuizModal } from '@/components/assessment/QuizModal'
import { AiAdvisorPanel } from '@/components/drawer/AiAdvisorPanel'
import { useTheme } from '@/hooks/useTheme'
import { useRoadmapStore } from '@/store/useRoadmapStore'

function CanvasControls() {
  const { zoomIn, zoomOut, fitView, setCenter } = useReactFlow()
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const currentLevel = useRoadmapStore(s => s.currentLevel)
  const rootNodes = useRoadmapStore(s => s.rootNodes)
  const mlSubmapNodes = useRoadmapStore(s => s.mlSubmapNodes)
  const activeNodes = currentLevel === 'root' ? rootNodes : mlSubmapNodes

  // Locate the currently active or in-progress milestone
  const handleGoToMyLocation = useCallback(() => {
    if (!activeNodes.length) return
    const activeMilestone =
      activeNodes.find(n => n.data.status === 'in_progress') ||
      activeNodes.find(n => n.data.isRemedial) ||
      activeNodes.find(n => n.data.status === 'available') ||
      activeNodes.find(n => n.data.status === 'needs_review') ||
      activeNodes[0]

    if (activeMilestone) {
      setCenter(activeMilestone.position.x + 24, activeMilestone.position.y + 24, {
        zoom: 1.1,
        duration: 650,
      })
    }
  }, [activeNodes, setCenter])

  return (
    <div className="absolute bottom-6 left-6 z-30 flex items-center gap-1.5 p-1.5 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF]/90 dark:bg-[#171A20]/90 backdrop-blur-md shadow-xl">
      {/* Zoom in */}
      <button
        type="button"
        onClick={() => zoomIn()}
        className="p-2 rounded-xl text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:bg-[#F0F2F5] dark:hover:bg-[#20242B] transition-colors cursor-pointer"
        title={isEn ? 'Zoom In' : 'Yakınlaştır'}
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Zoom out */}
      <button
        type="button"
        onClick={() => zoomOut()}
        className="p-2 rounded-xl text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:bg-[#F0F2F5] dark:hover:bg-[#20242B] transition-colors cursor-pointer"
        title={isEn ? 'Zoom Out' : 'Uzaklaştır'}
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="h-4 w-[1px] bg-[#E3E7EC] dark:bg-[#2A3038]" />

      {/* Fit to Map */}
      <button
        type="button"
        onClick={() => fitView({ padding: 0.22, duration: 400 })}
        className="p-2 rounded-xl text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:bg-[#F0F2F5] dark:hover:bg-[#20242B] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
        title={isEn ? 'Fit Map to Screen' : 'Tüm Haritayı Göster'}
      >
        <Maximize2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{isEn ? 'Fit' : 'Odakla'}</span>
      </button>

      <div className="h-4 w-[1px] bg-[#E3E7EC] dark:bg-[#2A3038]" />

      {/* "Konumuma Git" Button */}
      <button
        type="button"
        onClick={handleGoToMyLocation}
        className="px-2.5 py-1.5 rounded-xl text-[#2B660E] dark:text-[#B7F36B] bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 hover:bg-[#2B660E]/20 dark:hover:bg-[#B7F36B]/25 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono font-medium"
        title={isEn ? 'Center on Active Milestone' : 'Mevcut Konumuma Odaklan'}
      >
        <Compass className="w-3.5 h-3.5 stroke-[2.2]" />
        <span>{isEn ? 'My Location' : 'Konumuma Git'}</span>
      </button>
    </div>
  )
}

function CanvasFlowInner() {
  const { isDark } = useTheme()
  const { setCenter } = useReactFlow()

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

  // Map all node types to the compact MilestoneNode component
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      milestone: MilestoneNode,
      projectRoot: MilestoneNode,
      domain: MilestoneNode,
      learning: MilestoneNode,
      task: MilestoneNode,
    }),
    []
  )

  // Custom organic curved edge
  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      expedition: ExpeditionEdge,
    }),
    []
  )

  // Start navigation near the bottom of the expedition route
  useEffect(() => {
    const nodes = currentLevel === 'root' ? rootNodes : mlSubmapNodes
    const timer = setTimeout(() => {
      if (!nodes.length) return
      // Find the milestone closest to the bottom (highest Y coordinate)
      const basecampMilestone = nodes.reduce((lowest, curr) =>
        curr.position.y > lowest.position.y ? curr : lowest,
        nodes[0]
      )
      if (basecampMilestone) {
        setCenter(basecampMilestone.position.x + 24, basecampMilestone.position.y - 120, {
          zoom: 0.9,
          duration: 650,
        })
      }
    }, 120)
    return () => clearTimeout(timer)
  }, [currentLevel, rootNodes, mlSubmapNodes, setCenter])

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

      {/* React Flow Viewport with expedition defaults */}
      <ReactFlow
        nodes={activeNodes}
        edges={activeEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => selectNode(node)}
        onPaneClick={() => selectNode(null)}
        minZoom={0.25}
        maxZoom={2.2}
        defaultEdgeOptions={{
          type: 'expedition',
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-[#F7F8FA] dark:bg-[#0B0D10]"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1.2}
          color={isDark ? '#222730' : '#CBD5E1'}
          className="opacity-60"
        />

        <MiniMap
          nodeColor={node => {
            if (node.data?.status === 'completed') return '#B7F36B'
            if (node.data?.status === 'in_progress') return '#B7F36B'
            if (node.data?.isRemedial) return '#F59E0B'
            return isDark ? '#222730' : '#CBD5E1'
          }}
          maskColor={isDark ? 'rgba(11, 13, 16, 0.8)' : 'rgba(247, 248, 250, 0.8)'}
          className="!bottom-6 !right-24 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] !bg-[#FFFFFF]/90 dark:!bg-[#171A20]/90 !shadow-lg hidden md:block"
        />

        <CanvasControls />
      </ReactFlow>

      {/* Full-Screen Immersive Center Focus View (Replaces old right-side drawer) */}
      <FocusViewModal />

      {/* Floating Persistent AI Advisor (Launcher at bottom-right) */}
      <AiAdvisorPanel />

      {/* Knowledge Assessment Modal */}
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
