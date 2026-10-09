import { motion } from 'motion/react'
import { ArrowRight, Compass, Sparkles, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AuthModal } from '@/components/shared/AuthModal'
import { LanguageSelector } from '@/components/shared/LanguageSelector'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { OnboardingModal } from '@/components/assessment/OnboardingModal'
import { GuidedTourWizard } from '@/components/landing/GuidedTourWizard'
import { TeacherAdvisorFigure } from '@/components/landing/TeacherAdvisorFigure'

interface HeroSectionProps {
  externalIdea?: string
  onIdeaChange?: (idea: string) => void
  onOpenAdvisor?: () => void
}

export function HeroSection({
  externalIdea,
  onIdeaChange,
  onOpenAdvisor,
}: HeroSectionProps) {
  const { t, i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const [localIdea, setLocalIdea] = useState('')
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isTourOpen, setIsTourOpen] = useState(false)

  const projectIdea = externalIdea !== undefined ? externalIdea : localIdea

  const setIdea = (val: string) => {
    if (onIdeaChange) {
      onIdeaChange(val)
    } else {
      setLocalIdea(val)
    }
  }

  const handleStartRoadmap = () => {
    const trimmed = projectIdea.trim()
    if (!trimmed) return
    setIsOnboardingOpen(true)
  }

  const handleStartFitnessDemo = () => {
    const fitnessPrompt = isEn
      ? 'I want to build an AI-powered fitness and nutrition recommendation application.'
      : 'Egzersiz hareketlerimi ve günlük beslenmemi analiz eden akıllı bir fitness asistanı geliştirmek istiyorum.'
    setIdea(fitnessPrompt)
    setIsOnboardingOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleStartRoadmap()
    }
  }

  // Non-technical, human, goal-oriented starter ideas
  const starterIdeas = [
    {
      label: isEn ? 'Smart Fitness Coach' : 'Akıllı Fitness Koçu',
      prompt: isEn
        ? 'I want to build an AI workout coach that analyzes exercises and daily nutrition.'
        : 'Egzersiz hareketlerimi ve günlük beslenmemi analiz eden akıllı bir fitness asistanı geliştirmek istiyorum.',
      highlight: true,
    },
    {
      label: isEn ? 'Online Store' : 'Kendi Online Mağazam',
      prompt: isEn
        ? 'I want to build an online shopping website where customers can browse items and place orders.'
        : 'Kullanıcıların ürün inceleyip sepetine ekleyebileceği ve sipariş verebileceği modern bir alışveriş platformu geliştirmek istiyorum.',
    },
    {
      label: isEn ? 'Live Chat with Friends' : 'Arkadaşlarla Canlı Sohbet',
      prompt: isEn
        ? 'I want to build a real-time messaging application where friends can create groups and chat.'
        : 'Arkadaşların grup oluşturup anlık mesajlaşabildiği ve dosya paylaşabildiği güvenli bir sohbet uygulaması yapmak istiyorum.',
    },
    {
      label: isEn ? 'Personal Budget Tracker' : 'Aylık Bütçe ve Harcama Takibi',
      prompt: isEn
        ? 'I want to build a personal finance tracker that organizes monthly income and expenses.'
        : 'Aylık gelir ve giderlerimi kategorilere ayırıp bana tasarruf hedefleri öneren pratik bir bütçe takip uygulaması geliştirmek istiyorum.',
    },
  ]

  const isValid = projectIdea.trim().length > 0

  return (
    <>
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 min-h-[86vh] flex flex-col justify-between items-center pt-6 pb-0 overflow-visible">
        
        {/* TOP SECTION: Wizard Banner & Headline */}
        <div className="w-full flex flex-col items-center">
          
          {/* 1. "Sihirbazı Başlat" Box (Prompted by user: Kafan mı karıştı? Nasıl kullanacağını öğren) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl mx-auto mb-6 p-3 sm:p-4 rounded-3xl border border-[#2B660E]/30 dark:border-[#B7F36B]/30 bg-gradient-to-r from-[#2B660E]/5 via-[#FFFFFF]/90 to-[#2B660E]/10 dark:from-[#B7F36B]/10 dark:via-[#171A20] dark:to-[#B7F36B]/5 shadow-lg backdrop-blur-md flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] flex items-center justify-center font-bold shadow-md shrink-0">
                <Wand2 className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2B660E] dark:text-[#B7F36B] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>{isEn ? 'START THE WIZARD' : 'SİHİRBAZI BAŞLAT'}</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#111318] dark:text-[#E9EDF3]">
                  {isEn
                    ? 'Confused? Learn how to use ProjectPath in 30 seconds'
                    : 'Kafan mı karıştı? Nasıl kullanacağını öğren'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#111318] dark:bg-[#E9EDF3] text-white dark:text-[#0B0D10] hover:bg-[#2B660E] dark:hover:bg-[#B7F36B] text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md active:scale-95"
            >
              {isEn ? 'Start Tour →' : 'Turu Başlat →'}
            </button>
          </motion.div>

          {/* 2. Main Title (No "kendi yolunu oluştur" eyebrow as requested) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#111318] dark:text-[#E9EDF3] leading-tight">
              <span>{t('hero.titleLine1')} </span>
              <span className="text-[#2B660E] dark:text-[#B7F36B]">{t('hero.titleLine2')}</span>
            </h1>
          </motion.div>

          {/* 3. CENTER AREA: Enlarged Logo Perfectly Centered Above/In-Line with Text Input Box */}
          <div className="w-full max-w-2xl flex flex-col items-center">
            
            {/* Enlarged Geometric Logo (Placed right in the center above the input box) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="flex flex-col items-center text-center mb-4"
            >
              <div className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#FFFFFF] dark:bg-[#171A20] border-2 border-[#E3E7EC] dark:border-[#2A3038] hover:border-[#2B660E] dark:hover:border-[#B7F36B] shadow-2xl flex items-center justify-center transition-all duration-300">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-300 group-hover:scale-105"
                  aria-hidden="true"
                >
                  <circle cx="7" cy="24" r="3" fill="currentColor" className="text-[#9CA3AF] dark:text-[#64748B]" />
                  <circle cx="16" cy="8" r="3.5" fill="#2B660E" className="dark:fill-[#B7F36B]" />
                  <circle cx="25" cy="20" r="3" fill="currentColor" className="text-[#9CA3AF] dark:text-[#64748B]" />
                  
                  <path
                    d="M9 22L14.5 10.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="text-[#9CA3AF] dark:text-[#64748B]"
                  />
                  <path
                    d="M17.5 10L23 18.5"
                    stroke="#2B660E"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="dark:stroke-[#B7F36B]"
                  />
                </svg>

                {/* Ambient micro accent corner dot */}
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] border-2 border-white dark:border-[#171A20]" />
              </div>

              {/* Wordmark and Slogan */}
              <div className="mt-2.5">
                <span className="font-mono font-bold tracking-tight text-xl text-[#111318] dark:text-[#E9EDF3] lowercase">
                  project<span className="text-[#2B660E] dark:text-[#B7F36B]">path</span>
                </span>
                <p className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
                  Fikrini. İnşa Et.
                </p>
              </div>
            </motion.div>

            {/* 4. The Central Project Idea Input Box */}
            <motion.div
              id="tour-idea-input"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="w-full"
            >
              <div className="relative rounded-3xl border-2 border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-2xl p-4 sm:p-5 text-left transition-all duration-200 focus-within:border-[#2B660E] dark:focus-within:border-[#B7F36B] focus-within:ring-4 focus-within:ring-[#2B660E]/10 dark:focus-within:ring-[#B7F36B]/15">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="project-idea-input"
                    className="text-xs font-mono font-semibold uppercase tracking-wider text-[#68717D] dark:text-[#9CA3AF] flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#2B660E] dark:text-[#B7F36B]" />
                    <span>{isEn ? 'What do you want to build?' : 'Ne hakkında proje geliştirmek istiyorsun?'}</span>
                  </label>
                  <span className="text-[11px] font-mono text-[#9CA3AF] dark:text-[#64748B]">
                    {projectIdea.length} {t('hero.charCount')}
                  </span>
                </div>

                <textarea
                  id="project-idea-input"
                  rows={4}
                  value={projectIdea}
                  onChange={e => setIdea(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('hero.inputPlaceholder')}
                  className="w-full bg-transparent border-0 outline-none resize-none text-sm sm:text-base text-[#111318] dark:text-[#E9EDF3] placeholder:text-[#9CA3AF] dark:placeholder:text-[#64748B] min-h-[105px] leading-relaxed font-normal"
                />

                <div className="pt-3 border-t border-[#E3E7EC]/60 dark:border-[#2A3038]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-[#9CA3AF] dark:text-[#64748B] font-mono hidden sm:inline">
                    {t('hero.hintText')} · ⌘+Enter
                  </span>

                  <button
                    type="button"
                    disabled={!isValid}
                    onClick={handleStartRoadmap}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 select-none ${
                      isValid
                        ? 'bg-[#2B660E] hover:bg-[#22520B] dark:bg-[#B7F36B] dark:hover:bg-[#C5F785] text-white dark:text-[#0B0D10] cursor-pointer shadow-md shadow-[#2B660E]/15 dark:shadow-[#B7F36B]/20 active:scale-[0.98]'
                        : 'bg-[#E3E7EC] dark:bg-[#2A3038] text-[#9CA3AF] dark:text-[#64748B] cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>{t('hero.submitButton')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 5. Non-Technical Quick Inspiration Pills */}
              <div id="tour-inspiration-chips" className="mt-4 text-left">
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B] mb-2">
                  {t('hero.quickSuggestionsTitle')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {starterIdeas.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setIdea(item.prompt)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-colors cursor-pointer text-left ${
                        item.highlight
                          ? 'border-[#2B660E]/50 dark:border-[#B7F36B]/50 bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B] font-bold'
                          : 'border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF]/70 dark:bg-[#171A20]/70 text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:border-[#CBD5E1] dark:hover:border-[#3E4752]'
                      }`}
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Controls Bar: Sign In, Language, Dark/Light Mode */}
              <div className="mt-5 p-2.5 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF]/80 dark:bg-[#171A20]/80 backdrop-blur-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
                    {isEn ? 'Already a member?' : 'Daha önce giriş yaptın mı?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAuthOpen(true)}
                    className="px-2.5 py-1 rounded-lg font-semibold bg-[#111318] dark:bg-[#E9EDF3] text-white dark:text-[#0B0D10] hover:bg-[#2A3038] dark:hover:bg-white transition-colors cursor-pointer"
                  >
                    {t('nav.signIn')}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <LanguageSelector />
                  <div className="h-4 w-[1px] bg-[#E3E7EC] dark:bg-[#2A3038]" />
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* BOTTOM SECTION: Connecting Expedition Path & The Lab-Coat Teacher Standing on the Footer Line */}
        <div className="w-full relative flex flex-col items-center mt-8">
          
          {/* Gentle SVG Expedition Path winding down from workspace toward the teacher */}
          <div className="w-full max-w-sm h-12 flex items-center justify-center pointer-events-none opacity-40">
            <svg
              viewBox="0 0 240 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-[#2B660E] dark:text-[#B7F36B]"
            >
              <path
                d="M120 0 C 120 20, 160 25, 120 48"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
              <circle cx="120" cy="46" r="3" fill="currentColor" />
            </svg>
          </div>

          {/* Discreet, subtle text-only links for Demo & Canvas (Moved from top to bottom as requested) */}
          <div className="mb-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#9CA3AF] dark:text-[#64748B]">
            <button
              type="button"
              onClick={handleStartFitnessDemo}
              className="hover:text-[#111318] dark:hover:text-[#E9EDF3] transition-colors cursor-pointer underline-offset-4 hover:underline"
            >
              <span>{isEn ? '⚡️ Run Demo Scenario: AI Fitness' : '⚡️ Demo Senaryosu: AI Fitness Uygulaması'}</span>
            </button>

            <span>·</span>

            <Link
              to="/canvas"
              className="hover:text-[#111318] dark:hover:text-[#E9EDF3] transition-colors inline-flex items-center gap-1 underline-offset-4 hover:underline"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isEn ? 'Direct to Canvas →' : 'Doğrudan Kanvasa Git →'}</span>
            </Link>
          </div>

          {/* TEACHER ADVISOR CHARACTER (Standing with feet flush on the bottom line!) */}
          <div className="relative translate-y-[2px]">
            <TeacherAdvisorFigure
              onClick={onOpenAdvisor || (() => setIsTourOpen(true))}
            />
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Onboarding Knowledge Assessment Modal */}
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />

      {/* Guided Tour Wizard Walkthrough */}
      <GuidedTourWizard isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </>
  )
}
