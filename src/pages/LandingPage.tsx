import { useState } from 'react'
import { HeroSection } from '@/features/landing/HeroSection'
import { ProjectAdvisor } from '@/components/shared/ProjectAdvisorModal'

export function LandingPage() {
  const [projectIdea, setProjectIdea] = useState('')

  return (
    <div className="w-full flex flex-col items-center justify-center flex-1 relative">
      <HeroSection
        externalIdea={projectIdea}
        onIdeaChange={setProjectIdea}
      />

      {/* Floating Smiling Advisor at bottom-left */}
      <ProjectAdvisor
        onSelectPrompt={(prompt) => setProjectIdea(prompt)}
      />
    </div>
  )
}
