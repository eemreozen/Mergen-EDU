import { useState } from 'react'
import { HeroSection } from '@/features/landing/HeroSection'
import { ProjectAdvisor } from '@/components/shared/ProjectAdvisorModal'

export function LandingPage() {
  const [projectIdea, setProjectIdea] = useState('')
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false)

  return (
    <div className="w-full flex flex-col items-center justify-between flex-1 relative">
      <HeroSection
        externalIdea={projectIdea}
        onIdeaChange={setProjectIdea}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
      />

      {/* Interactive Project Advisor (Launched by clicking the lab-coat teacher on the bottom line) */}
      <ProjectAdvisor
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        hideFloatingTrigger
        onSelectPrompt={(prompt) => setProjectIdea(prompt)}
      />
    </div>
  )
}
