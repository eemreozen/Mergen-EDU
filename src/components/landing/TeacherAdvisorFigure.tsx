import { motion } from 'motion/react'
import { MessageSquare, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TeacherAdvisorFigureProps {
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  showBubble?: boolean
  showCaption?: boolean
  className?: string
}

export function TeacherAdvisorFigure({
  onClick,
  size = 'md',
  showBubble = true,
  showCaption = true,
  className = '',
}: TeacherAdvisorFigureProps) {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const sizeClasses =
    size === 'lg'
      ? 'w-20 h-20 sm:w-24 sm:h-24'
      : size === 'md'
      ? 'w-16 h-16 sm:w-20 sm:h-20'
      : 'w-12 h-12 sm:w-14 sm:h-14'

  return (
    <div
      id="tour-teacher-guide"
      className={`relative flex flex-col items-center select-none group cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* 1. Animated Speech Bubble floating above teacher's head */}
      {showBubble && (
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-2 px-3 py-1.5 rounded-2xl border border-[#2B660E]/40 dark:border-[#B7F36B]/40 bg-[#FFFFFF] dark:bg-[#171A20] shadow-xl text-left flex items-center gap-2 max-w-[220px] pointer-events-auto group-hover:scale-105 transition-transform"
        >
          <div className="w-5 h-5 rounded-lg bg-[#2B660E]/15 dark:bg-[#B7F36B]/20 text-[#2B660E] dark:text-[#B7F36B] flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2B660E] dark:text-[#B7F36B] flex items-center gap-1">
              <span>{isEn ? 'Mentor Advisor' : 'Rehber Danışman'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B]" />
            </div>
            <div className="text-[11px] font-semibold text-[#111318] dark:text-[#E9EDF3] leading-snug">
              {isEn ? 'Click to brainstorm! 💬' : 'Tıkla, planlayalım! 💬'}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Geometric Head Avatar Container (matching Logo card aesthetic) */}
      <div
        className={`relative ${sizeClasses} rounded-3xl bg-[#FFFFFF] dark:bg-[#171A20] border-2 border-[#E3E7EC] dark:border-[#2A3038] group-hover:border-[#2B660E] dark:group-hover:border-[#B7F36B] shadow-xl flex items-center justify-center transition-all duration-300 p-2`}
      >
        <svg
          viewBox="52 28 56 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-105"
          aria-label={isEn ? 'Teacher Advisor Head' : 'Danışman Öğretmen'}
        >
          {/* Subtle Ambient Aura */}
          <circle cx="80" cy="52" r="32" fill="currentColor" className="text-[#2B660E]/10 dark:text-[#B7F36B]/10" />

          {/* HEAD & HAIR */}
          {/* Hair back */}
          <path
            d="M58 52 C56 34, 104 34, 102 52"
            fill="currentColor"
            className="text-[#1A1F26] dark:text-[#E9EDF3]"
          />
          {/* Face */}
          <path
            d="M62 48 C62 66, 98 66, 98 48 C98 38, 62 38, 62 48 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="text-[#F7F8FA] dark:text-[#171A20] stroke-[#111318] dark:stroke-[#E9EDF3]"
          />
          {/* Friendly Hair Top */}
          <path
            d="M58 44 C62 32, 98 32, 102 44 C95 40, 85 41, 80 43 C75 41, 65 40, 58 44 Z"
            fill="currentColor"
            className="text-[#2A3038] dark:text-[#CBD5E1]"
          />

          {/* EYES & GLASSES */}
          {/* Spectacles Bridge */}
          <line x1="77" y1="48" x2="83" y2="48" stroke="currentColor" strokeWidth="2" className="stroke-[#2B660E] dark:stroke-[#B7F36B]" />
          {/* Left Lens */}
          <rect
            x="66"
            y="43"
            width="11"
            height="10"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="stroke-[#2B660E] dark:stroke-[#B7F36B]"
          />
          {/* Right Lens */}
          <rect
            x="83"
            y="43"
            width="11"
            height="10"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="stroke-[#2B660E] dark:stroke-[#B7F36B]"
          />
          {/* Happy smiling eyes */}
          <circle cx="71.5" cy="48" r="1.5" fill="currentColor" className="text-[#111318] dark:text-[#E9EDF3]" />
          <circle cx="88.5" cy="48" r="1.5" fill="currentColor" className="text-[#111318] dark:text-[#E9EDF3]" />

          {/* Warm Smile */}
          <path
            d="M75 56 Q80 60 85 56"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-[#111318] dark:stroke-[#E9EDF3]"
          />

          {/* Clean Collar */}
          <path d="M76 62 L76 67 L84 67 L84 62" stroke="currentColor" strokeWidth="2" className="stroke-[#111318] dark:stroke-[#E9EDF3]" />
          <path d="M74 67 L80 73 L86 67" stroke="currentColor" strokeWidth="2" fill="none" className="stroke-[#2B660E] dark:stroke-[#B7F36B]" />
        </svg>

        {/* Online Indicator Badge */}
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] border-2 border-white dark:border-[#171A20]" />
      </div>

      {/* 3. Small Caption Under Head */}
      {showCaption && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#68717D] dark:text-[#9CA3AF] group-hover:text-[#2B660E] dark:group-hover:text-[#B7F36B] transition-colors">
          <MessageSquare className="w-3 h-3 text-[#2B660E] dark:text-[#B7F36B]" />
          <span>{isEn ? 'Ask Advisor' : 'Danışmana Danış'}</span>
        </div>
      )}
    </div>
  )
}
