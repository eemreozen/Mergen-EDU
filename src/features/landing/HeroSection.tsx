import { motion } from 'motion/react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { AuthModal } from '@/components/shared/AuthModal'
import { LanguageSelector } from '@/components/shared/LanguageSelector'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

interface HeroSectionProps {
  externalIdea?: string
  onIdeaChange?: (idea: string) => void
}

export function HeroSection({ externalIdea, onIdeaChange }: HeroSectionProps) {
  const { t, i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')
  const navigate = useNavigate()

  const [localIdea, setLocalIdea] = useState('')
  const [isAuthOpen, setIsAuthOpen] = useState(false)

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
    navigate('/roadmap', { state: { idea: trimmed } })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleStartRoadmap()
    }
  }

  const starterIdeas = [
    {
      label: t('hero.suggestion1'),
      prompt: 'Spring Boot ve React kullanarak JWT tabanlı kimlik doğrulama, sepet yönetimi ve sipariş takibi içeren tam teşekküllü bir e-ticaret platformu geliştirmek istiyorum.',
    },
    {
      label: t('hero.suggestion2'),
      prompt: 'Go ve WebSockets ile dağıtık mimaride çalışan, oda bazlı gerçek zamanlı bir mesajlaşma ve bildirim sistemi geliştirmek istiyorum.',
    },
    {
      label: t('hero.suggestion3'),
      prompt: 'Rust diliyle geliştirilmiş, sistem kaynaklarını izleyen ve JSON/YAML çıktıları üreten yüksek performanslı bir komut satırı (CLI) aracı geliştirmek istiyorum.',
    },
    {
      label: t('hero.suggestion4'),
      prompt: 'Docker, GitHub Actions ve AWS kullanarak otomatik test ve dağıtım yapan modern bir CI/CD pipeline mimarisi inşa etmek istiyorum.',
    },
  ]

  const isValid = projectIdea.trim().length > 0

  return (
    <>
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 min-h-[82vh] flex flex-col justify-center items-center pt-8 pb-16">
        {/* Subtle Top Eyebrow & Slogan */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-xs font-mono uppercase tracking-wider text-[#68717D] dark:text-[#9CA3AF] mb-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] animate-pulse" />
            <span>{t('hero.eyebrow')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#111318] dark:text-[#E9EDF3] leading-tight">
            <span>{t('hero.titleLine1')} </span>
            <span className="text-[#2B660E] dark:text-[#B7F36B]">{t('hero.titleLine2')}</span>
          </h1>
        </motion.div>

        {/* The Non-Traditional Center Workspace Layout:
            [Enlarged Logo (Left)] --- [Center Idea Input Box] --- [Controls Stack (Right)] */}
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8">
          
          {/* 1. LEFT: Enlarged Logo */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center lg:items-center text-center lg:w-48 shrink-0 pt-2"
          >
            {/* Enlarged Geometric Logo Card */}
            <div className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#FFFFFF] dark:bg-[#171A20] border-2 border-[#E3E7EC] dark:border-[#2A3038] hover:border-[#2B660E] dark:hover:border-[#B7F36B] shadow-xl flex items-center justify-center transition-all duration-300">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-300 group-hover:scale-105"
                aria-hidden="true"
              >
                {/* Node 1 */}
                <circle cx="7" cy="24" r="3" fill="currentColor" className="text-[#9CA3AF] dark:text-[#64748B]" />
                {/* Node 2 */}
                <circle cx="16" cy="8" r="3.5" fill="#2B660E" className="dark:fill-[#B7F36B]" />
                {/* Node 3 */}
                <circle cx="25" cy="20" r="3" fill="currentColor" className="text-[#9CA3AF] dark:text-[#64748B]" />
                
                {/* Geometric connecting path */}
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
            <div className="mt-3">
              <span className="font-mono font-bold tracking-tight text-xl text-[#111318] dark:text-[#E9EDF3] lowercase">
                project<span className="text-[#2B660E] dark:text-[#B7F36B]">path</span>
              </span>
              <p className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF] mt-0.5">
                Fikrini. İnşa Et.
              </p>
            </div>
          </motion.div>

          {/* 2. CENTER: The Project Idea Input Box */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-2xl flex-1 flex flex-col"
          >
            <div className="relative rounded-2xl border-2 border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-xl p-4 sm:p-5 text-left transition-all duration-200 focus-within:border-[#2B660E] dark:focus-within:border-[#B7F36B] focus-within:ring-4 focus-within:ring-[#2B660E]/10 dark:focus-within:ring-[#B7F36B]/15">
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
                className="w-full bg-transparent border-0 outline-none resize-none text-sm sm:text-base text-[#111318] dark:text-[#E9EDF3] placeholder:text-[#9CA3AF] dark:placeholder:text-[#64748B] min-h-[110px] leading-relaxed font-normal"
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

            {/* Quick Inspiration Pills */}
            <div className="mt-4 text-left">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B] mb-2">
                {t('hero.quickSuggestionsTitle')}
              </p>
              <div className="flex flex-wrap gap-2">
                {starterIdeas.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIdea(item.prompt)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF]/70 dark:bg-[#171A20]/70 text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:border-[#CBD5E1] dark:hover:border-[#3E4752] transition-colors cursor-pointer text-left"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 3. RIGHT: Controls Column (Sign in, Language, Dark/Light Mode) */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full lg:w-56 shrink-0 flex flex-col gap-3"
          >
            {/* Top item: "Daha önce geldin mi?" + Giriş Yap */}
            <div className="rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] p-3.5 shadow-sm">
              <div className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF] mb-2">
                {isEn ? 'Been here before?' : 'Daha önce geldin mi?'}
              </div>
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-[#111318] dark:bg-[#E9EDF3] text-white dark:text-[#0B0D10] hover:bg-[#2A3038] dark:hover:bg-white transition-colors cursor-pointer text-center"
              >
                {t('nav.signIn')}
              </button>
            </div>

            {/* Middle item: Language Selector */}
            <div className="rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] p-3 shadow-sm flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
                {isEn ? 'Language' : 'Dil'}
              </span>
              <LanguageSelector />
            </div>

            {/* Bottom item: Theme Toggle */}
            <div className="rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] p-3 shadow-sm flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
                {isEn ? 'Theme' : 'Tema'}
              </span>
              <ThemeToggle />
            </div>
          </motion.div>

        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
