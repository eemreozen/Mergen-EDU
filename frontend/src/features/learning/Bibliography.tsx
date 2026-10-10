import { BookOpen, ExternalLink, LoaderCircle, RefreshCw, Video } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/api/client'
import type { ReferenceView } from '@/api/resource-types'
import type { ResourceView } from '@/api/types'

function ResourceLinks({ resources }: { resources: ResourceView[] }) {
  return <ul className="space-y-2">{resources.map(resource => <li key={resource.id}>
    <a href={resource.url} target="_blank" rel="noopener noreferrer"
      className="group flex items-start justify-between gap-3 rounded-xl border border-[#E3E7EC] dark:border-[#2A3038] p-3 transition-colors hover:border-[#75a94b] hover:bg-[#75a94b]/5 focus-visible:outline-2 focus-visible:outline-[#75a94b]">
      <span className="min-w-0"><span className="block font-medium text-[#2B660E] dark:text-[#B7F36B] break-words">{resource.title}</span>
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400 break-words">{resource.provider}</span></span>
      <ExternalLink size={15} className="mt-0.5 shrink-0 text-slate-400 group-hover:text-[#75a94b]" aria-hidden="true" />
      <span className="sr-only">Yeni sekmede açılır</span>
    </a>
  </li>)}</ul>
}

export function Bibliography({ nodeId, title }: { nodeId: string; title: string }) {
  const [result, setResult] = useState<ReferenceView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    api.references(nodeId, controller.signal).then(data => {
      if (active) setResult(data)
    }).catch(err => {
      if (active) setError(err instanceof Error ? err.message : 'Kaynaklar yüklenemedi.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false; controller.abort() }
  }, [nodeId, attempt])

  const readings = result?.resources.filter(resource => resource.type !== 'youtube') ?? []
  const videos = result?.resources.filter(resource => resource.type === 'youtube') ?? []
  const retry = !!error || (result && result.status !== 'complete')

  return <section className="space-y-4 border-t border-[#E3E7EC] dark:border-[#2A3038] pt-6" aria-label="Kaynakça" aria-busy={loading}>
    <div><h3 className="flex items-center gap-2 text-base font-semibold"><BookOpen size={18} aria-hidden="true" />Kaynakça</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">“{title}” konusunu öğrenmek için yazılı kaynaklar ve videolar.</p></div>
    <div aria-live="polite">
      {loading && <p className="flex items-center gap-2 text-slate-500"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" />Konuyla ilgili kaynaklar aranıyor…</p>}
      {error && <p className="text-rose-600 dark:text-rose-300">{error}</p>}
      {!loading && result?.status === 'unavailable' && <p className="text-slate-500">Bu konu için yeterince ilgili arama sonucu bulunamadı veya arama servisine ulaşılamadı. Varsa seçilmiş kaynakları aşağıda inceleyebilirsin.</p>}
      {!loading && result?.status === 'partial' && <p className="text-slate-500">Yalnızca konuyla eşleşen sonuçlar gösteriliyor. Diğer kaynaklar için aramayı yeniden deneyebilirsin.</p>}
    </div>
    {!loading && result && <div className="grid gap-5 sm:grid-cols-2">
      <div className="space-y-3"><h4 className="flex items-center gap-2 font-medium"><BookOpen size={16} aria-hidden="true" />Makale ve dokümanlar</h4>
        {readings.length ? <ResourceLinks resources={readings} /> : <p className="text-xs text-slate-500">Bu konu için yazılı kaynak bulunamadı.</p>}</div>
      <div className="space-y-3"><h4 className="flex items-center gap-2 font-medium"><Video size={16} aria-hidden="true" />Videolar</h4>
        {videos.length ? <ResourceLinks resources={videos} /> : <p className="text-xs text-slate-500">Bu konu için video bulunamadı.</p>}</div>
    </div>}
    {!loading && retry && <button type="button" onClick={() => { setLoading(true); setError(''); setResult(null); setAttempt(value => value + 1) }}
      className="inline-flex items-center gap-2 rounded-lg border border-[#D7DFE6] dark:border-[#374151] px-3 py-2 text-xs font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-[#232933]">
      <RefreshCw size={14} aria-hidden="true" />Kaynakları yeniden ara
    </button>}
  </section>
}
