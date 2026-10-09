import { AnimatePresence, motion } from 'motion/react'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRoadmapStore } from '@/store/useRoadmapStore'

export function AiAdvisorPanel() {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const isAdvisorOpen = useRoadmapStore(s => s.isAdvisorOpen)
  const toggleAdvisor = useRoadmapStore(s => s.toggleAdvisor)
  const setAdvisorOpen = useRoadmapStore(s => s.setAdvisorOpen)
  const advisorMessages = useRoadmapStore(s => s.advisorMessages)
  const sendAdvisorMessage = useRoadmapStore(s => s.sendAdvisorMessage)
  const insertRemedialNode = useRoadmapStore(s => s.insertRemedialNode)
  const currentLevel = useRoadmapStore(s => s.currentLevel)
  const isRemedialNodeAdded = useRoadmapStore(s => s.isRemedialNodeAdded)

  const [inputVal, setInputVal] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    sendAdvisorMessage(inputVal.trim())
    setInputVal('')
  }

  const quickQuestions = [
    {
      tr: 'Nereden başlamalıyım?',
      en: 'Where should I start?',
    },
    {
      tr: 'Machine Learning neden gerekli?',
      en: 'Why is Machine Learning required?',
    },
    {
      tr: 'Python bilmiyorsam ne yapmalıyım?',
      en: 'What if I do not know Python?',
    },
    ...(isRemedialNodeAdded
      ? [
          {
            tr: 'Neden yeni bir pratik eklendi?',
            en: 'Why was an extra practice node added?',
          },
        ]
      : [
          {
            tr: 'Python için ek pratik ekle.',
            en: 'Add extra practice for Python.',
          },
        ]),
  ]

  return (
    <>
      {/* Floating Launcher Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAdvisor}
          className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#171A20] border-2 border-[#2A3038] hover:border-[#B7F36B] shadow-2xl text-xs font-mono font-bold text-[#E9EDF3] transition-all cursor-pointer group"
          aria-label="AI Danışman"
        >
          <div className="relative">
            <Bot className="w-4 h-4 text-[#B7F36B] group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#B7F36B] animate-pulse" />
          </div>
          <span>{isEn ? 'AI Advisor' : 'AI Danışman'}</span>
        </motion.button>
      </div>

      {/* Slide-over Drawer Panel */}
      <AnimatePresence>
        {isAdvisorOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-[#FFFFFF] dark:bg-[#171A20] border-l border-[#E3E7EC] dark:border-[#2A3038] shadow-2xl flex flex-col overflow-hidden text-left"
            role="dialog"
            aria-label="AI Öğrenme Danışmanı"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#E3E7EC] dark:border-[#2A3038] flex items-center justify-between bg-[#F7F8FA] dark:bg-[#111318]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2B660E]/15 dark:bg-[#B7F36B]/15 border border-[#2B660E]/30 dark:border-[#B7F36B]/30 flex items-center justify-center text-[#2B660E] dark:text-[#B7F36B]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#111318] dark:text-[#E9EDF3]">
                    {isEn ? 'AI Learning Advisor' : 'AI Öğrenme Danışmanı'}
                  </h3>
                  <p className="text-[10px] font-mono text-[#68717D] dark:text-[#9CA3AF]">
                    {currentLevel === 'root'
                      ? isEn ? 'Context: AI Fitness App (Root)' : 'Bağlam: AI Fitness App (Ana Harita)'
                      : isEn ? 'Context: ML Recommendation Engine' : 'Bağlam: ML Öneri Motoru Alt Haritası'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAdvisorOpen(false)}
                className="p-1.5 rounded-lg text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {advisorMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#111318] dark:bg-[#E9EDF3] text-white dark:text-[#0B0D10] font-medium'
                        : 'bg-[#F7F8FA] dark:bg-[#111318] border border-[#E3E7EC] dark:border-[#2A3038] text-[#111318] dark:text-[#E9EDF3]'
                    }`}
                  >
                    {isEn ? msg.textEn : msg.textTr}

                    {/* Interactive Confirmation Action */}
                    {msg.action && (
                      <div className="mt-2.5 pt-2 border-t border-[#E3E7EC] dark:border-[#2A3038]">
                        <button
                          type="button"
                          onClick={() => {
                            insertRemedialNode()
                          }}
                          className="w-full py-1.5 px-3 rounded-lg bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] text-[11px] font-mono font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{isEn ? msg.action.labelEn : msg.action.labelTr}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Quick Actions / Recognized Demo Prompts */}
              <div className="pt-2">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B] mb-2">
                  {isEn ? 'Suggested Questions:' : 'Önerilen Sorular:'}
                </p>
                <div className="space-y-1.5">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendAdvisorMessage(isEn ? q.en : q.tr)}
                      className="w-full text-left p-2 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] hover:border-[#2B660E] dark:hover:border-[#B7F36B] transition-colors text-[11px] text-[#111318] dark:text-[#E9EDF3] flex items-center justify-between cursor-pointer group"
                    >
                      <span className="truncate">{isEn ? q.en : q.tr}</span>
                      <span className="text-[#2B660E] dark:text-[#B7F36B] font-mono group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Footer */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={isEn ? 'Ask AI advisor...' : 'Danışmana soru sor veya pratik talep et...'}
                className="flex-1 py-2 px-3 text-xs rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-[#111318] dark:text-[#E9EDF3] placeholder:text-[#9CA3AF] dark:placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#2B660E] dark:focus:ring-[#B7F36B]"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                className="p-2 rounded-xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] disabled:opacity-40 transition-opacity cursor-pointer"
                aria-label="Gönder"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
