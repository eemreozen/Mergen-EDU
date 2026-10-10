import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { AdvisorMascot } from './AdvisorMascot'

export function AdvisorWelcome({ en = false, roadmap = false }: { en?: boolean; roadmap?: boolean }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => { const timer = window.setInterval(() => setPhase(value => Math.min(2, value + 1)), 4500); return () => window.clearInterval(timer) }, [])
  const messages = roadmap
    ? en ? ['Your answers are with me. Let’s build your path.', 'I’m connecting the skills your project needs.', 'Your path will start with a clear, practical first step.'] : ['Cevapların bende. Şimdi sana bir yol çizelim.', 'Projenin gerektirdiği becerileri birbirine bağlıyorum.', 'Yolculuğun, uygulayabileceğin net bir ilk adımla başlayacak.']
    : en ? ['Hi, I’m Mergen, your project mentor.', 'First, let’s understand what you want to build.', 'I’ll ask short questions where your idea needs clarity.'] : ['Merhaba, ben Mergen. Bu projede danışmanın olacağım.', 'Önce ne geliştirmek istediğini birlikte netleştirelim.', 'Fikrinde belirsiz kalan yerler için sana kısa sorular soracağım.']
  return <div role="status" aria-live="polite" className="rounded-3xl border border-[#8DAE76]/40 bg-white dark:bg-[#171A20] px-6 py-5 flex items-center gap-5 shadow-xl">
    <div className="shrink-0"><AdvisorMascot /></div><div><p className="text-[10px] font-mono uppercase tracking-widest text-[#64834e] mb-2">MERGEN · {en ? 'YOUR MENTOR' : 'PROJE DANIŞMANIN'}</p><p key={phase} className="advisor-message text-base font-medium leading-relaxed">{messages[phase]}</p><p className="mt-3 text-xs text-slate-500 flex gap-2 items-center"><LoaderCircle size={13} className="animate-spin" />{roadmap ? en ? 'Preparing your roadmap…' : 'Yol haritan hazırlanıyor…' : en ? 'Reading your idea…' : 'Fikrini inceliyorum…'}</p></div>
  </div>
}
