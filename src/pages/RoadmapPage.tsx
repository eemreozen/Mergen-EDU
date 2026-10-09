import { motion } from 'motion/react'
import { ArrowLeft, Check, Code, Download, Layers, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { sampleRoadmapStages } from '@/lib/roadmapData'
import { RoadmapStageCard } from '@/features/roadmap/RoadmapStageCard'

export function RoadmapPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const isEn = i18n.language.startsWith('en')

  const [copied, setCopied] = useState(false)

  // Retrieve project idea passed from navigation state or fallback
  const userIdea =
    (location.state as { idea?: string } | null)?.idea ||
    (isEn
      ? 'A full-stack e-commerce application with Spring Boot, React, JWT authentication and PostgreSQL.'
      : 'Spring Boot ve React ile JWT kimlik doğrulamalı ve PostgreSQL destekli modern e-ticaret platformu.')

  const handleExport = () => {
    const text = `ProjectPath Roadmap:\nProject: ${userIdea}\n\nStages:\n` +
      sampleRoadmapStages
        .map(
          s =>
            `${s.step}. ${isEn ? s.titleEn : s.titleTr} (${s.duration})\n  - ` +
            (isEn ? s.tasksEn : s.tasksTr).join('\n  - ')
        )
        .join('\n\n')

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
    >
      {/* Back button & Eyebrow */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-xs font-medium text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:border-[#CBD5E1] dark:hover:border-[#3E4752] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('roadmap.backButton')}</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2B660E]/20 dark:border-[#B7F36B]/20 bg-[#2B660E]/5 dark:bg-[#B7F36B]/5 text-[11px] font-mono uppercase tracking-wider text-[#2B660E] dark:text-[#B7F36B] font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>{t('roadmap.previewBadge')}</span>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] p-6 sm:p-8 mb-10 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B]">
            <Code className="w-4 h-4 text-[#2B660E] dark:text-[#B7F36B]" />
            <span>{t('roadmap.projectGoalLabel')}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111318] dark:text-[#E9EDF3] leading-snug">
            "{userIdea}"
          </h1>

          {/* Metadata badges */}
          <div className="pt-4 border-t border-[#E3E7EC] dark:border-[#2A3038] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#68717D] dark:text-[#9CA3AF]">
              <div>
                <span className="text-[#9CA3AF] dark:text-[#64748B]">{t('roadmap.estimatedDuration')}: </span>
                <span className="font-semibold text-[#111318] dark:text-[#E9EDF3]">
                  {t('roadmap.estimatedDurationValue')}
                </span>
              </div>
              <span className="hidden sm:inline text-[#E3E7EC] dark:text-[#2A3038]">|</span>
              <div>
                <span className="text-[#9CA3AF] dark:text-[#64748B]">{t('roadmap.difficultyLevel')}: </span>
                <span className="font-semibold text-[#111318] dark:text-[#E9EDF3]">
                  {t('roadmap.difficultyLevelValue')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] text-xs font-mono text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:border-[#CBD5E1] dark:hover:border-[#3E4752] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#2B660E] dark:text-[#B7F36B]" /> : <Download className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı!' : t('roadmap.actionExport')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stages Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-[#2B660E] dark:text-[#B7F36B]" />
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#111318] dark:text-[#E9EDF3]">
            {t('roadmap.stagesHeading')}
          </h2>
        </div>
        <span className="text-xs font-mono text-[#9CA3AF] dark:text-[#64748B]">
          4 {isEn ? 'Phases' : 'Aşama'}
        </span>
      </div>

      {/* Vertical Stages List */}
      <div className="mb-10">
        {sampleRoadmapStages.map((stage) => (
          <RoadmapStageCard key={stage.id} stage={stage} />
        ))}
      </div>

      {/* Bottom Editorial Preview Notice */}
      <div className="p-4 sm:p-5 rounded-2xl border border-dashed border-[#CBD5E1] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318]/40 text-center">
        <p className="text-xs sm:text-sm text-[#68717D] dark:text-[#9CA3AF] leading-relaxed max-w-xl mx-auto">
          {t('roadmap.previewNotice')}
        </p>
      </div>
    </motion.div>
  )
}
