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
        ? "Hello! I'm your Project Mentor. Tell me your idea, and I'll help you craft the perfect learning roadmap! 🎓"
        : "Merhaba! Ben Proje Rehberinizim. Aklındaki fikri anlat, senin için en doğru projeyi ve öğrenme rotasını birlikte çıkaralım! 🎓",
      suggestionPrompt: isEn
        ? 'I want to build an online boutique store to sell handmade items.'
        : 'Kendi ürünlerimi sergileyip satabileceğim şık bir online mağaza açmak istiyorum.',
    },
  ])

  const quickQuestions = isEn
    ? [
        { label: '💡 Need ideas?', q: 'I have no project ideas, what can I build?' },
        { label: '🎯 Where to begin?', q: 'I am a beginner, how do I start learning?' },
      ]
    : [
        { label: '💡 Fikir bulamıyorum', q: 'Aklımda henüz bir proje yok, ne önerirsin?' },
        { label: '🎯 Nereden başlamalıyım?', q: 'Daha önce hiç proje yapmadım, nereden başlamalıyım?' },
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
          ? 'An interactive Fitness Coach or an Online Store is a fantastic starter project! It teaches you state, user interfaces, and data flow step by step.'
          : 'Kullanıcıların egzersizlerini takip eden bir "Akıllı Fitness Koçu" veya "Online Alışveriş Mağazası" harika bir başlangıçtır! Hem görsel tasarım hem de veri yönetimini adım adım öğretir.'
        promptToSuggest = isEn
          ? 'I want to build an AI workout coach that tracks exercises and nutrition.'
          : 'Egzersiz hareketlerimi ve günlük beslenmemi analiz eden akıllı bir fitness asistanı geliştirmek istiyorum.'
      } else if (userText.includes('başla') || userText.includes('beginner') || userText.includes('start')) {
        reply = isEn
          ? 'Do not worry about technical jargon! Describe what you want in simple words, and Mergen will prepare a gentle, bottom-to-top learning map starting from basecamp.'
          : 'Hiç endişelenme! Hiçbir teknik terim bilmeden aklındaki fikri yazabilirsin. Sistem en temel adımlardan zirveye doğru sana özel bir tırmanış haritası çıkaracaktır.'
        promptToSuggest = isEn
          ? 'I want to build a real-time messaging application to chat with friends.'
          : 'Arkadaşların grup oluşturup anlık mesajlaşabildiği güvenli bir sohbet uygulaması yapmak istiyorum.'
      } else {
        reply = isEn
          ? `Great direction! "${userText.slice(0, 35)}..." is an exciting challenge. You can paste this directly into your project idea box!`
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
    }, 450)
  }

  return (
    <div className="w-full flex flex-col justify-between">
      {/* Symmetrical Top Header (Matches left column height) */}
      <div className="h-14 sm:h-16 flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 border-2 border-[#2B660E]/20 dark:border-[#B7F36B]/25 flex items-center justify-center font-bold shrink-0">
            <Bot className="w-6 h-6 text-[#2B660E] dark:text-[#B7F36B]" />
          </div>
          <div className="text-left">
            <h3 className="text-base sm:text-lg font-bold text-[#111318] dark:text-[#E9EDF3] leading-tight">
              {isEn ? 'Mentor Consultation Desk' : 'Önlüklü Danışman Masası'}
            </h3>
            <p className="text-xs text-[#68717D] dark:text-[#9CA3AF] flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] animate-pulse" />
              <span>{isEn ? 'Live Advisor · Instant guidance' : 'Canlı Rehber · Sorunu yanıtlar, fikrini netleştirir'}</span>
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B] font-semibold hidden sm:inline">
          AI Guide
        </span>
      </div>

      {/* Main Symmetrical Area: Chat Card + Teacher Character Standing Side-by-Side */}
      <div className="w-full flex flex-col sm:flex-row items-end gap-3 h-[340px]">
        
        {/* 1. The Interactive Consultation Chat Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex-1 w-full h-full rounded-3xl border-2 border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-xl p-3.5 flex flex-col justify-between overflow-hidden text-left"
        >
          {/* Quick Questions Header */}
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[#E3E7EC]/60 dark:border-[#2A3038]/60">
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
          <div className="flex-1 py-2 overflow-y-auto space-y-2 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-2.5 rounded-2xl max-w-[92%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#111318] dark:bg-[#E9EDF3] text-white dark:text-[#0B0D10] font-medium'
                      : 'border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] text-[#111318] dark:text-[#E9EDF3]'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Transfer suggestion to main idea textarea */}
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

          {/* Input Footer */}
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSend(inputVal)
            }}
            className="pt-2 border-t border-[#E3E7EC] dark:border-[#2A3038] flex items-center gap-1.5"
          >
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder={isEn ? 'Ask mentor a question...' : 'Öğretmene bir soru sor...'}
              className="flex-1 bg-transparent px-2.5 py-1 text-xs text-[#111318] dark:text-[#E9EDF3] placeholder:text-[#9CA3AF] dark:placeholder:text-[#64748B] outline-none font-normal"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="p-1.5 rounded-xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] disabled:opacity-40 transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </motion.div>

        {/* 2. The Enlarged Teacher Advisor Character (Standing side-by-side with feet on bottom line!) */}
        <div className="shrink-0 flex items-end justify-center translate-y-[2px]">
          <TeacherAdvisorFigure size="md" showBubble={false} showCaption={false} />
        </div>
      </div>

      {/* Symmetrical Bottom Label (Matches height of left side inspiration chips) */}
      <div className="mt-4 pt-1 flex items-center justify-between text-xs font-mono text-[#9CA3AF] dark:text-[#64748B] px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2B660E] dark:bg-[#B7F36B]" />
          <span>{isEn ? 'Lab-Coat Mentor · Always online' : 'Önlüklü Rehber Öğretmen · Her zaman danışabilirsin'}</span>
        </div>
        <span className="text-[10px] opacity-70">Mergen AI</span>
      </div>
    </div>
  )
}
