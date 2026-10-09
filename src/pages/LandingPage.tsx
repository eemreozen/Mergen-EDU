import { useState } from 'react'
import { HeroSection } from '@/features/landing/HeroSection'

export function LandingPage() {
  const [projectIdea, setProjectIdea] = useState('')

  return (
    <div className="w-full flex flex-col items-center justify-between flex-1 relative">
      <HeroSection
        externalIdea={projectIdea}
        onIdeaChange={setProjectIdea}
      />
    </div>
  )
}
