import { useState } from 'react'
import { HeroSection } from '@/features/landing/HeroSection'

export function LandingPage() {
  const [projectIdea, setProjectIdea] = useState('')

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative py-4 sm:py-6 my-auto">
      <HeroSection
        externalIdea={projectIdea}
        onIdeaChange={setProjectIdea}
      />
    </div>
  )
}
