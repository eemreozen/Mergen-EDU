import { AnimatePresence, motion } from 'motion/react'
import {
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

export function NodeDetailPanel() {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const selectedNode = useRoadmapStore(s => s.selectedNode)
  const isDetailPanelOpen = useRoadmapStore(s => s.isDetailPanelOpen)
  const closeDetailPanel = useRoadmapStore(s => s.closeDetailPanel)
  const updateNodeStatus = useRoadmapStore(s => s.updateNodeStatus)
  const openQuiz = useRoadmapStore(s => s.openQuiz)
  const navigateToSubmap = useRoadmapStore(s => s.navigateToSubmap)

  if (!selectedNode || !selectedNode.data) return null

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
    // Requirements: "Zaten Biliyorum should not immediately mark the skill as fully verified. Instead, offer a short knowledge check."
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

  return (
    <AnimatePresence>
      {isDetailPanelOpen && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 right-0 bottom-0 z-40 w-full sm:w-[460px] bg-[#FFFFFF] dark:bg-[#171A20] border-l border-[#E3E7EC] dark:border-[#2A3038] shadow-2xl flex flex-col overflow-hidden text-left"
          role="dialog"
          aria-label={title}
        >
          {/* Top Panel Bar */}
          <div className="p-4 sm:p-5 border-b border-[#E3E7EC] dark:border-[#2A3038] flex items-center justify-between bg-[#F7F8FA] dark:bg-[#111318]">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B] border border-[#2B660E]/20 dark:border-[#B7F36B]/30">
                {data.category.toUpperCase()}
              </span>

              {data.status === 'completed' && (
                <span className="inline-flex items-center gap-1 text-xs text-[#2B660E] dark:text-[#B7F36B] font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Completed' : 'Tamamlandı'}</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={closeDetailPanel}
              className="p-1.5 rounded-lg text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:bg-[#E3E7EC]/40 dark:hover:bg-[#2A3038] transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
            {/* Title & Metadata */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111318] dark:text-[#E9EDF3] leading-snug">
                {title}
              </h2>
              <div className="mt-2 flex items-center gap-4 text-xs font-mono text-[#68717D] dark:text-[#9CA3AF]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{data.estimatedHours || 6} {isEn ? 'Hours Estimate' : 'Saat Tahmini'}</span>
                </span>
                {data.domain && <span>· {data.domain}</span>}
              </div>
            </div>

            {/* Why needed for project */}
            <div className="p-4 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318]">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#2B660E] dark:text-[#B7F36B] mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEn ? 'Why needed for AI Fitness App?' : 'Bu Projede Neden Gerekli?'}</span>
              </h3>
              <p className="text-xs text-[#68717D] dark:text-[#9CA3AF] leading-relaxed">
                {whyNeeded}
              </p>
            </div>

            {/* Prerequisites */}
            {prerequisites && prerequisites.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B] mb-2 font-semibold">
                  {isEn ? 'Prerequisites' : 'Ön Koşullar'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {prerequisites.map((req, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-[#111318] dark:text-[#E9EDF3]"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Objectives */}
            {objectives && objectives.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B] mb-2 font-semibold">
                  {isEn ? 'Learning Objectives' : 'Kazanılacak Beceriler'}
                </h4>
                <ul className="space-y-1.5 text-xs text-[#111318] dark:text-[#E9EDF3]">
                  {objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] mt-1.5 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Practical Exercise */}
            {practicalTask && (
              <div className="p-4 rounded-2xl border border-dashed border-[#CBD5E1] dark:border-[#3E4752] bg-[#FFFFFF] dark:bg-[#20242B]">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#2B660E] dark:text-[#B7F36B] mb-1.5 font-bold">
                  {isEn ? 'Practical Milestone Task' : 'Uygulamalı Proje Görevi'}
                </h4>
                <p className="text-xs text-[#111318] dark:text-[#E9EDF3] leading-relaxed">
                  "{practicalTask}"
                </p>
              </div>
            )}

            {/* Submap jump if available */}
            {data.hasSubmap && data.submapId && (
              <button
                type="button"
                onClick={() => {
                  navigateToSubmap(data.submapId!)
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2B660E]/40 dark:border-[#B7F36B]/40 bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B] hover:bg-[#2B660E]/20 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>{isEn ? 'Enter Machine Learning Submap' : 'Machine Learning Alt Haritasına Gir'}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Panel Actions Footer */}
          <div className="p-4 sm:p-5 border-t border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleStartLearning}
                className="py-2.5 px-3 rounded-xl bg-[#111318] dark:bg-[#E9EDF3] text-white dark:text-[#0B0D10] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isEn ? 'Start Learning' : 'Öğrenmeye Başla'}</span>
              </button>

              <button
                type="button"
                onClick={handleAlreadyKnow}
                className="py-2.5 px-3 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-[#111318] dark:text-[#E9EDF3] text-xs font-semibold hover:bg-[#F0F2F5] dark:hover:bg-[#20242B] transition-colors cursor-pointer"
              >
                {isEn ? 'Already Know This' : 'Zaten Biliyorum'}
              </button>
            </div>

            {/* Test Knowledge CTA */}
            <button
              type="button"
              onClick={handleTestKnowledge}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] text-xs font-bold hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{isEn ? 'Test My Knowledge (Interactive Quiz)' : 'Bilgimi Test Et (Değerlendirme)'}</span>
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
