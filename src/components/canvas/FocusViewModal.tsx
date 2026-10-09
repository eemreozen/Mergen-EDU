import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Play,
  Sparkles,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useRoadmapStore } from '@/store/useRoadmapStore'

export function FocusViewModal() {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const selectedNode = useRoadmapStore(s => s.selectedNode)
  const isDetailPanelOpen = useRoadmapStore(s => s.isDetailPanelOpen)
  const closeDetailPanel = useRoadmapStore(s => s.closeDetailPanel)
  const updateNodeStatus = useRoadmapStore(s => s.updateNodeStatus)
  const openQuiz = useRoadmapStore(s => s.openQuiz)
  const navigateToSubmap = useRoadmapStore(s => s.navigateToSubmap)
  const currentLevel = useRoadmapStore(s => s.currentLevel)
  const projectName = useRoadmapStore(s => s.projectName)

  if (!isDetailPanelOpen || !selectedNode || !selectedNode.data) return null

  const { data } = selectedNode
  const title = isEn ? data.titleEn : data.titleTr
  const whyNeeded = isEn ? data.whyNeededEn : data.whyNeededTr
  const prerequisites = isEn ? data.prerequisitesEn : data.prerequisitesTr
  const objectives = isEn ? data.learningObjectivesEn : data.learningObjectivesTr
  const practicalTask = isEn ? data.practicalTaskEn : data.practicalTaskTr

  const handleStartLearning = () => {
    updateNodeStatus(data.id, 'in_progress')
  }

  const handleAlreadyKnow = () => {
    if (data.quizId) {
      openQuiz(data.quizId)
    } else {
      updateNodeStatus(data.id, 'completed')
    }
  }

  const handleTestKnowledge = () => {
    if (data.quizId) {
      openQuiz(data.quizId)
    } else {
      openQuiz('quiz-python')
    }
  }

  const handleEnterSubmap = () => {
    if (data.hasSubmap && data.submapId) {
      closeDetailPanel()
      navigateToSubmap(data.submapId)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
        {/* Backdrop: Dims and deepens the canvas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={closeDetailPanel}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* Central Focus View Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[88vh] rounded-3xl border-2 border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-2xl flex flex-col overflow-hidden text-left z-10"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Top Bar: Back to Map, Breadcrumb, Status */}
          <div className="p-5 sm:p-6 border-b border-[#E3E7EC] dark:border-[#2A3038] flex items-center justify-between bg-[#F7F8FA] dark:bg-[#111318]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeDetailPanel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-xs font-mono font-medium text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:border-[#CBD5E1] dark:hover:border-[#3E4752] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isEn ? 'Back to Map' : 'Haritaya Dön'}</span>
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#9CA3AF] dark:text-[#64748B]">
                <span>{projectName}</span>
                <span>/</span>
                {currentLevel === 'ml-submap' && (
                  <>
                    <span>Machine Learning</span>
                    <span>/</span>
                  </>
                )}
                <span className="text-[#111318] dark:text-[#E9EDF3] font-semibold">{title}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B] border border-[#2B660E]/20 dark:border-[#B7F36B]/30">
                {data.status.replace('_', ' ').toUpperCase()}
              </span>

              <button
                type="button"
                onClick={closeDetailPanel}
                className="p-1.5 rounded-lg text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area (Scrollable with generous negative space) */}
          <div className="flex-1 p-6 sm:p-8 md:p-10 overflow-y-auto space-y-8">
            {/* Title & Expedition Elevation */}
            <div>
              <div className="flex items-center gap-3 text-xs font-mono text-[#9CA3AF] dark:text-[#64748B] mb-2 uppercase tracking-wider">
                <span>{isEn ? 'Milestone' : 'Rota Durağı'} {data.stepNumber || '✦'}</span>
                <span>·</span>
                <span>{data.domain || 'Core'}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{data.estimatedHours || 6} {isEn ? 'Hours' : 'Saat'}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#111318] dark:text-[#E9EDF3] leading-tight">
                {title}
              </h1>
            </div>

            {/* Why This Skill Matters */}
            <div className="p-5 rounded-3xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318]">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#2B660E] dark:text-[#B7F36B] mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{isEn ? 'Why needed for this project?' : 'Bu Projede Neden Gerekli?'}</span>
              </h3>
              <p className="text-sm text-[#68717D] dark:text-[#9CA3AF] leading-relaxed">
                {whyNeeded}
              </p>
            </div>

            {/* Prerequisites & Objectives (2 Column Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Learning Objectives */}
              {objectives && objectives.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B] font-bold">
                    {isEn ? 'Key Competencies' : 'Kazanılacak Beceriler'}
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#111318] dark:text-[#E9EDF3]">
                    {objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#2B660E] dark:text-[#B7F36B] mt-0.5 shrink-0" />
                        <span className="leading-snug">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {prerequisites && prerequisites.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B] font-bold">
                    {isEn ? 'Route Prerequisites' : 'Ön Koşul Bilgileri'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {prerequisites.map((req, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl text-xs font-mono border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-[#111318] dark:text-[#E9EDF3]"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Practical Project Assignment */}
            {practicalTask && (
              <div className="p-5 rounded-3xl border border-dashed border-[#CBD5E1] dark:border-[#3E4752] bg-[#FFFFFF] dark:bg-[#20242B]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#2B660E] dark:text-[#B7F36B] mb-2 font-bold">
                  {isEn ? 'Practical Milestone Assignment' : 'Uygulamalı Görev'}
                </h4>
                <p className="text-xs sm:text-sm text-[#111318] dark:text-[#E9EDF3] leading-relaxed">
                  "{practicalTask}"
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-5 sm:p-6 border-t border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] flex flex-wrap items-center justify-between gap-4">
            {/* If node contains nested submap */}
            {data.hasSubmap && data.submapId ? (
              <button
                type="button"
                onClick={handleEnterSubmap}
                className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] text-xs font-mono font-bold hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#2B660E]/15 dark:shadow-[#B7F36B]/20"
              >
                <span>{isEn ? 'Explore Submap (Alt Haritayı Keşfet)' : 'Alt Haritayı Keşfet'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleStartLearning}
                  className="py-2.5 px-5 rounded-xl bg-[#111318] dark:bg-[#E9EDF3] text-white dark:text-[#0B0D10] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isEn ? 'Start Milestone' : 'Öğrenmeye Başla'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAlreadyKnow}
                  className="py-2.5 px-4 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-[#111318] dark:text-[#E9EDF3] text-xs font-semibold hover:bg-[#F0F2F5] dark:hover:bg-[#20242B] transition-colors cursor-pointer"
                >
                  {isEn ? 'Already Know This' : 'Zaten Biliyorum'}
                </button>
              </div>
            )}

            {/* Test Knowledge Button */}
            <button
              type="button"
              onClick={handleTestKnowledge}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-[#2B660E] dark:border-[#B7F36B] text-[#2B660E] dark:text-[#B7F36B] hover:bg-[#2B660E]/10 dark:hover:bg-[#B7F36B]/15 text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{isEn ? 'Knowledge Check (Quiz)' : 'Bilgimi Test Et'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
