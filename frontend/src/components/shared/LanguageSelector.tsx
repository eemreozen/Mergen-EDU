import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface LanguageOption {
  code: 'tr' | 'en'
  label: string
  flag: string
}

const languages: LanguageOption[] = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export function LanguageSelector({ className = '' }: { className?: string }) {
  const { i18n, t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = languages.find(l => l.code === (i18n.language.startsWith('en') ? 'en' : 'tr')) || languages[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelectLanguage = (langCode: 'tr' | 'en') => {
    i18n.changeLanguage(langCode)
    localStorage.setItem('projectpath_lang', langCode)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-[#111318] dark:text-[#E9EDF3] hover:border-[#CBD5E1] dark:hover:border-[#3E4752] transition-colors text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B660E] dark:focus-visible:ring-[#B7F36B] cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('nav.selectLanguage')}
      >
        <span className="text-sm leading-none" role="img" aria-label={currentLang.label}>
          {currentLang.flag}
        </span>
        <span className="hidden sm:inline">{currentLang.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#68717D] dark:text-[#9CA3AF] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-1.5 w-36 rounded-lg border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] shadow-lg shadow-black/10 py-1 z-50 overflow-hidden"
            role="listbox"
          >
            {languages.map(item => {
              const isSelected = item.code === currentLang.code
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectLanguage(item.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#E3E7EC]/40 dark:bg-[#2A3038]/50 text-[#111318] dark:text-[#E9EDF3] font-semibold'
                      : 'text-[#68717D] dark:text-[#9CA3AF] hover:bg-[#F0F2F5] dark:hover:bg-[#1F232B] hover:text-[#111318] dark:hover:text-[#E9EDF3]'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="flex items-center gap-2">
                    <span role="img" aria-label={item.label} className="text-sm">
                      {item.flag}
                    </span>
                    <span>{item.label}</span>
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2B660E] dark:bg-[#B7F36B]" />
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
