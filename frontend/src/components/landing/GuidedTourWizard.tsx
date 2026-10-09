import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Compass,
  Lightbulb,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface GuidedTourWizardProps {
  isOpen: boolean
  onClose: () => void
}

export function GuidedTourWizard({ isOpen, onClose }: GuidedTourWizardProps) {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      titleTr: '1. Fikrini Özgürce Yaz',
      titleEn: '1. Describe Your Idea Freely',
      icon: Sparkles,
      tagTr: 'TEKNİK BİLGİ GEREKMEZ',
      tagEn: 'NO TECH KNOWLEDGE NEEDED',
      bodyTr:
        'Aklındaki proje fikrini buraya tamamen kendi günlük cümlelerinle yaz. Hiçbir teknik kütüphane, veritabanı veya framework bilmene gerek yok! Örneğin: "Kıyafet satabileceğim bir online mağaza" veya "Arkadaşlarımla sohbet edebileceğim bir uygulama" demen yeterlidir.',
      bodyEn:
        'Describe what you want to build in everyday language. You don’t need to know technical frameworks, databases, or libraries! For instance: "An online store to sell handmade clothes" or "A chat app to hang out with friends".',
      hintTr: 'İpucu: Ne kadar detay verirsen, öğrenme rotan o kadar kişiselleşir.',
      hintEn: 'Tip: The more context you provide, the better your custom path.',
    },
    {
      titleTr: '2. Örneklerden İlham Al',
      titleEn: '2. Get Inspired by Real Ideas',
      icon: Lightbulb,
      tagTr: 'HAZIR SENARYOLAR',
      tagEn: 'STARTER SCENARIOS',
      bodyTr:
        'Henüz tam olarak ne geliştirmek istediğine karar veremediysen, metin kutusunun altındaki ilham haplarına göz at. E-ticaret mağazası, akıllı fitness asistanı veya bütçe takipçisi gibi popüler fikirleri tek bir tıkla kutucuğa aktarabilirsin.',
      bodyEn:
        'If you are undecided, browse through the inspiration ideas right below the input box. You can auto-fill popular real-world projects like online stores, fitness assistants, or budget trackers with a single click.',
      hintTr: 'İpucu: + butonuna basarak fikri doğrudan kutucuğa ekleyebilirsin.',
      hintEn: 'Tip: Tap any suggestion chip to instantly pre-fill your prompt.',
    },
    {
      titleTr: '3. Önlüklü Rehber Öğretmene Danış',
      titleEn: '3. Consult Your Lab-Coat Mentor',
      icon: UserCheck,
      tagTr: 'KİŞİSEL PROJE DANIŞMANI',
      tagEn: 'PERSONAL PROJECT ADVISOR',
      bodyTr:
        'Sayfanın en altındaki çizgi üzerinde ayaklarıyla duran önlüklü öğretmenimiz, senin projedeki en büyük yardımcın! Aklına takılanları, hangi hedefe odaklanman gerektiğini veya projenin kapsamını doğrudan ona sorabilirsin.',
      bodyEn:
        'Standing right on the bottom line of the page, our lab-coat mentor teacher is your personal learning guide! Ask questions about your goals or scope, and brainstorm before building.',
      hintTr: 'İpucu: Önlüklü öğretmenin üzerine tıklayarak canlı danışman penceresini açabilirsin.',
      hintEn: 'Tip: Click the teacher anytime to launch the interactive advisor.',
    },
    {
      titleTr: '4. Zirveye Tırmanış Keşif Haritan',
      titleEn: '4. Climb Your Learning Expedition Map',
      icon: Compass,
      tagTr: 'AŞAĞIDAN YUKARIYA TIRMANIŞ',
      tagEn: 'BOTTOM-TO-TOP EXPEDITION',
      bodyTr:
        '"Yol Haritamı Oluştur" butonuna bastığında, 5 kısa seviye sorusunun ardından sana özel interaktif bir keşif haritası açılır. Harita en alttaki temel adımlardan başlar ve zirvedeki tamamlanmış projene doğru kıvrılarak tırmanır!',
      bodyEn:
        'When you submit your idea, a 5-question adaptive assessment prepares your custom expedition map. It starts from basecamp at the bottom of the canvas and winds upward toward your final summit MVP!',
      hintTr: 'İpucu: Haritada takıldığın yerlerde sistem otomatik ek pratik adımları sunar.',
      hintEn: 'Tip: If you need reinforcement, adaptive practice nodes appear organically.',
    },
  ]

  const step = steps[currentStep]
  const Icon = step.icon

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1)
    } else {
      onClose()
      setCurrentStep(0)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          aria-hidden="true"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl rounded-3xl border-2 border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-2xl overflow-hidden z-10 flex flex-col text-left"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Wizard Header */}
          <div className="p-5 border-b border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2B660E]/15 dark:bg-[#B7F36B]/20 text-[#2B660E] dark:text-[#B7F36B] flex items-center justify-center font-bold">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111318] dark:text-[#E9EDF3] flex items-center gap-2">
                  <span>{isEn ? 'Mergen Guide Wizard' : 'Mergen Kullanım Sihirbazı'}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B]">
                    {currentStep + 1} / {steps.length}
                  </span>
                </h3>
                <p className="text-xs text-[#68717D] dark:text-[#9CA3AF]">
                  {isEn ? 'Explore how Mergen guides your learning' : 'Mergen ile proje odaklı öğrenmeyi adım adım keşfet'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:bg-[#E3E7EC]/60 dark:hover:bg-[#20242B] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step Progress Line */}
          <div className="w-full bg-[#E3E7EC] dark:bg-[#2A3038] h-1.5 flex">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 h-full transition-all duration-300 ${
                  idx <= currentStep
                    ? 'bg-[#2B660E] dark:bg-[#B7F36B]'
                    : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B]">
                <Icon className="w-3.5 h-3.5" />
                <span>{isEn ? step.tagEn : step.tagTr}</span>
              </div>
            </div>

            <h4 className="text-xl font-bold tracking-tight text-[#111318] dark:text-[#E9EDF3]">
              {isEn ? step.titleEn : step.titleTr}
            </h4>

            <p className="text-sm sm:text-base text-[#4A5361] dark:text-[#CBD5E1] leading-relaxed">
              {isEn ? step.bodyEn : step.bodyTr}
            </p>

            <div className="p-3.5 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] flex items-center gap-2.5 text-xs text-[#68717D] dark:text-[#9CA3AF]">
              <Sparkles className="w-4 h-4 text-[#2B660E] dark:text-[#B7F36B] shrink-0" />
              <span>{isEn ? step.hintEn : step.hintTr}</span>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-5 sm:p-6 border-t border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-colors ${
                currentStep === 0
                  ? 'opacity-30 cursor-not-allowed text-[#9CA3AF]'
                  : 'text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isEn ? 'Previous' : 'Önceki'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-mono text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] transition-colors cursor-pointer"
              >
                {isEn ? 'Skip' : 'Geç'}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] font-semibold text-xs sm:text-sm hover:opacity-95 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>{currentStep === steps.length - 1 ? (isEn ? 'Finish Tour' : 'Turu Tamamla') : (isEn ? 'Next' : 'Sonraki')}</span>
                {currentStep === steps.length - 1 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
