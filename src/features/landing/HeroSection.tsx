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
import { ProjectAdvisor } from '@/components/shared/ProjectAdvisorModal'

interface HeroSectionProps {
  externalIdea?: string
  onIdeaChange?: (idea: string) => void
}

export function HeroSection({
  externalIdea,
  onIdeaChange,
}: HeroSectionProps) {
  const { t, i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const [localIdea, setLocalIdea] = useState('')
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isTourOpen, setIsTourOpen] = useState(false)
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false)

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

  // Non-technical, human starter suggestions
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
      label: isEn ? 'Personal Budget Tracker' : 'Aylık Bütçe Takibi',
      prompt: isEn
        ? 'I want to build a personal finance tracker that organizes monthly income and expenses.'
        : 'Aylık gelir ve giderlerimi kategorilere ayırıp bana tasarruf hedefleri öneren pratik bir bütçe takip uygulaması geliştirmek istiyorum.',
    },
  ]

  const isValid = projectIdea.trim().length > 0

  return (
    <>
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-center items-center my-auto py-4 sm:py-8 overflow-visible">
        
        {/* SYMMETRICAL 3-COLUMN WORKSPACE: LEFT (Wizard + Logo) — CENTER (Input Box) — RIGHT (Sign In + Preferences + Advisor) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Small Wizard Button + (Logo Card & Advisor Figure Side-by-Side) + Brand info (Cols 1-3) */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3.5"
          >
            {/* Küçük Sihirbazı Başlat Butonu (Logonun üstünde) */}
            <button
              id="tour-wizard-box"
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2B660E]/30 dark:border-[#B7F36B]/30 bg-[#FFFFFF] dark:bg-[#171A20] hover:bg-[#2B660E]/10 dark:hover:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B] text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'Start Wizard' : 'Sihirbazı Başlat'}</span>
            </button>

            {/* LOGO & DANIŞMAN YAN YANA */}
            <div className="flex items-end gap-3 sm:gap-4">
              {/* ProjectPath Geometrik Logo Kartı */}
              <div className="relative group w-20 h-20 sm:w-22 sm:h-22 rounded-3xl bg-[#FFFFFF] dark:bg-[#171A20] border-2 border-[#E3E7EC] dark:border-[#2A3038] hover:border-[#2B660E] dark:hover:border-[#B7F36B] shadow-xl flex items-center justify-center transition-all duration-300">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 sm:w-13 sm:h-13 transition-transform duration-300 group-hover:scale-105"
                  aria-hidden="true"
                >
                  <circle cx="7" cy="24" r="3" fill="currentColor" className="text-[#9CA3AF] dark:text-[#64748B]" />
                  <circle cx="16" cy="8" r="3.5" fill="#2B660E" className="dark:fill-[#B7F36B]" />
                  <circle cx="25" cy="20" r="3" fill="currentColor" className="text-[#9CA3AF] dark:text-[#64748B]" />
                  <path d="M9 22L14.5 10.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[#9CA3AF] dark:text-[#64748B]" />
                  <path d="M17.5 10L23 18.5" stroke="#2B660E" strokeWidth="3" strokeLinecap="round" className="dark:stroke-[#B7F36B]" />
                </svg>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] border-2 border-white dark:border-[#171A20]" />
              </div>

              {/* Danışman Rehber Logosu (Tıkla Planlayalım Balonu ile) */}
              <TeacherAdvisorFigure
                size="md"
                onClick={() => setIsAdvisorOpen(true)}
                showBubble={true}
                showCaption={false}
              />
            </div>

            {/* Wordmark & Tagline */}
            <div>
              <span className="font-mono font-bold tracking-tight text-2xl text-[#111318] dark:text-[#E9EDF3] lowercase">
                project<span className="text-[#2B660E] dark:text-[#B7F36B]">path</span>
              </span>
              <p className="text-xs font-mono text-[#68717D] dark:text-[#9CA3AF] mt-0.5 font-medium">
                Fikrini. İnşa Et.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B]">
              <span>{isEn ? 'Project-Based Learning' : 'Proje Odaklı Öğrenme'}</span>
            </div>
          </motion.div>

          {/* CENTER COLUMN: Main Project Idea Input + Inspiration Chips (Cols 4-9) */}
          <div className="lg:col-span-6 flex flex-col items-center text-center">
            
            {/* Main Headline */}
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#111318] dark:text-[#E9EDF3] leading-tight">
                <span>{t('hero.titleLine1')} </span>
                <span className="text-[#2B660E] dark:text-[#B7F36B]">{t('hero.titleLine2')}</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#68717D] dark:text-[#9CA3AF] mt-1 font-mono">
                {isEn
                  ? 'State your project idea. Climb your tailored learning roadmap.'
                  : 'Aklındaki projeyi yaz, tırmanış haritanı keşfet.'}
              </p>
            </div>

            {/* The Project Idea Box */}
            <motion.div
              id="tour-idea-input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl"
            >
              <div className="relative rounded-3xl border-2 border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-2xl p-4 sm:p-5 flex flex-col justify-between text-left transition-all focus-within:border-[#2B660E] dark:focus-within:border-[#B7F36B] focus-within:ring-4 focus-within:ring-[#2B660E]/10 dark:focus-within:ring-[#B7F36B]/15">
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
                  className="w-full bg-transparent border-0 outline-none resize-none text-sm sm:text-base text-[#111318] dark:text-[#E9EDF3] placeholder:text-[#9CA3AF] dark:placeholder:text-[#64748B] min-h-[105px] leading-relaxed font-normal py-1"
                />

                <div className="pt-3 border-t border-[#E3E7EC]/60 dark:border-[#2A3038]/60 flex items-center justify-between gap-3">
                  <span className="text-xs text-[#9CA3AF] dark:text-[#64748B] font-mono hidden sm:inline">
                    {t('hero.hintText')} · ⌘+Enter
                  </span>

                  <button
                    type="button"
                    disabled={!isValid}
                    onClick={handleStartRoadmap}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 select-none ${
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
            </motion.div>

            {/* Non-Technical Quick Inspiration Chips */}
            <div id="tour-inspiration-chips" className="mt-4 w-full max-w-xl text-left">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B]">
                  {t('hero.quickSuggestionsTitle')}
                </span>

                {/* Subtle Links */}
                <div className="flex items-center gap-2 text-xs font-mono text-[#9CA3AF] dark:text-[#64748B]">
                  <button
                    type="button"
                    onClick={handleStartFitnessDemo}
                    className="hover:text-[#111318] dark:hover:text-[#E9EDF3] transition-colors cursor-pointer hover:underline"
                  >
                    <span>⚡️ {isEn ? 'Fitness Demo' : 'Fitness Demosu'}</span>
                  </button>
                  <span>·</span>
                  <Link
                    to="/canvas"
                    className="hover:text-[#111318] dark:hover:text-[#E9EDF3] transition-colors inline-flex items-center gap-0.5 hover:underline"
                  >
                    <Compass className="w-3 h-3" />
                    <span>{isEn ? 'Canvas →' : 'Kanvas →'}</span>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {starterIdeas.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIdea(item.prompt)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer text-left ${
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
          </div>

          {/* RIGHT COLUMN: GİRİŞ YAP & TERCİHLER (Ortadaki metin kutusuna göre tam ortalanmış) (Cols 10-12) */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-3 flex flex-col items-center lg:items-center justify-center space-y-3.5 my-auto"
          >
            {/* GİRİŞ YAP BUTONU */}
            <div className="w-full max-w-[220px] p-3 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-md text-left flex flex-col gap-2">
              <div className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
                {isEn ? 'Already a member?' : 'Daha önce geldin mi?'}
              </div>
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[#111318] dark:bg-[#E9EDF3] text-white dark:text-[#0B0D10] hover:bg-[#2B660E] dark:hover:bg-[#B7F36B] transition-colors cursor-pointer text-center shadow-xs active:scale-95"
              >
                {t('nav.signIn')}
              </button>
            </div>

            {/* TERCİHLER KISMI */}
            <div className="w-full max-w-[220px] p-2.5 px-3 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-sm flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
                {isEn ? 'Preferences:' : 'Tercihler:'}
              </span>
              <div className="flex items-center gap-1.5">
                <LanguageSelector />
                <div className="h-3.5 w-[1px] bg-[#E3E7EC] dark:bg-[#2A3038]" />
                <ThemeToggle />
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Onboarding Knowledge Assessment Modal */}
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />

      {/* Guided Tour Wizard Walkthrough */}
      <GuidedTourWizard isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

      {/* Interactive Project Advisor (Danışmana tıklandığında açılan chat penceresi) */}
      <ProjectAdvisor
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        hideFloatingTrigger
        onSelectPrompt={(prompt) => setIdea(prompt)}
      />
    </>
  )
}
