import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onComplete: () => void
  prefersReducedMotion?: boolean
}

export function LoadingScreen({ onComplete, prefersReducedMotion = false }: LoadingScreenProps) {
  const [progress, setProgress] = useState<number>(() => (prefersReducedMotion ? 100 : 0))
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  useEffect(() => {
    if (prefersReducedMotion) {
      const timeout = setTimeout(() => {
        setIsCompleted(true)
        setTimeout(onComplete, 200)
      }, 300)
      return () => clearTimeout(timeout)
    }

    const startTime = performance.now()
    const targetDuration = 1800 // ~1.8 seconds smooth progression

    let animationFrameId: number

    const tick = (now: number) => {
      const elapsed = now - startTime
      const linearRatio = Math.min(elapsed / targetDuration, 1)

      // Smooth custom easing curve: easeInOutCubic
      const easedRatio =
        linearRatio < 0.5
          ? 4 * linearRatio * linearRatio * linearRatio
          : 1 - Math.pow(-2 * linearRatio + 2, 3) / 2

      const currentPercent = Math.min(Math.round(easedRatio * 100), 100)
      setProgress(currentPercent)

      if (linearRatio < 1) {
        animationFrameId = requestAnimationFrame(tick)
      } else {
        setProgress(100)
        // Brief pause after fully revealed (350ms) as specified
        setTimeout(() => {
          setIsCompleted(true)
          setTimeout(onComplete, 450)
        }, 350)
      }
    }

    animationFrameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [onComplete, prefersReducedMotion])

  const handleSkip = () => {
    setIsCompleted(true)
    setTimeout(onComplete, 150)
  }

  return (
    <AnimatePresence>
      {!isCompleted && (
        <motion.div
          key="loader-container"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.99, filter: 'blur(4px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0D10] text-center select-none overflow-hidden px-6"
          role="status"
          aria-live="polite"
          aria-label="Mergen yükleniyor"
        >
          {/* Top minimal status bar */}
          <div className="absolute top-8 left-8 right-8 flex items-center justify-between text-xs font-mono text-[#4A5361] tracking-wider uppercase pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B7F36B] animate-pulse" />
              <span>MERGEN // RUNTIME_INIT</span>
            </div>
            <div className="hidden sm:block">
              <span>PROJE ODAKLI ÖĞRENME SİSTEMİ</span>
            </div>
          </div>

          {/* Signature Typography Container with ample top clearance so Turkish dots (İ, ş) are never cut */}
          <div className="relative max-w-5xl mx-auto pt-16 pb-6 overflow-visible">
            {/* 1. Base Layer: Dark, low-contrast text that marks the full shape */}
            <div
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.2] select-none text-[#1A1F26] overflow-visible"
              aria-hidden="true"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center sm:gap-4 md:gap-6 pt-2">
                <span>Fikrine</span>
                <span>tırmanan yol</span>
              </div>
            </div>

            {/* 2. Reveal Layer: Progressive fill from left to right */}
            <div
              className="absolute inset-0 pt-16 pb-6 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[1.2] select-none pointer-events-none transition-none overflow-visible"
              style={{
                clipPath: `inset(0 ${100 - progress}% 0 0)`,
                WebkitClipPath: `inset(0 ${100 - progress}% 0 0)`,
              }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center sm:gap-4 md:gap-6 pt-2">
                <span className="text-[#E9EDF3]">Fikrine</span>
                <span className="text-[#B7F36B]">tırmanan yol</span>
              </div>
            </div>
          </div>

          {/* 3. The Roadmap Path Under the Text - Reveals in exact synchronization */}
          <div className="relative w-full max-w-2xl px-4 mt-2 mb-6">
            {/* Base Dimmed Path */}
            <svg
              viewBox="0 0 600 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-8 sm:h-10 text-[#1A1F26]"
              aria-hidden="true"
            >
              <path
                d="M 20,20 Q 150,34 300,16 T 580,20"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="4 4"
              />
              <circle cx="20" cy="20" r="5" fill="#0B0D10" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="160" cy="25" r="4" fill="#0B0D10" stroke="currentColor" strokeWidth="2" />
              <circle cx="300" cy="16" r="4.5" fill="#0B0D10" stroke="currentColor" strokeWidth="2" />
              <circle cx="440" cy="22" r="4" fill="#0B0D10" stroke="currentColor" strokeWidth="2" />
              <circle cx="580" cy="20" r="6" fill="#0B0D10" stroke="currentColor" strokeWidth="2.5" />
            </svg>

            {/* Revealed Accent Path (Opens concurrently with text) */}
            <div
              className="absolute inset-0 px-4 transition-none pointer-events-none"
              style={{
                clipPath: `inset(0 ${100 - progress}% 0 0)`,
                WebkitClipPath: `inset(0 ${100 - progress}% 0 0)`,
              }}
            >
              <svg
                viewBox="0 0 600 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-8 sm:h-10 text-[#B7F36B]"
                aria-hidden="true"
              >
                <path
                  d="M 20,20 Q 150,34 300,16 T 580,20"
                  stroke="#B7F36B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="20" r="5" fill="#B7F36B" />
                <circle cx="160" cy="25" r="4" fill="#B7F36B" />
                <circle cx="300" cy="16" r="5" fill="#B7F36B" />
                <circle cx="440" cy="22" r="4" fill="#B7F36B" />
                <circle cx="580" cy="20" r="6" fill="#B7F36B" />
              </svg>
            </div>
          </div>

          {/* Progress numeric meter below path */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="font-mono text-xs sm:text-sm tracking-widest text-[#9CA3AF] flex items-center gap-3">
              <span className="text-[11px] uppercase text-[#6B7280]">YOL OLUŞTURULUYOR</span>
              <span className="text-[#B7F36B] font-semibold">
                {progress.toString().padStart(3, '0')}%
              </span>
            </div>
          </div>

          {/* Quick skip button */}
          <button
            type="button"
            onClick={handleSkip}
            className="absolute bottom-8 right-8 text-xs font-mono text-[#4A5361] hover:text-[#9CA3AF] transition-colors cursor-pointer py-1.5 px-3 rounded border border-transparent hover:border-[#2A3038]"
          >
            Atla [Esc]
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
