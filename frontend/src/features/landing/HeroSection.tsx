import { motion } from 'motion/react'
import { ArrowRight, Compass, Wand2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { AuthModal } from '@/components/shared/AuthModal'
import { LanguageSelector } from '@/components/shared/LanguageSelector'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { api } from '@/api/client'
import { GuidedTourWizard } from '@/components/landing/GuidedTourWizard'

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
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [isTourOpen, setIsTourOpen] = useState(false)

  const projectIdea = externalIdea !== undefined ? externalIdea : localIdea

  const setIdea = (val: string) => {
    if (onIdeaChange) {
      onIdeaChange(val)
    } else {
      setLocalIdea(val)
    }
  }

  const handleStartRoadmap = async () => {
    if (creating || projectIdea.trim().length < 10) return
    setCreating(true); setError('')
    try {
      const project = await api.createProject(projectIdea.trim(), isEn ? 'en' : 'tr')
      navigate(`/learn?project=${project.id}`)
    } catch (err) { setError(err instanceof Error ? err.message : 'Proje oluşturulamadı.') }
    finally { setCreating(false) }
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

  const isValid = projectIdea.trim().length >= 10

  return (
    <>
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-start items-center py-6 sm:py-8 overflow-visible">
        <div className="w-full text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#111318] dark:text-[#E9EDF3] leading-tight">
            <span>{t('hero.titleLine1')} </span>
            <span className="text-[#2B660E] dark:text-[#B7F36B]">{t('hero.titleLine2')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#68717D] dark:text-[#9CA3AF] mt-2 font-mono">
            {isEn
              ? 'Share your idea, and get a roadmap showing what to learn and why.'
              : 'Fikrini yaz, neyi neden öğrenmen gerektiğini gösteren yol haritanı oluşturalım.'}
          </p>
        </div>

        {/* Brand, idea and account actions form a balanced three-column layout. */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT COLUMN: Logo & Brand identity (Cols 1-3) */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-2 self-center flex flex-col items-center lg:items-start text-center lg:text-left space-y-3.5"
          >
            {/* Enlarged Geometric Logo Card */}
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
                <path d="M9 22L14.5 10.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[#9CA3AF] dark:text-[#64748B]" />
                <path d="M17.5 10L23 18.5" stroke="#2B660E" strokeWidth="3" strokeLinecap="round" className="dark:stroke-[#B7F36B]" />
              </svg>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] border-2 border-white dark:border-[#171A20]" />
            </div>

            {/* Wordmark & Tagline */}
            <div>
              <span className="font-mono font-bold tracking-tight text-2xl text-[#111318] dark:text-[#E9EDF3] lowercase">
                mer<span className="text-[#2B660E] dark:text-[#B7F36B]">gen</span>
              </span>
              <p className="text-xs font-mono text-[#68717D] dark:text-[#9CA3AF] mt-0.5 font-medium">
                Fikrine tırmanan yol
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B]">
              <span>{isEn ? 'Project-Based Learning' : 'Proje Odaklı Öğrenme'}</span>
            </div>
          </motion.div>

          {/* CENTER COLUMN: Project idea and optional examples */}
          <div className="lg:col-span-8 flex flex-col items-center text-center px-0 sm:px-2">
            {/* The Project Idea Box */}
            <motion.div
              id="tour-idea-input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-3xl"
            >
              <div className="relative rounded-3xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-lg p-5 sm:p-6 flex flex-col justify-between text-left transition-all focus-within:border-[#2B660E] dark:focus-within:border-[#B7F36B] focus-within:ring-4 focus-within:ring-[#2B660E]/10 dark:focus-within:ring-[#B7F36B]/15">
                <textarea
                  id="project-idea-input"
                  aria-label={isEn ? 'Describe your project idea' : 'Proje fikrini yaz'}
                  rows={5}
                  value={projectIdea}
                  onChange={e => setIdea(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isEn ? 'What would you like to build?' : 'Ne geliştirmek istiyorsun?'}
                  className="w-full bg-transparent border-0 outline-none resize-none text-base sm:text-lg text-[#111318] dark:text-[#E9EDF3] placeholder:text-[#9CA3AF] dark:placeholder:text-[#64748B] min-h-[150px] leading-relaxed font-normal py-2"
                />

                <div className="pt-4 border-t border-[#E3E7EC]/60 dark:border-[#2A3038]/60 flex justify-end">
                  <button
                    type="button"
                    disabled={!isValid || creating}
                    onClick={handleStartRoadmap}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 select-none ${
                      isValid
                        ? 'bg-[#2B660E] hover:bg-[#22520B] dark:bg-[#B7F36B] dark:hover:bg-[#C5F785] text-white dark:text-[#0B0D10] cursor-pointer shadow-md shadow-[#2B660E]/15 dark:shadow-[#B7F36B]/20 active:scale-[0.98]'
                        : 'bg-[#E3E7EC] dark:bg-[#2A3038] text-[#9CA3AF] dark:text-[#64748B] cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>{creating ? (isEn ? 'Preparing questions…' : 'Sorular hazırlanıyor…') : t('hero.submitButton')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Non-Technical Quick Inspiration Chips */}
            <div id="tour-inspiration-chips" className="mt-5 w-full max-w-3xl text-left">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs text-[#68717D] dark:text-[#9CA3AF]">
                  {isEn ? 'Need an idea?' : 'Bir fikir seç'}
                </span>
                <Link to="/canvas?demo=1" className="text-xs text-[#68717D] dark:text-[#9CA3AF] hover:text-[#2B660E] dark:hover:text-[#B7F36B] transition-colors inline-flex items-center gap-1">
                  <Compass className="w-3 h-3" />{isEn ? 'View example' : 'Örnek harita'}
                </Link>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
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

          {/* RIGHT COLUMN: Account controls and wizard sit beside the idea box. */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-2 flex flex-col items-center justify-center gap-2.5 lg:-translate-y-9"
          >
            <button
              id="tour-wizard-box"
              type="button"
              onClick={() => setIsTourOpen(true)}
              className="w-full max-w-[170px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#2B660E]/25 dark:border-[#B7F36B]/25 bg-[#FFFFFF] dark:bg-[#171A20] hover:bg-[#2B660E]/10 dark:hover:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B] text-sm font-semibold transition-colors active:scale-[0.99] cursor-pointer whitespace-nowrap"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isEn ? 'Start Wizard' : 'Sihirbazı Başlat'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="w-full max-w-[170px] px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#111318] dark:bg-[#E9EDF3] text-white dark:text-[#0B0D10] hover:bg-[#2B660E] dark:hover:bg-[#B7F36B] transition-colors cursor-pointer"
            >
              {t('nav.signIn')}
            </button>
            <LanguageSelector />
            <ThemeToggle />

          </motion.div>

        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Onboarding Knowledge Assessment Modal */}
      {error && <div role="alert" className="fixed bottom-5 left-5 right-5 z-50 rounded-xl bg-rose-100 text-rose-900 p-4">{error}</div>}

      {/* Guided Tour Wizard Walkthrough */}
      <GuidedTourWizard isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </>
  )
}
