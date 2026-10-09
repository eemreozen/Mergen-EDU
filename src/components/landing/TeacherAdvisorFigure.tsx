import { motion } from 'motion/react'
import { MessageSquare, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface TeacherAdvisorFigureProps {
  onClick?: () => void
  size?: 'md' | 'lg'
  showBubble?: boolean
}

export function TeacherAdvisorFigure({
  onClick,
  size = 'lg',
  showBubble = true,
}: TeacherAdvisorFigureProps) {
  const { i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')

  const sizeClasses = size === 'lg' ? 'w-48 h-64 sm:w-56 sm:h-72' : 'w-36 h-48 sm:w-40 sm:h-52'

  return (
    <div
      id="tour-teacher-guide"
      className="relative flex flex-col items-center select-none group cursor-pointer"
      onClick={onClick}
    >
      {/* 1. Animated Speech Bubble floating above teacher's head */}
      {showBubble && (
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-1 px-3.5 py-1.5 rounded-2xl border border-[#2B660E]/40 dark:border-[#B7F36B]/40 bg-[#FFFFFF] dark:bg-[#171A20] shadow-xl text-left flex items-center gap-2 max-w-[240px] pointer-events-auto group-hover:scale-105 transition-transform"
        >
          <div className="w-5 h-5 rounded-lg bg-[#2B660E]/15 dark:bg-[#B7F36B]/20 text-[#2B660E] dark:text-[#B7F36B] flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2B660E] dark:text-[#B7F36B] flex items-center gap-1">
              <span>{isEn ? 'Mentor Teacher' : 'Önlüklü Rehber'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B]" />
            </div>
            <div className="text-[11px] font-semibold text-[#111318] dark:text-[#E9EDF3] leading-snug">
              {isEn ? 'Click me to brainstorm! 💬' : 'Tıkla, birlikte planlayalım! 💬'}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. SVG Line-Art Illustration of the Teacher Wearing an Apron/Lab Coat (Önlük)
             The feet are drawn precisely at the bottom edge (y=210) so they stand
             flush on the footer horizontal border line! */}
      <div className={`relative ${sizeClasses} flex items-end justify-center`}>
        <svg
          viewBox="0 0 160 210"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible transition-transform duration-300 group-hover:scale-[1.03]"
          aria-label={isEn ? 'Teacher Advisor Character' : 'Önlüklü Danışman Öğretmen Çizimi'}
        >
          {/* Subtle Ambient Aura */}
          <circle cx="80" cy="100" r="75" fill="currentColor" className="text-[#2B660E]/5 dark:text-[#B7F36B]/5" />

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

          {/* NECK & COLLAR */}
          <path d="M75 62 L75 68 L85 68 L85 62" stroke="currentColor" strokeWidth="2" className="stroke-[#111318] dark:stroke-[#E9EDF3]" />
          <path d="M73 68 L80 75 L87 68" stroke="currentColor" strokeWidth="2" fill="none" className="stroke-[#2B660E] dark:stroke-[#B7F36B]" />

          {/* TEACHER'S APRON / LAB COAT (ÖNLÜK) */}
          {/* Main Coat Body */}
          <path
            d="M50 78 C50 78, 56 68, 80 68 C104 68, 110 78, 110 78 L114 150 C114 154, 108 156, 80 156 C52 156, 46 154, 46 150 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="text-[#FFFFFF] dark:text-[#111318] stroke-[#111318] dark:stroke-[#E9EDF3]"
          />

          {/* Apron Straps / Lapels */}
          <path
            d="M62 68 L70 110 L70 155"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-[#CBD5E1] dark:stroke-[#2A3038]"
          />
          <path
            d="M98 68 L90 110 L90 155"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="stroke-[#CBD5E1] dark:stroke-[#2A3038]"
          />

          {/* Apron Center Crease & Buttons */}
          <circle cx="80" cy="85" r="2" fill="currentColor" className="text-[#2B660E] dark:text-[#B7F36B]" />
          <circle cx="80" cy="100" r="2" fill="currentColor" className="text-[#2B660E] dark:text-[#B7F36B]" />
          <circle cx="80" cy="115" r="2" fill="currentColor" className="text-[#2B660E] dark:text-[#B7F36B]" />

          {/* Large Front Apron Pockets */}
          {/* Left Pocket with Pen & Ruler */}
          <rect
            x="54"
            y="112"
            width="18"
            height="22"
            rx="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="stroke-[#111318] dark:stroke-[#E9EDF3]"
          />
          {/* Pen in pocket */}
          <line x1="58" y1="104" x2="58" y2="114" stroke="#2B660E" strokeWidth="2.5" strokeLinecap="round" className="dark:stroke-[#B7F36B]" />
          <line x1="63" y1="106" x2="63" y2="114" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="stroke-[#9CA3AF] dark:stroke-[#64748B]" />

          {/* Right Pocket with Notebook/Card */}
          <rect
            x="88"
            y="112"
            width="18"
            height="22"
            rx="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="stroke-[#111318] dark:stroke-[#E9EDF3]"
          />
          <path
            d="M92 108 L102 108 L102 114 L92 114 Z"
            fill="#2B660E"
            fillOpacity="0.2"
            stroke="currentColor"
            strokeWidth="1.5"
            className="stroke-[#2B660E] dark:stroke-[#B7F36B]"
          />

          {/* ARMS */}
          {/* Left Arm: Holding up a helpful compass/pointer icon */}
          <path
            d="M50 78 L34 105 L42 118"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-[#111318] dark:stroke-[#E9EDF3]"
          />
          {/* Left Hand: Waving warmly */}
          <circle cx="43" cy="120" r="5" fill="currentColor" className="text-[#F7F8FA] dark:text-[#171A20] stroke-[#111318] dark:stroke-[#E9EDF3]" strokeWidth="2" />

          {/* Right Arm: Resting naturally on waist / holding notebook */}
          <path
            d="M110 78 L124 105 L116 118"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-[#111318] dark:stroke-[#E9EDF3]"
          />
          {/* Right Hand */}
          <circle cx="115" cy="120" r="5" fill="currentColor" className="text-[#F7F8FA] dark:text-[#171A20] stroke-[#111318] dark:stroke-[#E9EDF3]" strokeWidth="2" />

          {/* TROUSERS / LEGS */}
          {/* Left Leg */}
          <path
            d="M62 155 L62 198 L73 198 L75 155"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#20242B] dark:text-[#2A3038] stroke-[#111318] dark:stroke-[#E9EDF3]"
          />
          {/* Right Leg */}
          <path
            d="M85 155 L87 198 L98 198 L98 155"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#20242B] dark:text-[#2A3038] stroke-[#111318] dark:stroke-[#E9EDF3]"
          />

          {/* SHOES: Resting exactly at y=208 (FLUSH on the bottom line!) */}
          {/* Left Shoe */}
          <path
            d="M54 208 C54 200, 68 198, 74 198 L74 208 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="text-[#111318] dark:text-[#0B0D10] stroke-[#111318] dark:stroke-[#B7F36B]"
          />
          {/* Right Shoe */}
          <path
            d="M86 198 C92 198, 106 200, 106 208 L86 208 Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="text-[#111318] dark:text-[#0B0D10] stroke-[#111318] dark:stroke-[#B7F36B]"
          />

          {/* Little green check / star on shoes representing progression */}
          <circle cx="64" cy="204" r="1.5" fill="#2B660E" className="dark:fill-[#B7F36B]" />
          <circle cx="96" cy="204" r="1.5" fill="#2B660E" className="dark:fill-[#B7F36B]" />
        </svg>

        {/* Pulsing indicator above character */}
        <span className="absolute top-12 -right-1 w-3.5 h-3.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] border-2 border-white dark:border-[#171A20] animate-ping opacity-60" />
      </div>

      {/* 3. Small Caption Under Teacher */}
      <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#68717D] dark:text-[#9CA3AF] group-hover:text-[#2B660E] dark:group-hover:text-[#B7F36B] transition-colors">
        <MessageSquare className="w-3 h-3 text-[#2B660E] dark:text-[#B7F36B]" />
        <span>{isEn ? 'Click to consult advisor' : 'Danışmana danışmak için tıkla'}</span>
      </div>
    </div>
  )
}
