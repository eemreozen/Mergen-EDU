import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, History, LoaderCircle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { FloatingPanel } from './FloatingPanel'
import { api } from '@/api/client'
import type { MemoryChallenge, MemoryResult, TimeMachine } from '@/api/memory-types'

const primary = 'rounded-xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] px-4 py-3 text-sm font-semibold disabled:opacity-40 inline-flex items-center justify-center gap-2 cursor-pointer'
const card = 'rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] p-5'

export function TimeMachinePanel({ open, data, loadingError, disabled, close, refresh }: {
  open: boolean; data: TimeMachine | null; loadingError: string; disabled: boolean; close: () => void; refresh: () => Promise<void>
}) {
  const [tab, setTab] = useState<'practice' | 'history'>('practice')
  const [challenge, setChallenge] = useState<MemoryChallenge | null>(null)
  const [result, setResult] = useState<MemoryResult | null>(null)
  const [selection, setSelection] = useState<number | null>(null)
  const [submissionId, setSubmissionId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const perform = async (action: () => Promise<void>) => {
    if (busy || disabled) return
    setBusy(true); setError('')
    try { await action() } catch (err) { setError(err instanceof Error ? err.message : 'İşlem tamamlanamadı.') }
    finally { setBusy(false) }
  }
  const prepare = (id: string) => void perform(async () => {
    const next = await api.prepareMemory(id)
    setChallenge(next); setResult(null); setSelection(null); setSubmissionId(crypto.randomUUID())
  })
  const answer = () => challenge && selection !== null && void perform(async () => {
    const next = await api.answerMemory(challenge.reviewId, challenge.id, selection, submissionId)
    setResult(next)
    await refresh()
  })
  const back = () => { setChallenge(null); setResult(null); setError('') }
  const blocked = busy || disabled
  const reviews = [...(data?.reviews || [])].sort((a, b) => Number(b.due) - Number(a.due))
  return <FloatingPanel open={open} title="Zaman Makinesi" icon={<History size={17} />} close={close} width={440} height={530} anchor="memory">
      <div className="p-4 border-b border-[#E3E7EC] dark:border-[#2A3038]">
        <p className="mt-3 text-sm leading-relaxed text-[#68717D] dark:text-[#9CA3AF]">Başa dönmeden, kısa bir hatırlamayla devam et. Bu tekrarlar tamamladığın durakları veya mevcut ilerlemeni değiştirmez.</p>
        {!challenge && <div role="tablist" aria-label="Zaman Makinesi sekmeleri" className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-[#F0F2F5] dark:bg-[#1A1F26] p-1">
          {(['practice', 'history'] as const).map(key => <button key={key} role="tab" id={`memory-tab-${key}`} aria-controls={`memory-${key}`} aria-selected={tab === key} onClick={() => setTab(key)} className={`rounded-lg p-2.5 text-xs font-semibold cursor-pointer ${tab === key ? 'bg-white dark:bg-[#2A3038] shadow-sm' : 'text-[#68717D]'}`}>{key === 'practice' ? `Kısa tekrarlar${data?.dueCount ? ` · ${data.dueCount}` : ''}` : `Geçmiş yanlışlar${data ? ` · ${data.wrongQuestions.length}` : ''}`}</button>)}
        </div>}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(error || loadingError) && <div role="alert" className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300/30 p-4 text-sm space-y-2"><p>{error || loadingError}</p>{loadingError && <button onClick={() => void perform(refresh)} disabled={blocked} className="underline">Yeniden yükle</button>}</div>}
        {busy && <p role="status" className="flex items-center gap-2 text-xs text-[#68717D]"><LoaderCircle size={15} className="animate-spin" />{challenge && selection !== null && !result ? 'Yanıtın kontrol ediliyor…' : 'Kısa tekrar hazırlanıyor…'}</p>}
        {!data && !loadingError && <p className="text-sm text-[#68717D]">Geçmişin yükleniyor…</p>}
        {challenge ? <section className="space-y-5" aria-label="Hatırlama sorusu">
          <button className="text-xs text-[#68717D] inline-flex items-center gap-1" onClick={back} disabled={busy}><ArrowLeft size={14} />Tekrarlara dön</button>
          <div className="flex items-center gap-2 text-xs font-mono text-[#6B963F]"><Clock3 size={14} />1–2 dakika · {challenge.sourceTitle}</div>
          <h3 className="font-semibold text-lg leading-relaxed">{challenge.prompt}</h3>
          <fieldset disabled={blocked || !!result} className="space-y-2"><legend className="sr-only">Yanıtını seç</legend>{challenge.options.map((option, index) => <label key={index} className={`flex gap-3 p-4 border rounded-xl cursor-pointer text-sm ${result && index === result.correctIndex ? 'border-[#75a94b] bg-[#75a94b]/10' : selection === index ? 'border-[#75a94b] bg-[#75a94b]/5' : 'border-[#E3E7EC] dark:border-[#2A3038]'}`}><input type="radio" name={`memory-${challenge.id}`} checked={selection === index} onChange={() => setSelection(index)} className="mt-0.5" /><span>{option}</span></label>)}</fieldset>
          {!result && <button className={primary + ' w-full'} disabled={blocked || selection === null} onClick={answer}>Yanıtımı kontrol et<ArrowRight size={15} /></button>}
          {result && <div role="status" className="space-y-4">
            <div className={`${card} bg-[#75a94b]/5`}><h3 className="font-semibold flex items-center gap-2">{result.correct ? <CheckCircle2 size={18} className="text-[#6B963F]" /> : <Sparkles size={18} className="text-amber-500" />}{result.correct ? 'Bilgi hâlâ seninle.' : 'Kısa bir pekiştirme yeterli.'}</h3><p className="text-sm mt-2 leading-relaxed">{result.explanation}</p></div>
            {!result.correct && <><div className={card}><h4 className="font-semibold mb-2">Birlikte hatırlayalım</h4><p className="text-sm leading-relaxed whitespace-pre-wrap">{result.refresher}</p></div><div className={`${card} bg-amber-50/70 dark:bg-amber-950/15`}><h4 className="font-semibold mb-2">Mini uygulama · 1–2 dakika</h4><p className="text-sm leading-relaxed">{result.miniExercise}</p></div><button className={primary + ' w-full'} disabled={blocked} onClick={() => prepare(challenge.reviewId)}>Pekiştirdim, farklı soruyla dene</button></>}
            {result.correct && <><p className="text-xs text-[#68717D]">Bir sonraki hatırlatma {result.remainingSteps} yeni durak tamamlandığında veya {new Date(result.nextDueAt).toLocaleDateString('tr-TR')} tarihinde gelecek.</p><button className={primary + ' w-full'} onClick={close}>Kaldığım yerden devam et<ArrowRight size={15} /></button></>}
          </div>}
        </section> : tab === 'practice' ? <section role="tabpanel" id="memory-practice" aria-labelledby="memory-tab-practice" className="space-y-4">
          {data && !reviews.length && <div className={`${card} text-sm leading-relaxed text-[#68717D]`}>Bir durağı tamamladığında öğrendiğin konular burada birikecek. Üç yeni ana durak tamamlayınca veya bir gün sonra kısa bir hatırlatma sunacağız.</div>}
          {data && !!reviews.length && !data.dueCount && <p className="text-sm text-[#68717D]">Şu an zamanı gelen tekrar yok. İstersen öğrendiğin bir konuyu erkenden pekiştirebilirsin.</p>}
          {reviews.map(review => <article key={review.id} className={`${card} ${review.due ? 'border-[#75a94b]/50 bg-[#75a94b]/5' : ''}`}><div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-sm">{review.sourceTitle}</h3><span className="shrink-0 text-[10px] font-mono rounded-full px-2 py-1 bg-[#F0F2F5] dark:bg-[#20262E]">{review.status === 'refresher' ? 'Pekiştirme' : review.due ? 'Zamanı geldi' : `${review.remainingSteps} durak sonra`}</span></div><p className="text-xs text-[#68717D] mt-2">{review.skill} · {review.level ? `${review.level} başarılı hatırlama` : 'İlk hatırlama'} · 1–2 dakika</p><button className={primary + ' mt-4 w-full'} disabled={blocked} onClick={() => prepare(review.id)}>Farklı soruyla hatırla<ArrowRight size={14} /></button></article>)}
        </section> : <section role="tabpanel" id="memory-history" aria-labelledby="memory-tab-history" className="space-y-4">
          {data && !data.wrongQuestions.length && <div className={`${card} text-sm text-[#68717D]`}>Henüz yanlış cevap kaydı yok. Takıldığın sorular açıklamalarıyla burada saklanacak.</div>}
          {data?.wrongQuestions.map(item => <article key={item.questionId} className={card}><div className="flex justify-between gap-3 text-[10px] font-mono text-[#68717D]"><span>{item.nodeTitle}</span><span className="shrink-0">{item.wrongCount} kez</span></div><h3 className="font-semibold text-sm mt-3 leading-relaxed">{item.prompt}</h3><details className="mt-3 text-sm"><summary className="cursor-pointer text-[#68717D]">Yanıtımı ve açıklamayı göster</summary><div className="mt-3 space-y-2 leading-relaxed"><p><span className="text-[#68717D]">Yanıtın: </span>{item.selectedOption}</p><p><span className="text-[#6B963F]">Doğru yanıt: </span>{item.correctOption}</p><p>{item.explanation}</p></div></details>{item.reviewId ? <button className="text-xs text-[#5C8738] dark:text-[#B7F36B] mt-4 inline-flex items-center gap-1" disabled={blocked} onClick={() => prepare(item.reviewId!)}>Farklı bir örnekle pekiştir<ArrowRight size={13} /></button> : <p className="text-xs text-[#68717D] mt-4">Bu konuyu tamamladığında kısa tekrarları açılacak.</p>}</article>)}
        </section>}
      </div>
      <footer className="p-4 border-t border-[#E3E7EC] dark:border-[#2A3038] text-[11px] text-[#68717D] text-center">Hatırlamak için küçük bir mola. İlerlemen olduğu yerde kalır.</footer>
  </FloatingPanel>
}
