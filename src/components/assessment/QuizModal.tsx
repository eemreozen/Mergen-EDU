import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRoadmapStore } from '@/store/useRoadmapStore'

export function QuizModal() {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const isQuizOpen = useRoadmapStore(s => s.isQuizOpen)
  const activeQuiz = useRoadmapStore(s => s.activeQuiz)
  const closeQuiz = useRoadmapStore(s => s.closeQuiz)
  const handleQuizCompletion = useRoadmapStore(s => s.handleQuizCompletion)

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!isQuizOpen || !activeQuiz) return null

  const questions = activeQuiz.questions
  const currentQ = questions[currentQuestionIndex]

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Submit assessment
      setIsSubmitted(true)
    }
  }

  // Calculate results
  const correctCount = questions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctIndex ? 1 : 0)
  }, 0)

  const isPassed = correctCount >= activeQuiz.passingScore

  const handleApplyResult = () => {
    handleQuizCompletion(isPassed)
    handleResetModal()
  }

  const handleResetModal = () => {
    setIsSubmitted(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswers({})
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeQuiz}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg rounded-3xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-2xl p-6 sm:p-7 z-10 flex flex-col overflow-hidden text-left"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E3E7EC] dark:border-[#2A3038] mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2B660E]/15 dark:bg-[#B7F36B]/15 border border-[#2B660E]/30 dark:border-[#B7F36B]/30 flex items-center justify-center text-[#2B660E] dark:text-[#B7F36B]">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111318] dark:text-[#E9EDF3]">
                  {isEn ? activeQuiz.titleEn : activeQuiz.titleTr}
                </h3>
                <p className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
                  {isEn ? '3 Questions · Deterministic Evaluation' : '3 Soru · Deterministik Bilgi Doğrulama'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeQuiz}
              className="p-1.5 rounded-lg text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!isSubmitted ? (
            /* Quiz Questions View */
            <div className="space-y-5">
              {/* Progress dots */}
              <div className="flex items-center justify-between text-xs font-mono text-[#68717D] dark:text-[#9CA3AF]">
                <span>
                  {isEn ? 'Question' : 'Soru'} {currentQuestionIndex + 1} / {questions.length}
                </span>
                <div className="flex gap-1.5">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-200 ${
                        idx === currentQuestionIndex
                          ? 'w-6 bg-[#2B660E] dark:bg-[#B7F36B]'
                          : selectedAnswers[idx] !== undefined
                          ? 'w-2 bg-[#CBD5E1] dark:bg-[#3E4752]'
                          : 'w-2 bg-[#E3E7EC] dark:bg-[#2A3038]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <h4 className="text-sm sm:text-base font-semibold text-[#111318] dark:text-[#E9EDF3] leading-snug">
                {isEn ? currentQ.questionEn : currentQ.questionTr}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {(isEn ? currentQ.optionsEn : currentQ.optionsTr).map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === optIdx
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-3 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#2B660E] dark:border-[#B7F36B] bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#111318] dark:text-[#E9EDF3] font-bold shadow-xs'
                          : 'border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] text-[#68717D] dark:text-[#9CA3AF] hover:border-[#CBD5E1] dark:hover:border-[#3E4752]'
                      }`}
                    >
                      <span>{opt}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-[#2B660E] dark:border-[#B7F36B] bg-[#2B660E] dark:bg-[#B7F36B]'
                            : 'border-[#CBD5E1] dark:border-[#3E4752]'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#0B0D10]" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Next / Submit Button */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#68717D] dark:text-[#9CA3AF] disabled:opacity-30 cursor-pointer"
                >
                  {isEn ? '← Previous' : '← Önceki'}
                </button>

                <button
                  type="button"
                  disabled={selectedAnswers[currentQuestionIndex] === undefined}
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] text-xs font-bold hover:opacity-95 disabled:opacity-40 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>
                    {currentQuestionIndex === questions.length - 1
                      ? isEn ? 'Submit & Evaluate' : 'Sonucu Gör'
                      : isEn ? 'Next' : 'Sonraki'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-5 text-center">
              <div
                className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
                  isPassed
                    ? 'bg-[#2B660E]/15 dark:bg-[#B7F36B]/20 text-[#2B660E] dark:text-[#B7F36B] border border-[#2B660E]/30 dark:border-[#B7F36B]/40'
                    : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#111318] dark:text-[#E9EDF3]">
                  {isPassed
                    ? isEn ? 'Evaluation Passed!' : 'Değerlendirme Başarılı!'
                    : isEn ? 'Needs Extra Practice' : 'Ek Pratik Gerekli'}
                </h4>
                <p className="text-xs font-mono text-[#68717D] dark:text-[#9CA3AF] mt-1">
                  {isEn ? 'Score' : 'Skor'}: {correctCount} / {questions.length}
                </p>
              </div>

              {/* Explanation message */}
              <div className="p-4 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] text-xs text-[#68717D] dark:text-[#9CA3AF] leading-relaxed text-left">
                {isPassed ? (
                  <span>
                    {isEn
                      ? 'You successfully validated foundational Python competency. "NumPy & Pandas" has been unlocked!'
                      : 'Python temelleri yetkinliğini başarıyla doğruladın. Sonraki konu olan "NumPy ve Pandas" aşamasının kilidi açıldı!'}
                  </span>
                ) : (
                  <span className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      {isEn
                        ? 'To ensure complete confidence, an adaptive practice node ("Python Functions — Extra Practice") is being dynamically inserted into your learning roadmap.'
                        : 'Fonksiyonlar ve veri yapıları konusunu pekiştirmen için öğrenme haritana otomatik olarak "Python Fonksiyonları — Ek Pratik" adımı ekleniyor.'}
                    </span>
                  </span>
                )}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] text-xs font-mono font-medium text-[#111318] dark:text-[#E9EDF3] hover:bg-[#F0F2F5] dark:hover:bg-[#20242B] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                  <span>{isEn ? 'Retry' : 'Tekrar Dene'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyResult}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] text-xs font-bold hover:opacity-95 cursor-pointer shadow-md"
                >
                  <span>{isEn ? 'Update Roadmap' : 'Haritayı Güncelle'}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
