import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AuthModal } from '../shared/AuthModal'
import { LanguageSelector } from '../shared/LanguageSelector'
import { Logo } from '../shared/Logo'
import { ThemeToggle } from '../shared/ThemeToggle'

export function Header() {
  const { t } = useTranslation()
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#E3E7EC]/80 dark:border-[#2A3038]/80 bg-[#F7F8FA]/90 dark:bg-[#0B0D10]/90 backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Logo & Wordmark */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <LanguageSelector />
            <ThemeToggle />
            
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#111318] dark:bg-[#E9EDF3] text-[#FFFFFF] dark:text-[#0B0D10] hover:bg-[#2A3038] dark:hover:bg-[#FFFFFF] transition-all duration-150 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B660E] dark:focus-visible:ring-[#B7F36B]"
            >
              {t('nav.signIn')}
            </button>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
