import { motion } from 'motion/react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export function HeroSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [projectIdea, setProjectIdea] = useState('')

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
    <section className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 flex flex-col items-center text-center">
      {/* 1. Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-xs font-mono uppercase tracking-wider text-[#68717D] dark:text-[#9CA3AF] mb-6 shadow-xs"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] animate-pulse" />
        <span>{t('hero.eyebrow')}</span>
      </motion.div>

      {/* 2. Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#111318] dark:text-[#E9EDF3] leading-[1.08] mb-6 max-w-3xl"
      >
        <span>{t('hero.titleLine1')}</span>
        <br />
        <span className="text-[#2B660E] dark:text-[#B7F36B]">{t('hero.titleLine2')}</span>
      </motion.h1>

      {/* 3. Supporting Paragraph */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-base sm:text-lg text-[#68717D] dark:text-[#9CA3AF] max-w-2xl leading-relaxed mb-10"
      >
        {t('hero.description')}
      </motion.p>

      {/* 4. Hero Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-2xl"
      >
        <div className="relative rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-xl p-3.5 sm:p-5 text-left transition-all duration-200 focus-within:border-[#2B660E] dark:focus-within:border-[#B7F36B] focus-within:ring-2 focus-within:ring-[#2B660E]/20 dark:focus-within:ring-[#B7F36B]/20">
          <label htmlFor="project-idea-input" className="sr-only">
            {t('hero.inputPlaceholder')}
          </label>
          <textarea
            id="project-idea-input"
            rows={3}
            value={projectIdea}
            onChange={e => setProjectIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('hero.inputPlaceholder')}
            className="w-full bg-transparent border-0 outline-none resize-none text-sm sm:text-base text-[#111318] dark:text-[#E9EDF3] placeholder:text-[#9CA3AF] dark:placeholder:text-[#64748B] min-h-[96px] sm:min-h-[105px] leading-relaxed font-normal"
          />

          <div className="pt-3 border-t border-[#E3E7EC]/60 dark:border-[#2A3038]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF] dark:text-[#64748B] font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#2B660E] dark:text-[#B7F36B]" />
              <span className="hidden sm:inline">
                {projectIdea.length > 0
                  ? `${projectIdea.length} ${t('hero.charCount')} · ⌘+Enter ile gönder`
                  : t('hero.hintText')}
              </span>
              <span className="sm:hidden">{projectIdea.length} {t('hero.charCount')}</span>
            </div>

            <button
              type="button"
              disabled={!isValid}
              onClick={handleStartRoadmap}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 select-none ${
                isValid
                  ? 'bg-[#2B660E] hover:bg-[#22520B] dark:bg-[#B7F36B] dark:hover:bg-[#C5F785] text-white dark:text-[#0B0D10] cursor-pointer shadow-md shadow-[#2B660E]/10 dark:shadow-[#B7F36B]/10 active:scale-[0.98]'
                  : 'bg-[#E3E7EC] dark:bg-[#2A3038] text-[#9CA3AF] dark:text-[#64748B] cursor-not-allowed opacity-60'
              }`}
            >
              <span>{t('hero.submitButton')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5. Starter Suggestions */}
        <div className="mt-6 text-left">
          <p className="text-xs font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B] mb-2.5">
            {t('hero.quickSuggestionsTitle')}
          </p>
          <div className="flex flex-wrap gap-2">
            {starterIdeas.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setProjectIdea(item.prompt)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF]/70 dark:bg-[#171A20]/70 text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:border-[#CBD5E1] dark:hover:border-[#3E4752] transition-colors cursor-pointer text-left"
              >
                + {item.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
