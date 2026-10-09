import { Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme()
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-lg border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:border-[#CBD5E1] dark:hover:border-[#3E4752] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B660E] dark:focus-visible:ring-[#B7F36B] cursor-pointer ${className}`}
      aria-label={t('nav.toggleTheme')}
      title={t('nav.toggleTheme')}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-200 rotate-0 hover:-rotate-12" />
      )}
    </button>
  )
}
