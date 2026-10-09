import { useReactFlow } from '@xyflow/react'
import { ArrowLeft, ChevronRight, Compass, Download, Maximize2, Minus, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LanguageSelector } from '@/components/shared/LanguageSelector'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const floating = 'rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-[#FFFFFF]/90 dark:bg-[#171A20]/90 backdrop-blur-md shadow-lg'
export function LiveCanvasHeader({ title, completed, total, download }: { title: string; completed: number; total: number; download: () => void }) {
  const progress = total ? Math.round(completed / total * 100) : 0
  return <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between gap-3 pointer-events-none">
    <div className={`${floating} flex items-center gap-3 p-1.5 px-3 pointer-events-auto`}>
      <Logo iconOnly className="w-8 h-8" /><div className="h-4 w-px bg-[#E3E7EC] dark:bg-[#2A3038]" />
      <div className="flex items-center gap-2 text-xs font-mono"><Link to="/learn" className="text-[#68717D] dark:text-[#9CA3AF] flex items-center gap-1"><ArrowLeft size={12} />Projelerim</Link><ChevronRight size={14} className="text-[#9CA3AF]" /><h1 className="font-bold truncate max-w-md">{title}</h1><span className="px-1.5 py-0.5 rounded text-[10px] bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 text-[#2B660E] dark:text-[#B7F36B]">Ana Harita</span></div>
    </div>
    <div className={`${floating} flex items-center gap-2.5 p-1.5 px-3 pointer-events-auto`}>
      <div className="flex items-center gap-2.5 pr-3 border-r border-[#E3E7EC] dark:border-[#2A3038]"><div className="text-right font-mono"><p className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">İlerleme</p><p className="text-xs font-bold">%{progress}</p></div><div className="w-16 h-2 rounded-full bg-[#E3E7EC] dark:bg-[#2A3038] overflow-hidden"><div className="h-full bg-[#2B660E] dark:bg-[#B7F36B] transition-all" style={{width:`${progress}%`}} /></div></div>
      <button className="p-2 rounded-xl text-[#68717D] dark:text-[#9CA3AF] hover:bg-[#F0F2F5] dark:hover:bg-[#20242B] cursor-pointer" aria-label="JSON indir" onClick={download}><Download size={15} /></button><LanguageSelector /><ThemeToggle />
    </div>
  </header>
}
export function LiveCanvasControls({ locate, showSupports, toggleSupports }: { locate: () => void; showSupports: boolean; toggleSupports: () => void }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const button = 'p-2 rounded-xl text-[#68717D] dark:text-[#9CA3AF] hover:bg-[#F0F2F5] dark:hover:bg-[#20242B] cursor-pointer'
  return <div className={`absolute bottom-6 left-6 z-30 flex items-center gap-1.5 p-1.5 ${floating}`}>
    <button className={button} onClick={() => void zoomIn()} aria-label="Yakınlaştır"><Plus size={16} /></button><button className={button} onClick={() => void zoomOut()} aria-label="Uzaklaştır"><Minus size={16} /></button><div className="h-4 w-px bg-[#E3E7EC] dark:bg-[#2A3038]" />
    <button className={`${button} flex items-center gap-1.5 text-xs font-mono`} onClick={() => void fitView({padding:0.22,duration:400})} aria-label="Tüm Haritayı Göster"><Maximize2 size={14} />Odakla</button><div className="h-4 w-px bg-[#E3E7EC] dark:bg-[#2A3038]" />
    <button className={`${button} text-xs font-mono`} aria-pressed={showSupports} onClick={toggleSupports}>Destek bağlantıları {showSupports ? 'açık' : 'kapalı'}</button>
    <button onClick={locate} className="px-2.5 py-1.5 rounded-xl text-[#2B660E] dark:text-[#B7F36B] bg-[#2B660E]/10 dark:bg-[#B7F36B]/15 cursor-pointer flex items-center gap-1.5 text-xs font-mono font-medium"><Compass size={15} />Konumuma Git</button>
  </div>
}
