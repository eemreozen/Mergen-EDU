import { motion } from 'motion/react'
import { Bot, Send, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TeacherAdvisorFigure } from './TeacherAdvisorFigure'

interface TeacherAdvisorDeskProps {
  onApplyPrompt: (prompt: string) => void
}

interface ChatMessage {
  id: string
  sender: 'teacher' | 'user'
  text: string
  suggestionPrompt?: string
}

export function TeacherAdvisorDesk({ onApplyPrompt }: TeacherAdvisorDeskProps) {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const [inputVal, setInputVal] = useState('')
  const idRef = useRef(100)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'teacher',
      text: isEn
        ? "Hello! I'm your Project Mentor. Tell me what kind of app or interest you have, and I'll help you shape a hands-on project!"
        : "Merhaba! Ben Proje Rehberinizim. Aklındaki hayali veya ilgi duyduğun alanı anlat, senin için en doğru projeyi ve öğrenme rotasını birlikte çıkaralım! 🎓",
      suggestionPrompt: isEn
        ? 'I want to build an online marketplace where people can sell goods smoothly.'
        : 'Kendi ürünlerimi sergileyip satabileceğim şık bir online mağaza açmak istiyorum.',
    },
  ])

  const quickQuestions = isEn
    ? [
        { label: '💡 Need ideas?', q: 'I have no project ideas, what can I build?' },
        { label: '🎯 Where to begin?', q: 'I am a beginner, how do I start learning?' },
        { label: '⏱️ How long does it take?', q: 'How long does a typical project roadmap take?' },
      ]
    : [
        { label: '💡 Fikir bulamıyorum', q: 'Aklımda henüz bir proje yok, ne önerirsin?' },
        { label: '🎯 Nereden başlamalıyım?', q: 'Daha önce hiç proje yapmadım, nereden başlamalıyım?' },
        { label: '⏱️ Ne kadar sürer?', q: 'Bir projeyi bitirmek ortalama ne kadar sürer?' },
      ]

  const handleSend = (userText: string) => {
    if (!userText.trim()) return

    idRef.current += 1
    const newMsg: ChatMessage = {
      id: `u-${idRef.current}`,
      sender: 'user',
      text: userText,
    }

    setMessages(prev => [...prev, newMsg])
    setInputVal('')

    setTimeout(() => {
      let reply = ''
      let promptToSuggest = ''

      if (userText.includes('fikir') || userText.includes('öner') || userText.includes('idea')) {
        reply = isEn
          ? 'An interactive Fitness Coach or an Online Boutique Store is a fantastic starter project! It teaches you state, user interfaces, and data flow step by step.'
          : 'Kullanıcıların egzersizlerini takip eden bir "Akıllı Fitness Koçu" veya "Online Alışveriş Mağazası" harika bir başlangıçtır! Hem görsel tasarım hem de veri yönetimini adım adım öğretir.'
        promptToSuggest = isEn
          ? 'I want to build an AI workout coach that tracks exercises and nutrition.'
          : 'Egzersiz hareketlerimi ve günlük beslenmemi analiz eden akıllı bir fitness asistanı geliştirmek istiyorum.'
      } else if (userText.includes('başla') || userText.includes('beginner') || userText.includes('start')) {
        reply = isEn
          ? 'Do not worry about technical jargon! Describe what you want in simple words, and ProjectPath will prepare a gentle, bottom-to-top learning map starting from basecamp.'
          : 'Hiç endişelenme! Hiçbir teknik terim bilmeden aklındaki fikri yazabilirsin. Sistem en temel adımlardan zirveye doğru sana özel bir tırmanış haritası çıkaracaktır.'
        promptToSuggest = isEn
          ? 'I want to build a real-time messaging application to chat with friends.'
          : 'Arkadaşların grup oluşturup anlık mesajlaşabildiği güvenli bir sohbet uygulaması yapmak istiyorum.'
      } else {
        reply = isEn
          ? `Great question! "${userText.slice(0, 35)}..." is a worthy challenge. You can formulate this into your project idea box to begin your journey!`
          : `Çok güzel bir soru! "${userText.slice(0, 35)}..." konusuyla ilgili bir projeyi sol taraftaki kutucuğa yazıp hemen yol haritanı oluşturabilirsin!`
        promptToSuggest = userText
      }

      idRef.current += 1
      setMessages(prev => [
        ...prev,
        {
          id: `t-${idRef.current}`,
          sender: 'teacher',
          text: reply,
          suggestionPrompt: promptToSuggest,
        },
      ])
    }, 500)
  }

  return (
    <div className="relative w-full flex flex-col items-center lg:items-end justify-end">
      {/* Container holding the Chat Panel + Enlarged Teacher Character side by side */}
      <div className="w-full max-w-lg flex flex-col items-center">
        
        {/* The Live Advisor Consultation Chat Panel ("etrafına koy o chat kısmının") */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="w-full rounded-3xl border-2 border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF]/95 dark:bg-[#171A20]/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col text-left mb-2"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#2B660E]/15 dark:bg-[#B7F36B]/20 text-[#2B660E] dark:text-[#B7F36B] flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#111318] dark:text-[#E9EDF3] flex items-center gap-1.5">
                  <span>{isEn ? 'Mentor Consultation Desk' : 'Önlüklü Danışman Masası'}</span>
                </h4>
                <div className="text-[10px] text-[#68717D] dark:text-[#9CA3AF] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] animate-pulse" />
                  <span>{isEn ? 'Live Advisor · Ask anything' : 'Canlı Rehber · Sorunu yanıtlar'}</span>
                </div>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B] font-semibold">
              AI Guide
            </span>
          </div>

          {/* Quick Question Chips */}
          <div className="px-3 py-2 border-b border-[#E3E7EC]/60 dark:border-[#2A3038]/60 bg-[#FFFFFF] dark:bg-[#171A20] flex flex-wrap gap-1.5">
            {quickQuestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(item.q)}
                className="text-[10px] font-mono px-2 py-1 rounded-lg border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:border-[#2B660E] dark:hover:border-[#B7F36B] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="p-3.5 space-y-2.5 max-h-[190px] overflow-y-auto text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-2.5 rounded-2xl max-w-[90%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#111318] dark:bg-[#E9EDF3] text-white dark:text-[#0B0D10] font-medium'
                      : 'border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] text-[#111318] dark:text-[#E9EDF3]'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Direct Action: Transfer idea to main text area */}
                {msg.suggestionPrompt && (
                  <button
                    type="button"
                    onClick={() => onApplyPrompt(msg.suggestionPrompt!)}
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#2B660E] dark:text-[#B7F36B] hover:underline cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isEn ? 'Paste this idea into box ✍️' : 'Bu fikri kutuya aktar ✍️'}</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Message Input Footer */}
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSend(inputVal)
            }}
            className="p-2 border-t border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] flex items-center gap-1.5"
          >
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder={isEn ? 'Ask mentor a question...' : 'Öğretmene bir soru sor...'}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-[#111318] dark:text-[#E9EDF3] placeholder:text-[#9CA3AF] dark:placeholder:text-[#64748B] outline-none"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-1.5 rounded-xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </motion.div>

        {/* The Enlarged Teacher Advisor Character standing flush on the bottom line! */}
        <div className="relative translate-y-[2px] mt-1">
          <TeacherAdvisorFigure size="lg" />
        </div>
      </div>
    </div>
  )
}
