import { ArrowLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageSelector } from '@/components/shared/LanguageSelector'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useRoadmapStore } from '@/store/useRoadmapStore'

export function CanvasHeader() {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const currentLevel = useRoadmapStore(s => s.currentLevel)
  const projectName = useRoadmapStore(s => s.projectName)
  const navigateToRoot = useRoadmapStore(s => s.navigateToRoot)
  const resetDemo = useRoadmapStore(s => s.resetDemo)
  const rootNodes = useRoadmapStore(s => s.rootNodes)
  const mlSubmapNodes = useRoadmapStore(s => s.mlSubmapNodes)

  // Calculate overall progress percentage
  const allNodes = currentLevel === 'root' ? rootNodes : mlSubmapNodes
  const completedCount = allNodes.filter(n => n.data.status === 'completed').length
  const totalCount = allNodes.length
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  return (
    <header className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
      {/* Top-Left: Logo, Project Name, Breadcrumbs */}
      <div className="flex items-center gap-3 p-1.5 px-3 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF]/90 dark:bg-[#171A20]/90 backdrop-blur-md shadow-lg pointer-events-auto">
        <Logo iconOnly className="w-8 h-8" />

        <div className="h-4 w-[1px] bg-[#E3E7EC] dark:bg-[#2A3038]" />

        <div className="flex items-center gap-2 text-xs font-mono">
          <Link
            to="/"
            className="text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] transition-colors"
            title={isEn ? 'Return to Home' : 'Ana Sayfaya Dön'}
          >
            Mergen
          </Link>

          <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] dark:text-[#64748B]" />

          {currentLevel === 'root' ? (
            <span className="font-bold text-[#111318] dark:text-[#E9EDF3] flex items-center gap-1.5">
              <span>{projectName}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B]">
                {isEn ? 'Main Map' : 'Ana Harita'}
              </span>
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={navigateToRoot}
                className="text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] transition-colors cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>{projectName}</span>
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF] dark:text-[#64748B]" />

              <span className="font-bold text-[#2B660E] dark:text-[#B7F36B] flex items-center gap-1">
                <span>Machine Learning</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#B7F36B]/20 text-[#2B660E] dark:text-[#B7F36B]">
                  {isEn ? 'Submap' : 'Alt Harita'}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top-Right: Progress meter, Reset Demo, Theme, Language, Avatar */}
      <div className="flex items-center gap-2.5 p-1.5 px-3 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF]/90 dark:bg-[#171A20]/90 backdrop-blur-md shadow-lg pointer-events-auto">
        {/* Progress meter */}
        <div className="hidden sm:flex items-center gap-2.5 pr-2 border-r border-[#E3E7EC] dark:border-[#2A3038]">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B]">
              {isEn ? 'Progress' : 'İlerleme'}
            </div>
            <div className="text-xs font-mono font-bold text-[#111318] dark:text-[#E9EDF3]">
              %{progressPercent}
            </div>
          </div>
          <div className="w-16 h-2 rounded-full bg-[#E3E7EC] dark:bg-[#2A3038] overflow-hidden">
            <div
              className="h-full bg-[#2B660E] dark:bg-[#B7F36B] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Reset Demo button */}
        <button
          type="button"
          onClick={resetDemo}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#20242B] text-xs font-mono text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:border-[#CBD5E1] dark:hover:border-[#3E4752] transition-colors cursor-pointer"
          title={isEn ? 'Reset Demo State' : 'Demoyu Sıfırla'}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{isEn ? 'Reset Demo' : 'Demoyu Sıfırla'}</span>
        </button>

        {/* Theme and Language */}
        <LanguageSelector />
        <ThemeToggle />

        {/* User avatar placeholder */}
        <div className="w-7 h-7 rounded-xl bg-[#2B660E]/20 dark:bg-[#B7F36B]/20 border border-[#2B660E]/30 dark:border-[#B7F36B]/30 flex items-center justify-center font-mono text-xs font-bold text-[#2B660E] dark:text-[#B7F36B]">
          EÖ
        </div>
      </div>
    </header>
  )
}
