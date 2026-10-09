import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { LoadingScreen } from '@/features/landing/LoadingScreen'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { LandingPage } from '@/pages/LandingPage'
import { RoadmapPage } from '@/pages/RoadmapPage'
import '@/i18n/i18n'

const SESSION_INTRO_KEY = 'projectpath_intro_seen'

export function App() {
  const prefersReducedMotion = useReducedMotion()

  const [showLoading, setShowLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    // Allow URL query override ?replay=1 for test/demo purposes
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('replay') === '1') {
      return true
    }
    // Session-based flag so the full intro does not replay on every internal navigation
    const hasSeenIntro = sessionStorage.getItem(SESSION_INTRO_KEY)
    return !hasSeenIntro
  })

  const handleLoadingComplete = () => {
    sessionStorage.setItem(SESSION_INTRO_KEY, 'true')
    setShowLoading(false)
  }

  return (
    <BrowserRouter>
      {/* Signature Initial Loading Experience */}
      {showLoading && (
        <LoadingScreen
          onComplete={handleLoadingComplete}
          prefersReducedMotion={prefersReducedMotion}
        />
      )}

      {/* Main Web Application Container (Clean Canvas with no top bar) */}
      <div className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0B0D10] text-[#111318] dark:text-[#E9EDF3] transition-colors selection:bg-[#2B660E]/20 dark:selection:bg-[#B7F36B] dark:selection:text-[#0B0D10]">
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
