import { useTranslation } from 'react-i18next'
import { Logo } from '../shared/Logo'

const CURRENT_YEAR = 2026

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="w-full border-t border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#0B0D10] py-8 transition-colors mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo iconOnly className="opacity-75" />
          <span className="text-xs text-[#68717D] dark:text-[#9CA3AF]">
            {t('footer.tagline')}
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#9CA3AF] dark:text-[#64748B]">
          <span>© {CURRENT_YEAR} Mergen. {t('footer.rights')}</span>
          <span className="font-mono text-[11px] opacity-70">v0.1.0-preview</span>
        </div>
      </div>
    </footer>
  )
}
