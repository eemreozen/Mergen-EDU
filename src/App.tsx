import { useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { LoadingScreen } from '@/features/landing/LoadingScreen'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { CanvasPage } from '@/pages/CanvasPage'
import { LandingPage } from '@/pages/LandingPage'
import { RoadmapPage } from '@/pages/RoadmapPage'
import '@/i18n/i18n'

const SESSION_INTRO_KEY = 'projectpath_intro_seen'

function AppContent() {
  const location = useLocation()
  const isCanvasView = location.pathname === '/canvas'

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] dark:bg-[#0B0D10] text-[#111318] dark:text-[#E9EDF3] transition-colors selection:bg-[#2B660E]/20 dark:selection:bg-[#B7F36B] dark:selection:text-[#0B0D10]">
      {!isCanvasView && <Header />}

      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/canvas" element={<CanvasPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>

      {!isCanvasView && <Footer />}
    </div>
  )
}

export function App() {
  const prefersReducedMotion = useReducedMotion()

  const [showLoading, setShowLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('replay') === '1') {
      return true
    }
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

      <AppContent />
    </BrowserRouter>
  )
}

export default App
