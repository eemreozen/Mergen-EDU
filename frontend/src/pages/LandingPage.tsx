import { WalkingAdvisor } from '@/components/landing/AdvisorMascot'
import { useState } from 'react'
import { HeroSection } from '@/features/landing/HeroSection'
import { UserDashboard } from '@/features/dashboard/UserDashboard'
import { useAuthStore } from '@/store/useAuthStore'

export function LandingPage() {
  const [projectIdea, setProjectIdea] = useState('')
  const user = useAuthStore(s => s.user)

  return (
    <div className={`w-full flex-1 flex flex-col items-center justify-start relative isolate ${user ? '' : 'pt-4 sm:pt-6 pb-36'}`}>
      <div aria-hidden="true" className="landing-dot-backdrop pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="landing-dot-grid absolute -inset-[34px]" />
      </div>
      {user ? <UserDashboard /> : <HeroSection
        externalIdea={projectIdea}
        onIdeaChange={setProjectIdea}
      />}
      {!user && <WalkingAdvisor />}
    </div>
  )
}
