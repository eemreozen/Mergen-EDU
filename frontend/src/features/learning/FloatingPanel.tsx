import { GripHorizontal, Minus, X } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

let front = 70

type Props = { open: boolean; title: string; icon?: ReactNode; children: ReactNode; close: () => void; width?: number; height?: number; anchor?: 'advisor' | 'memory' | 'knowledge' }

export function FloatingPanel({ open, title, icon, children, close, width = 380, height = 440, anchor = 'memory' }: Props) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [minimized, setMinimized] = useState(false)
  const [layer, setLayer] = useState(70)
  const element = useRef<HTMLElement>(null)
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const bounds = (x: number, y: number) => ({
    x: Math.max(8, Math.min(x, window.innerWidth - Math.min(width, window.innerWidth - 16) - 8)),
    y: Math.max(8, Math.min(y, window.innerHeight - (element.current?.offsetHeight || 48) - 8)),
  })
  useEffect(() => {
    if (!open) return
    const adjust = () => setPosition(previous => {
      const initial = anchor === 'advisor' ? { x: window.innerWidth - width - 36, y: window.innerHeight - height - 110 }
        : { x: anchor === 'knowledge' ? 480 : 24, y: 142 }
      return bounds(previous?.x ?? initial.x, previous?.y ?? initial.y)
    })
    adjust()
    window.addEventListener('resize', adjust)
    return () => window.removeEventListener('resize', adjust)
    // Recalculate when the window changes size or expands from its title bar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, minimized, width, height, anchor])
  if (!open) return null
  return <section ref={element} role="dialog" aria-label={title} onPointerDownCapture={() => setLayer(++front)}
    className="fixed flex flex-col overflow-hidden rounded-2xl border border-[#DDE4DA] dark:border-[#364130] bg-white dark:bg-[#171D23] shadow-[0_16px_60px_#17220f24]"
    style={{ left: position?.x ?? 24, top: position?.y ?? 142, width: `min(${width}px, calc(100vw - 16px))`, height: minimized ? 48 : `min(${height}px, calc(100dvh - 100px))`, zIndex: layer }}>
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[#E8ECE5] dark:border-[#303A31] bg-[#F5F8F1] dark:bg-[#202A22] px-3">
      <div tabIndex={0} role="button" aria-label={`${title} penceresini taşı`} title="Sürükleyerek taşı · Yön tuşlarıyla hareket ettir"
        className="flex min-w-0 flex-1 items-center gap-2 self-stretch touch-none cursor-grab active:cursor-grabbing select-none outline-offset-[-3px]"
        onPointerDown={event => {
          if (event.button !== 0) return
          const rect = element.current!.getBoundingClientRect()
          drag.current = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerMove={event => { if (drag.current) setPosition(bounds(drag.current.left + event.clientX - drag.current.x, drag.current.top + event.clientY - drag.current.y)) }}
        onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }}
        onPointerCancel={() => { drag.current = null }}
        onKeyDown={event => {
          const delta: Record<string, number[]> = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }
          if (!delta[event.key]) return
          event.preventDefault()
          const rect = element.current!.getBoundingClientRect(), [dx, dy] = delta[event.key]
          setPosition(bounds(rect.left + dx, rect.top + dy))
        }}>
        <span className="text-[#638744]">{icon}</span><h2 className="truncate text-sm font-semibold">{title}</h2><GripHorizontal size={16} className="ml-auto text-[#98A58F]" />
      </div>
      <button className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer" aria-label={`${title} ${minimized ? 'büyüt' : 'küçült'}`} onClick={() => setMinimized(value => !value)}><Minus size={15} /></button>
      <button className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer" aria-label={`${title} kapat`} onClick={close}><X size={16} /></button>
    </header>
    <div className={`${minimized ? 'hidden' : 'flex'} min-h-0 flex-1 flex-col`}>{children}</div>
  </section>
}
