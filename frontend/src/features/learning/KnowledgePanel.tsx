import { BadgeCheck, BookOpen, CheckCircle2 } from 'lucide-react'
import type { ExportBundle } from '@/api/types'
import { FloatingPanel } from './FloatingPanel'

export function KnowledgePanel({ open, bundle, close, activate }: { open: boolean; bundle: ExportBundle; close: () => void; activate: (id: string) => void }) {
  const profile = bundle.learnerProfile
  const verified = [...new Set(profile.verifiedSkills ?? [])]
  const reported = [...new Set([...(profile.knownTechnologies ?? []), ...(profile.selfReportedSkills ?? [])])]
    .filter(skill => !verified.includes(skill) && !['none', 'yok', 'hiçbiri', 'bilmiyorum', 'hiç bilmiyorum', 'henüz bilmiyorum', 'unknown', 'no experience', "i don't know", 'starting from scratch'].includes(skill.replace(/\.basics$/, '').trim().toLocaleLowerCase('tr-TR').replace(/[.!]+$/, '')))
  const completed = (bundle.maps ?? []).flatMap(map => map.nodes).filter(node => node.status === 'completed')
  const label = (skill: string) => skill.replace(/\.basics$/, ' temelleri').replace(/[._-]+/g, ' ')
  return <FloatingPanel open={open} title="Bildiklerim" icon={<BadgeCheck size={17} />} close={close} width={360} height={440} anchor="knowledge">
    <div className="overflow-y-auto p-4 space-y-5 text-sm">
      <p className="text-xs leading-relaxed text-[#788371]">Sistem öğrendiklerini burada tutar. Testle doğrulanan bilgiler, senin belirttiklerinden ayrı gösterilir.</p>
      <section><h3 className="flex items-center gap-2 font-semibold mb-2 text-[#527B35] dark:text-[#B7F36B]"><BadgeCheck size={16} />Testle doğrulanan · {verified.length}</h3>
        {verified.length ? <div className="flex flex-wrap gap-2">{verified.map(skill => <span key={skill} title={skill} className="rounded-lg bg-[#75a94b]/10 px-2.5 py-1.5 text-xs">{label(skill)}</span>)}</div> : <p className="text-xs text-slate-500">Testlerde doğruladığın beceriler burada birikecek.</p>}</section>
      <section><h3 className="flex items-center gap-2 font-semibold mb-2"><BookOpen size={15} />Senin belirttiklerin · {reported.length}</h3>
        {reported.length ? <div className="flex flex-wrap gap-2">{reported.map(skill => <span key={skill} className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs">{label(skill)}</span>)}</div> : <p className="text-xs text-slate-500">Başlangıçta bildiğini belirttiğin konular burada görünür.</p>}</section>
      <section><h3 className="flex items-center gap-2 font-semibold mb-2"><CheckCircle2 size={15} />Tamamlanan duraklar · {completed.length}</h3>
        {completed.length ? <div className="space-y-1">{completed.map(node => <button key={node.id} className="block w-full rounded-xl px-3 py-2 text-left text-xs hover:bg-[#75a94b]/10 cursor-pointer" onClick={() => { close(); activate(node.id) }}>{node.title}</button>)}</div> : <p className="text-xs text-slate-500">Tamamladığın proje ve öğrenme adımları burada listelenir.</p>}</section>
    </div>
  </FloatingPanel>
}
