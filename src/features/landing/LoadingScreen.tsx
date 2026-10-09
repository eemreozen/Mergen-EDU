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
    const targetDuration = 1700 // ~1.7 seconds smooth progression

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
          aria-label="ProjectPath yükleniyor"
        >
          {/* Subtle background ambient light */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#B7F36B] opacity-[0.035] blur-[140px] pointer-events-none rounded-full"
            aria-hidden="true"
          />

          {/* Top minimal status bar */}
          <div className="absolute top-8 left-8 right-8 flex items-center justify-between text-xs font-mono text-[#4A5361] tracking-wider uppercase pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B7F36B] animate-pulse" />
              <span>PROJECTPATH // RUNTIME_INIT</span>
            </div>
            <div className="hidden sm:block">
              <span>PROJE ODAKLI ÖĞRENME SİSTEMİ</span>
            </div>
          </div>

          {/* Signature Typography Container */}
          <div className="relative max-w-5xl mx-auto py-8">
            {/* 1. Base Layer: Dark, low-contrast text that marks the full shape */}
            <div
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-none select-none text-[#1A1F26]"
              aria-hidden="true"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center sm:gap-4 md:gap-6">
                <span>Fikrini.</span>
                <span>İnşa Et.</span>
              </div>
            </div>

            {/* 2. Reveal Layer: Progressive fill from left to right */}
            <div
              className="absolute inset-0 text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter leading-none select-none pointer-events-none transition-none"
              style={{
                clipPath: `inset(0 ${100 - progress}% 0 0)`,
                WebkitClipPath: `inset(0 ${100 - progress}% 0 0)`,
              }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center sm:gap-4 md:gap-6">
                <span className="text-[#E9EDF3]">Fikrini.</span>
                <span className="text-[#B7F36B]">İnşa Et.</span>
              </div>
            </div>

            {/* Micro scanline edge indicator following progress */}
            {progress > 0 && progress < 100 && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-[#B7F36B] shadow-[0_0_12px_#B7F36B] pointer-events-none transition-none opacity-70"
                style={{
                  left: `${progress}%`,
                }}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Progress numeric meter below typography */}
          <div className="mt-8 flex flex-col items-center gap-2 text-center">
            <div className="font-mono text-sm tracking-widest text-[#9CA3AF] flex items-center gap-3">
              <span className="text-xs uppercase text-[#6B7280]">YOL HAZIRLANIYOR</span>
              <span className="text-[#B7F36B] font-semibold">
                {progress.toString().padStart(3, '0')}%
              </span>
            </div>
          </div>

          {/* Quick skip button for instant developer access */}
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
