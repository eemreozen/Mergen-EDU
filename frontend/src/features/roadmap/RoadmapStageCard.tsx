import { CheckCircle2, Circle, Clock, Flame } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type RoadmapStage } from '@/lib/roadmapData'

interface RoadmapStageCardProps {
  stage: RoadmapStage
}

export function RoadmapStageCard({ stage }: RoadmapStageCardProps) {
  const { i18n, t } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const title = isEn ? stage.titleEn : stage.titleTr
  const summary = isEn ? stage.summaryEn : stage.summaryTr
  const tasks = isEn ? stage.tasksEn : stage.tasksTr

  // Local interactive checklist state
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>(() => {
    // If stage is 'completed', all are checked by default; if 'in_progress', first is checked
    const initial: Record<number, boolean> = {}
    tasks.forEach((_, idx) => {
      if (stage.status === 'completed') initial[idx] = true
      else if (stage.status === 'in_progress' && idx === 0) initial[idx] = true
      else initial[idx] = false
    })
    return initial
  })

  const toggleTask = (idx: number) => {
    setCompletedTasks(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }))
  }

  const getStatusBadge = () => {
    switch (stage.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider bg-[#2B660E]/10 dark:bg-[#B7F36B]/10 text-[#2B660E] dark:text-[#B7F36B] border border-[#2B660E]/20 dark:border-[#B7F36B]/30 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{t('roadmap.status.completed')}</span>
          </span>
        )
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
            <Flame className="w-3 h-3 animate-pulse" />
            <span>{t('roadmap.status.inProgress')}</span>
          </span>
        )
      case 'upcoming':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider bg-[#E3E7EC]/40 dark:bg-[#2A3038]/50 text-[#68717D] dark:text-[#9CA3AF] border border-[#E3E7EC] dark:border-[#2A3038]">
            <Clock className="w-3 h-3" />
            <span>{t('roadmap.status.upcoming')}</span>
          </span>
        )
    }
  }

  return (
    <div className="relative pl-8 sm:pl-10 pb-12 last:pb-2 group">
      {/* Vertical connecting line */}
      <div
        className="absolute left-[13px] sm:left-[17px] top-6 bottom-0 w-[2px] bg-[#E3E7EC] dark:bg-[#2A3038] group-last:hidden"
        aria-hidden="true"
      />

      {/* Node indicator */}
      <div
        className={`absolute left-0 top-1.5 w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all duration-200 border ${
          stage.status === 'completed'
            ? 'bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] border-[#2B660E] dark:border-[#B7F36B]'
            : stage.status === 'in_progress'
            ? 'bg-[#FFFFFF] dark:bg-[#171A20] text-[#111318] dark:text-[#E9EDF3] border-[#2B660E] dark:border-[#B7F36B] ring-4 ring-[#2B660E]/10 dark:ring-[#B7F36B]/15'
            : 'bg-[#FFFFFF] dark:bg-[#171A20] text-[#9CA3AF] dark:text-[#64748B] border-[#E3E7EC] dark:border-[#2A3038]'
        }`}
      >
        {stage.step}
      </div>

      {/* Card Content */}
      <div className="rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] p-5 sm:p-6 transition-all duration-200 hover:border-[#CBD5E1] dark:hover:border-[#3E4752] shadow-xs">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#111318] dark:text-[#E9EDF3]">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#9CA3AF] dark:text-[#64748B]">
              {stage.duration}
            </span>
            {getStatusBadge()}
          </div>
        </div>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-[#68717D] dark:text-[#9CA3AF] leading-relaxed mb-5">
          {summary}
        </p>

        {/* Practical Milestones Checklist */}
        <div className="mb-5">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B] mb-2.5">
            {t('roadmap.milestonesLabel')}
          </h4>
          <div className="space-y-2">
            {tasks.map((task, idx) => {
              const isChecked = !!completedTasks[idx]
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleTask(idx)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                    isChecked
                      ? 'bg-[#E3E7EC]/30 dark:bg-[#2A3038]/30 border-transparent text-[#68717D] dark:text-[#9CA3AF] line-through'
                      : 'bg-[#F7F8FA] dark:bg-[#111318] border-[#E3E7EC] dark:border-[#2A3038] text-[#111318] dark:text-[#E9EDF3] hover:border-[#CBD5E1] dark:hover:border-[#3E4752]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2B660E] dark:text-[#B7F36B]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#9CA3AF] dark:text-[#64748B]" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm leading-snug">
                    {task}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Core Concepts Badges */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B] mb-2">
            {t('roadmap.skillsLabel')}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {stage.skills.map(skill => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#F7F8FA] dark:bg-[#111318] border border-[#E3E7EC] dark:border-[#2A3038] text-[#68717D] dark:text-[#9CA3AF]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
