import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut } from 'lucide-react'
import { AuthModal } from '../shared/AuthModal'
import { LanguageSelector } from '../shared/LanguageSelector'
import { Logo } from '../shared/Logo'
import { ThemeToggle } from '../shared/ThemeToggle'
import { useAuthStore } from '@/store/useAuthStore'

export function Header() {
  const { t, i18n } = useTranslation()
  const isEn = i18n.language.startsWith('en')
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#E3E7EC]/80 dark:border-[#2A3038]/80 bg-[#FFFFFF]/85 dark:bg-[#0B0D10]/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Right: Separate Box for User / "Giriş Yap" + Language and Theme icon */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user ? (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#171A20] shadow-xs">
                <div className="w-6 h-6 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] text-[10px] font-bold flex items-center justify-center">
                  {user.avatar}
                </div>
                <span className="text-xs font-semibold text-[#111318] dark:text-[#E9EDF3] hidden sm:inline">
                  {user.name}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1 text-[#9CA3AF] hover:text-red-500 transition-colors cursor-pointer"
                  title={isEn ? 'Sign Out' : 'Çıkış Yap'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#171A20] shadow-xs">
                <span className="text-[11px] font-mono text-[#68717D] dark:text-[#9CA3AF] hidden sm:inline">
                  {isEn ? 'Been here before?' : 'Daha önce geldin mi?'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#111318] dark:bg-[#E9EDF3] text-[#FFFFFF] dark:text-[#0B0D10] hover:bg-[#2B660E] dark:hover:bg-[#B7F36B] transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  {t('nav.signIn')}
                </button>
              </div>
            )}

            <div className="h-5 w-[1px] bg-[#E3E7EC] dark:bg-[#2A3038]" />

            {/* 2. Language Selector */}
            <LanguageSelector />

            <div className="h-5 w-[1px] bg-[#E3E7EC] dark:bg-[#2A3038]" />

            {/* 3. Theme Toggle (Ay / Güneş) - on its own */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
