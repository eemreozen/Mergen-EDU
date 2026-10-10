import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/** The same green spectacles and friendly face as the canvas advisor. */
export function AdvisorMascot({ walking = false }: { walking?: boolean }) {
  return <svg viewBox="0 0 96 120" fill="none" aria-hidden="true" className={`w-20 h-24 ${walking ? 'mascot-walk' : 'mascot-idle'}`}>
    <ellipse cx="48" cy="116" rx="27" ry="3" fill="currentColor" opacity=".1" />
    <g className="mascot-leg mascot-leg-back"><path d="M52 86L59 108L68 110" stroke="#697782" strokeWidth="8" strokeLinecap="round" /></g>
    <g className="mascot-arm mascot-arm-back"><path d="M59 65L70 82" stroke="#8DAE76" strokeWidth="7" strokeLinecap="round" /></g>
    <path d="M34 59Q48 54 62 59L64 88Q48 96 31 88Z" fill="#2B660E" />
    <path d="M43 59L48 70L54 59" stroke="#DDF1CA" strokeWidth="3" strokeLinejoin="round" />
    <g className="mascot-leg mascot-leg-front"><path d="M42 88L37 109L46 112" stroke="#344331" strokeWidth="8" strokeLinecap="round" /></g>
    <g className="mascot-arm mascot-arm-front"><path d="M35 66L24 82L31 86" stroke="#8DAE76" strokeWidth="7" strokeLinecap="round" /></g>
    <g className="mascot-head">
      <path d="M24 33C20 4 75 3 72 34" fill="#26302B" />
      <path d="M28 27Q48 16 68 27L66 43Q62 59 48 59Q32 57 29 43Z" fill="#F0F3E9" stroke="#344331" strokeWidth="2" />
      <path d="M25 27Q28 9 51 12Q69 12 72 28Q57 20 49 25Q39 19 25 27" fill="#26302B" />
      <rect x="31" y="29" width="15" height="12" rx="4" stroke="#2B660E" strokeWidth="3" />
      <rect x="51" y="29" width="15" height="12" rx="4" stroke="#2B660E" strokeWidth="3" />
      <path d="M46 34H51" stroke="#2B660E" strokeWidth="3" />
      <circle cx="39" cy="35" r="2" fill="#26302B" /><circle cx="58" cy="35" r="2" fill="#26302B" />
      <path d="M43 47Q49 53 56 46" stroke="#344331" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
}

export function WalkingAdvisor() {
  const { i18n } = useTranslation()
  const en = i18n.language.startsWith('en')
  const [returning, setReturning] = useState(false)
  const [greeted, setGreeted] = useState(false)
  return <div className="absolute bottom-0 inset-x-0 h-44 overflow-hidden pointer-events-none" aria-label={en ? 'Mergen, your project mentor' : 'Mergen, proje danışmanın'}>
    <div className="mascot-patrol absolute -bottom-1 left-0" onAnimationIteration={event => { if (event.target === event.currentTarget) setReturning(v => !v) }}>
      <div className="mascot-bubble absolute bottom-full mb-1 left-0 w-60 rounded-2xl rounded-bl-sm border border-[#8DAE76]/35 bg-white/95 dark:bg-[#171A20] shadow-sm px-3 py-2 text-xs text-[#526449] dark:text-[#C4D9B2]">
        {greeted ? (en ? 'Start with your idea. We will find the first step together.' : 'Fikrinden başlayalım. İlk adımı birlikte buluruz.') : (en ? 'Hi, I’m Mergen. Ready to build and learn?' : 'Merhaba, ben Mergen. Birlikte geliştirelim mi?')}
      </div>
      <button className="block pointer-events-auto cursor-pointer focus-visible:outline-2 focus-visible:outline-[#75a94b] rounded-xl" aria-label={en ? 'Greet Mergen' : 'Mergen ile selamlaş'} onClick={() => setGreeted(v => !v)} style={{ transform: returning ? 'scaleX(-1)' : undefined }}><AdvisorMascot walking /></button>
    </div>
  </div>
}
