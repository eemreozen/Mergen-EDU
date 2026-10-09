import { useState } from 'react'
import { HeroSection } from '@/features/landing/HeroSection'
import { UserDashboard } from '@/features/dashboard/UserDashboard'
import { useAuthStore } from '@/store/useAuthStore'

export function LandingPage() {
  const [projectIdea, setProjectIdea] = useState('')
  const user = useAuthStore(s => s.user)

  if (user) {
    return <UserDashboard />
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start relative pt-4 sm:pt-6">
      <HeroSection
        externalIdea={projectIdea}
        onIdeaChange={setProjectIdea}
      />
    </div>
  )
}
