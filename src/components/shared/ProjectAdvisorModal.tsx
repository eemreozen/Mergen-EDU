import { AnimatePresence, motion } from 'motion/react'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ProjectAdvisorProps {
  onSelectPrompt?: (prompt: string) => void
}

interface Message {
  sender: 'advisor' | 'user'
  text: string
}

export function ProjectAdvisor({ onSelectPrompt }: ProjectAdvisorProps) {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'advisor',
      text: isEn
        ? "Hello! I'm your Project Advisor. Tell me your interests or career goals, and I'll help you pick the perfect hands-on project!"
        : "Merhaba! Ben Proje Danışmanınım. İlgi duyduğun alanı veya hedefini anlat, sana en uygun proje fikrini ve teknoloji yığınını birlikte seçelim!",
    },
  ])

  const quickPrompts = isEn
    ? [
        { label: 'E-commerce with Spring Boot & React', text: 'Spring Boot ve React ile tam teşekküllü modern bir e-ticaret platformu geliştirmek istiyorum.' },
        { label: 'High-performance Go Microservices', text: 'Go ve gRPC kullanarak dağıtık mimarili, yüksek performanslı bir mikroservis kümesi inşa etmek istiyorum.' },
        { label: 'Real-time Chat with WebSockets', text: 'WebSockets ve Redis Pub/Sub ile ölçeklenebilir gerçek zamanlı bir sohbet platformu geliştirmek istiyorum.' },
      ]
    : [
        { label: 'Spring Boot & React ile E-Ticaret', text: 'Spring Boot ve React kullanarak JWT tabanlı kimlik doğrulama, sepet yönetimi ve sipariş takibi içeren tam teşekküllü bir e-ticaret platformu geliştirmek istiyorum.' },
        { label: 'Go ve gRPC ile Mikroservis Mimarisi', text: 'Go, gRPC ve PostgreSQL kullanarak dağıtık mimaride çalışan, yüksek performanslı bir mikroservis kümesi inşa etmek istiyorum.' },
        { label: 'WebSockets ile Dağıtık Sohbet Sistemi', text: 'Go ve WebSockets ile dağıtık mimaride çalışan, oda bazlı gerçek zamanlı bir mesajlaşma ve bildirim sistemi geliştirmek istiyorum.' },
      ]

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userText = inputMessage
    setMessages(prev => [...prev, { sender: 'user', text: userText }])
    setInputMessage('')

    // Deterministic advisor guidance response
    setTimeout(() => {
      const reply = isEn
        ? `Great direction! "${userText.slice(0, 45)}..." is an excellent choice for mastering backend resilience and state management. You can insert this directly into your roadmap generator!`
        : `Harika bir fikir! "${userText.slice(0, 45)}..." projesi, hem modern mimariyi hem de veri modellemesini derinlemesine kavramak için harika bir seçim. İstersen bu fikri tek tıkla ana kutucuğa aktarabilirsin! `
      setMessages(prev => [...prev, { sender: 'advisor', text: reply }])
    }, 600)
  }

  const handleApplyPrompt = (promptText: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(promptText)
    }
    setIsOpen(false)
  }

  return (
    <>
      {/* 1. Floating Smiling Advisor Bubble (Bottom-Left) */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative group w-14 h-14 rounded-2xl bg-[#FFFFFF] dark:bg-[#171A20] border-2 border-[#E3E7EC] dark:border-[#2A3038] hover:border-[#2B660E] dark:hover:border-[#B7F36B] shadow-xl shadow-black/10 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B660E] dark:focus-visible:ring-[#B7F36B]"
          aria-label={isEn ? 'Open Project Advisor' : 'Proje Danışmanını Aç'}
        >
          {/* Smiling Advisor Icon (Friendly face with smile) */}
          <div className="relative">
            <svg
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-[#111318] dark:text-[#E9EDF3]"
            >
              {/* Head outline */}
              <rect x="4" y="4" width="28" height="28" rx="10" stroke="currentColor" strokeWidth="2.5" className="fill-[#F7F8FA] dark:fill-[#111318]" />
              {/* Smiling eyes */}
              <circle cx="12" cy="14" r="2" fill="currentColor" />
              <circle cx="24" cy="14" r="2" fill="currentColor" />
              {/* Warm happy smile path */}
              <path
                d="M12 21C14 24.5 22 24.5 24 21"
                stroke="#2B660E"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="dark:stroke-[#B7F36B]"
              />
              {/* Tiny cheek blushes */}
              <circle cx="9" cy="20" r="1.5" fill="#2B660E" fillOpacity="0.3" className="dark:fill-[#B7F36B] dark:fill-opacity-40" />
              <circle cx="27" cy="20" r="1.5" fill="#2B660E" fillOpacity="0.3" className="dark:fill-[#B7F36B] dark:fill-opacity-40" />
            </svg>
          </div>

          {/* Active online green badge */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] border-2 border-white dark:border-[#171A20]" />
        </motion.button>

        {/* Small tooltip pill */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-md text-xs font-medium text-[#111318] dark:text-[#E9EDF3] select-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2B660E] dark:text-[#B7F36B]" />
            <span>{isEn ? 'Project Advisor' : 'Proje Danışmanı'}</span>
          </motion.div>
        )}
      </div>

      {/* 2. Interactive Advisor Panel / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-start p-4 sm:p-6 sm:pl-24 pointer-events-none">
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto relative w-full max-w-md h-[520px] rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-2xl flex flex-col overflow-hidden"
              role="dialog"
              aria-label="Proje Danışmanı"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#E3E7EC] dark:border-[#2A3038] flex items-center justify-between bg-[#F7F8FA] dark:bg-[#111318]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#2B660E]/10 dark:bg-[#B7F36B]/10 border border-[#2B660E]/20 dark:border-[#B7F36B]/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#2B660E] dark:text-[#B7F36B]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#111318] dark:text-[#E9EDF3]">
                      {isEn ? 'ProjectPath Advisor' : 'Proje Danışmanı'}
                    </h3>
                    <p className="text-[11px] text-[#68717D] dark:text-[#9CA3AF] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B]" />
                      <span>{isEn ? 'Online · Ready to guide' : 'Çevrim içi · Rehberlik için hazır'}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:bg-[#E3E7EC]/40 dark:hover:bg-[#2A3038] transition-colors cursor-pointer"
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 ${
                        msg.sender === 'user'
                          ? 'bg-[#111318] dark:bg-[#E9EDF3] text-white dark:text-[#0B0D10] font-medium'
                          : 'bg-[#F7F8FA] dark:bg-[#111318] border border-[#E3E7EC] dark:border-[#2A3038] text-[#111318] dark:text-[#E9EDF3]'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Quick starter suggestions */}
                <div className="pt-2">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B] mb-2">
                    {isEn ? 'Suggested Roadmaps:' : 'Tavsiye Edilen Projeler:'}
                  </p>
                  <div className="space-y-1.5">
                    {quickPrompts.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPrompt(q.text)}
                        className="w-full text-left p-2 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA]/60 dark:bg-[#111318]/60 hover:bg-[#E3E7EC]/40 dark:hover:bg-[#2A3038] transition-colors text-[11px] text-[#111318] dark:text-[#E9EDF3] flex items-center justify-between gap-2 cursor-pointer group"
                      >
                        <span className="truncate">{q.label}</span>
                        <span className="text-[10px] font-mono text-[#2B660E] dark:text-[#B7F36B] shrink-0 font-semibold group-hover:underline">
                          {isEn ? 'Use Idea →' : 'Kutuya Aktar →'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Ask about technologies, frameworks...'
                      : 'Teknolojiler, mimariler hakkında sor...'
                  }
                  className="flex-1 py-2 px-3 text-xs rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-[#111318] dark:text-[#E9EDF3] placeholder:text-[#9CA3AF] dark:placeholder:text-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#2B660E] dark:focus:ring-[#B7F36B]"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2 rounded-xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] disabled:opacity-40 transition-opacity cursor-pointer"
                  aria-label="Gönder"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
