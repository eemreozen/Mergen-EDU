import type { CSSProperties } from 'react'
import { Sparkles } from 'lucide-react'

export type Reward = { id: number; kind: 'success' | 'retry' | 'practice'; message: string; points: number; nodeId?: string }

export function LearningReward({ reward }: { reward: Reward | null }) {
  if (!reward) return null
  return <div key={reward.id} className="pointer-events-none fixed inset-0 z-[90]" aria-live="polite">
    {reward.kind === 'success' && Array.from({length: 26}, (_, i) => <span key={i} className="learning-confetti absolute top-[12%] h-2.5 w-1.5 rounded-sm" style={{ left: `${15 + (i * 37 % 70)}%`, background: ['#2B660E','#8DAE76','#B7F36B','#D5AD62'][i%4], '--drift': `${(i%2 ? 1 : -1)*(30+i*7)}px`, animationDelay: `${i%5*.06}s` } as CSSProperties} />)}
    <div className="advisor-message absolute top-36 left-1/2 -translate-x-1/2 max-w-sm rounded-2xl border border-[#8DAE76]/40 bg-white dark:bg-[#171A20] shadow-xl px-5 py-4 text-center">
      <div className="flex items-center justify-center gap-2 text-[#2B660E] dark:text-[#B7F36B] font-bold"><Sparkles size={17} />{reward.points > 0 ? `+${reward.points} puan` : reward.kind === 'practice' ? 'Deneme tamamlandı' : reward.kind === 'retry' ? 'Birlikte pekiştirelim' : 'Bir adım daha ilerledin!'}</div><p className="text-sm mt-2 leading-relaxed">{reward.message}</p>
    </div>
  </div>
}
