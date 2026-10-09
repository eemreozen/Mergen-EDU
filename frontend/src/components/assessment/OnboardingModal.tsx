import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, Compass, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { type OnboardingAnswers } from '@/types/canvas'
import { useRoadmapStore } from '@/store/useRoadmapStore'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')
  const navigate = useNavigate()
  const setOnboardingAnswers = useRoadmapStore(s => s.setOnboardingAnswers)

  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)

  // Form states
  const [experienceLevel, setExperienceLevel] = useState<string>('beginner')
  const [knownTechs, setKnownTechs] = useState<string[]>([])
  const [mlKnowledge, setMlKnowledge] = useState<string>('none')
  const [weeklyHours, setWeeklyHours] = useState<string>('5-10')
  const [primaryGoal, setPrimaryGoal] = useState<string>('mvp')

  if (!isOpen) return null

  const questions = [
    {
      id: 1,
      titleTr: 'Yazılım geliştirme konusunda kendini hangi seviyede görüyorsun?',
      titleEn: 'How would you describe your software development experience level?',
      subtitleTr: 'Yol haritanın başlangıç temposunu ve derinliğini belirlemek için kullanılır.',
      subtitleEn: 'Sets the foundational depth and introductory pacing of your roadmap.',
      type: 'single',
      options: [
        { id: 'beginner', tr: 'Yeni başlıyorum', en: 'Complete Beginner' },
        { id: 'basic', tr: 'Temel bilgim var', en: 'Basic Knowledge' },
        { id: 'intermediate', tr: 'Orta seviyedeyim', en: 'Intermediate Developer' },
        { id: 'advanced', tr: 'İleri seviyedeyim', en: 'Advanced Engineer' },
      ],
      value: experienceLevel,
      setValue: setExperienceLevel,
    },
    {
      id: 2,
      titleTr: 'Daha önce hangi teknolojilerle çalıştın?',
      titleEn: 'Which technologies have you previously worked with?',
      subtitleTr: 'Bildiğin teknolojiler ön koşul listenden otomatik muaf tutulur.',
      subtitleEn: 'Known technologies can be automatically fast-tracked on prerequisites.',
      type: 'multi',
      options: [
        { id: 'Python', tr: 'Python', en: 'Python' },
        { id: 'JavaScript', tr: 'JavaScript / TypeScript', en: 'JavaScript / TypeScript' },
        { id: 'React', tr: 'React', en: 'React' },
        { id: 'ReactNative', tr: 'React Native', en: 'React Native' },
        { id: 'SQL', tr: 'SQL / Veritabanı', en: 'SQL / Databases' },
        { id: 'None', tr: 'Hiçbiri (Sıfırdan Başla)', en: 'None (Starting Fresh)' },
      ],
    },
    {
      id: 3,
      titleTr: 'Machine Learning konusunda ne kadar bilgilisin?',
      titleEn: 'How familiar are you with Machine Learning concepts?',
      subtitleTr: 'Fitness öneri motoru alt haritasının başlangıç düzeyini şekillendirir.',
      subtitleEn: 'Shapes the initial starting branch in the Recommendation Engine submap.',
      type: 'single',
      options: [
        { id: 'none', tr: 'Hiç bilmiyorum', en: 'No background yet' },
        { id: 'concepts', tr: 'Temel kavramları biliyorum', en: 'Familiar with core concepts' },
        { id: 'basic_models', tr: 'Basit modeller geliştirdim', en: 'Built basic toy models' },
        { id: 'production', tr: 'Gerçek projelerde kullandım', en: 'Used in real-world projects' },
      ],
      value: mlKnowledge,
      setValue: setMlKnowledge,
    },
    {
      id: 4,
      titleTr: 'Haftada kaç saat ayırabilirsin?',
      titleEn: 'How many hours per week can you dedicate to this project?',
      subtitleTr: 'Gerçekçi haftalık hedefler ve teslim tarihleri planlaması için.',
      subtitleEn: 'Allows realistic milestone pacing and completion projections.',
      type: 'single',
      options: [
        { id: '2-5', tr: '2–5 saat', en: '2–5 hours' },
        { id: '5-10', tr: '5–10 saat', en: '5–10 hours' },
        { id: '10-20', tr: '10–20 saat', en: '10–20 hours' },
        { id: '20+', tr: '20+ saat', en: '20+ hours' },
      ],
      value: weeklyHours,
      setValue: setWeeklyHours,
    },
    {
      id: 5,
      titleTr: 'Bu projedeki öncelikli hedefin nedir?',
      titleEn: 'What is your primary objective for this project?',
      subtitleTr: 'Pratik kodlama ve teorik ağırlık dengesini bu hedefe göre kuracağız.',
      subtitleEn: 'Balances the ratio of hands-on deliverables versus deep theory.',
      type: 'single',
      options: [
        { id: 'mvp', tr: 'Çalışan bir MVP geliştirmek', en: 'Build a working MVP' },
        { id: 'deep_learning', tr: 'Konuları derinlemesine öğrenmek', en: 'Learn concepts deeply' },
        { id: 'portfolio', tr: 'Portföyüme proje eklemek', en: 'Add showcase piece to portfolio' },
        { id: 'startup', tr: 'Girişim fikrimi hayata geçirmek', en: 'Launch as real startup' },
      ],
      value: primaryGoal,
      setValue: setPrimaryGoal,
    },
  ]

  const currentQ = questions[currentStep]

  const toggleMultiTech = (id: string) => {
    if (id === 'None') {
      setKnownTechs(['None'])
      return
    }
    setKnownTechs(prev => {
      const filtered = prev.filter(t => t !== 'None')
      if (filtered.includes(id)) {
        return filtered.filter(t => t !== id)
      } else {
        return [...filtered, id]
      }
    })
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Finish onboarding
      const answers: OnboardingAnswers = {
        experienceLevel,
        knownTechs,
        mlKnowledge,
        weeklyHours,
        primaryGoal,
      }
      setIsGenerating(true)
      setOnboardingAnswers(answers)

      // Short animated preparation state (~1.2s) as specified
      setTimeout(() => {
        setIsGenerating(false)
        onClose()
        navigate('/canvas')
      }, 1200)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl rounded-3xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-2xl p-6 sm:p-8 z-10 flex flex-col overflow-hidden text-left"
          role="dialog"
          aria-modal="true"
        >
          {isGenerating ? (
            /* Animated Roadmap Preparation State */
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-[#2B660E]/20 dark:bg-[#B7F36B]/20 animate-ping" />
                <div className="w-16 h-16 rounded-2xl bg-[#2B660E] dark:bg-[#B7F36B] flex items-center justify-center text-white dark:text-[#0B0D10] shadow-lg">
                  <Compass className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#111318] dark:text-[#E9EDF3]">
                  {isEn ? 'Preparing your personalized canvas...' : 'Öğrenme haritan hazırlanıyor...'}
                </h3>
                <p className="text-xs font-mono text-[#68717D] dark:text-[#9CA3AF] mt-1">
                  {isEn
                    ? 'Synthesizing knowledge profile into interactive nodes...'
                    : 'Verilen yanıtlar analiz edilerek etkileşimli düğümler oluşturuluyor...'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Top Navigation & Close */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E3E7EC] dark:border-[#2A3038] mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-[#68717D] dark:text-[#9CA3AF]">
                  <Sparkles className="w-4 h-4 text-[#2B660E] dark:text-[#B7F36B]" />
                  <span>
                    {isEn ? 'Knowledge Assessment' : 'Öğrenme Profili Belirleme'} ({currentStep + 1} / {questions.length})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] transition-colors cursor-pointer"
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-[#E3E7EC] dark:bg-[#2A3038] mb-6 overflow-hidden">
                <motion.div
                  className="h-full bg-[#2B660E] dark:bg-[#B7F36B]"
                  initial={false}
                  animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>

              {/* Question Content */}
              <div className="space-y-4 mb-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#111318] dark:text-[#E9EDF3] leading-snug">
                    {isEn ? currentQ.titleEn : currentQ.titleTr}
                  </h3>
                  <p className="text-xs text-[#68717D] dark:text-[#9CA3AF] mt-1">
                    {isEn ? currentQ.subtitleEn : currentQ.subtitleTr}
                  </p>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {currentQ.options.map(opt => {
                    const isSelected =
                      currentQ.type === 'single'
                        ? currentQ.value === opt.id
                        : knownTechs.includes(opt.id)

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          if (currentQ.type === 'single' && currentQ.setValue) {
                            currentQ.setValue(opt.id)
                          } else {
                            toggleMultiTech(opt.id)
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'border-[#2B660E] dark:border-[#B7F36B] bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#111318] dark:text-[#E9EDF3] font-bold shadow-xs'
                            : 'border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] text-[#68717D] dark:text-[#9CA3AF] hover:border-[#CBD5E1] dark:hover:border-[#3E4752]'
                        }`}
                      >
                        <span>{isEn ? opt.en : opt.tr}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-[#2B660E] dark:text-[#B7F36B] shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E3E7EC] dark:border-[#2A3038]">
                <button
                  type="button"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-3 py-2 rounded-xl text-xs font-mono text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] disabled:opacity-30 cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Previous' : 'Önceki'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] text-xs font-bold hover:opacity-95 transition-opacity flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>
                    {currentStep === questions.length - 1
                      ? isEn ? 'Generate Canvas' : 'Haritayı Oluştur'
                      : isEn ? 'Continue' : 'Devam Et'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
