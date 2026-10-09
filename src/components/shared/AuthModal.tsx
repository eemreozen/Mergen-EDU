import { AnimatePresence, motion } from 'motion/react'
import { Check, Mail, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Logo } from './Logo'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      setEmail('')
      onClose()
    }, 2000)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF] dark:bg-[#171A20] p-6 shadow-2xl z-10 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#68717D] dark:text-[#9CA3AF] hover:text-[#111318] dark:hover:text-[#E9EDF3] hover:bg-[#F0F2F5] dark:hover:bg-[#1F232B] transition-colors cursor-pointer"
              aria-label={t('auth.close')}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <Logo className="mb-3" />
              <h2 id="auth-modal-title" className="text-xl font-bold tracking-tight text-[#111318] dark:text-[#E9EDF3]">
                {t('auth.title')}
              </h2>
              <p className="mt-1 text-xs text-[#68717D] dark:text-[#9CA3AF] max-w-xs">
                {t('auth.subtitle')}
              </p>
            </div>

            {/* Social Logins */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  alert(t('auth.demoNotice'))
                  onClose()
                }}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] text-[#111318] dark:text-[#E9EDF3] text-sm font-medium hover:bg-[#E3E7EC]/40 dark:hover:bg-[#1F232B] hover:border-[#CBD5E1] dark:hover:border-[#3E4752] transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>{t('auth.github')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  alert(t('auth.demoNotice'))
                  onClose()
                }}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] text-[#111318] dark:text-[#E9EDF3] text-sm font-medium hover:bg-[#E3E7EC]/40 dark:hover:bg-[#1F232B] hover:border-[#CBD5E1] dark:hover:border-[#3E4752] transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.053 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  />
                </svg>
                <span>{t('auth.google')}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E3E7EC] dark:border-[#2A3038]" />
              </div>
              <span className="relative px-3 bg-[#FFFFFF] dark:bg-[#171A20] text-[11px] uppercase tracking-wider text-[#9CA3AF] dark:text-[#64748B]">
                {t('auth.or')}
              </span>
            </div>

            {/* Email form */}
            {isSubmitted ? (
              <div className="p-4 rounded-xl border border-[#2B660E]/30 dark:border-[#B7F36B]/30 bg-[#2B660E]/5 dark:bg-[#B7F36B]/5 text-center flex flex-col items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-[#2B660E] dark:bg-[#B7F36B] text-[#FFFFFF] dark:text-[#0B0D10] flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-[#111318] dark:text-[#E9EDF3]">
                  Giriş bağlantısı gönderildi!
                </p>
                <p className="text-[11px] text-[#68717D] dark:text-[#9CA3AF]">
                  {email} adresini kontrol edin.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] text-[#111318] dark:text-[#E9EDF3] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-[#2B660E] dark:focus:ring-[#B7F36B]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#111318] dark:bg-[#E9EDF3] text-[#FFFFFF] dark:text-[#0B0D10] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  {t('auth.submit')}
                </button>
              </form>
            )}

            {/* Preview notice */}
            <p className="mt-4 text-[11px] text-center text-[#9CA3AF] dark:text-[#64748B]">
              {t('auth.demoNotice')}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
