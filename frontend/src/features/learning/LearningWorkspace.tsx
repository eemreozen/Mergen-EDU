import '@xyflow/react/dist/style.css'
import { Background, ReactFlow, ReactFlowProvider, type ReactFlowInstance, type Node } from '@xyflow/react'
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpen, BrainCircuit, CheckCircle2, Compass, History, LoaderCircle, Send, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { AdvisorWelcome } from '@/components/landing/AdvisorWelcome'
import { LearningReward, type Reward } from './LearningReward'
import { api, type LearnerProgress } from '@/api/client'
import type { AssessmentView, DiscoveryAnswer, DiscoveryView, ExportBundle, NodeView } from '@/api/types'
import type { TimeMachine } from '@/api/memory-types'
import { HeroSection } from '@/features/landing/HeroSection'
import { TeacherAdvisorFigure } from '@/components/landing/TeacherAdvisorFigure'
import { UserDashboard } from '@/features/dashboard/UserDashboard'
import { LearningRoute } from './LearningRoute'
import { LiveCanvasHeader, LiveCanvasControls } from './LiveCanvasChrome'
import { useTheme } from '@/hooks/useTheme'
import { LearningStop } from './LearningStop'
import { layoutMaps, recommendedNode, visibleEdges, type LearningNodeData } from './layout'
import { TimeMachinePanel } from './TimeMachinePanel'
import { Bibliography } from './Bibliography'
import { FloatingPanel } from './FloatingPanel'
import { KnowledgePanel } from './KnowledgePanel'

const panel = 'rounded-2xl border border-[#E3E7EC] dark:border-[#2A3038] bg-white dark:bg-[#171A20]'
const primary = 'rounded-xl bg-[#2B660E] dark:bg-[#B7F36B] text-white dark:text-[#0B0D10] px-4 py-3 text-sm font-semibold disabled:opacity-40 inline-flex justify-center items-center gap-2 cursor-pointer'
const secondary = 'rounded-xl border border-[#D7DFE6] dark:border-[#374151] px-4 py-3 text-sm font-medium disabled:opacity-40 inline-flex justify-center items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-[#232933]'
const input = 'w-full rounded-xl border border-[#D7DFE6] dark:border-[#374151] bg-[#F7F8FA] dark:bg-[#111318] p-3 text-sm outline-none focus:ring-2 focus:ring-[#7ba94a]'
const nodeTypes = { learningStop: LearningStop }
const edgeTypes = { learningRoute: LearningRoute }
const optionLabels: Record<string, string> = {
  prototype: 'Fikri gösteren çalışan prototip', production_ready: 'Gerçek kullanıcılar için yayına hazır ürün',
  backend_api: 'Backend servisi / API', cli: 'Komut satırı aracı', undecided: 'Henüz karar vermedim, öneri istiyorum',
  authentication: 'Kullanıcı hesabı ve giriş', payments: 'Ödeme alma', neither: 'İkisi de gerekli değil',
  frontend: 'Frontend / arayüz', backend: 'Backend / sunucu', unity: 'Unity', godot: 'Godot', unreal: 'Unreal Engine', yes: 'Evet', no: 'Hayır',
  mvp: 'Çalışan ilk sürüm (MVP)', deep_learning: 'Konuyu derinlemesine öğrenmek', portfolio: 'Portföy projesi', startup: 'Girişim fikrimi hayata geçirmek',
  beginner: 'Yeni başlıyorum', basic: 'Temel bilgim var', intermediate: 'Orta seviyedeyim', advanced: 'İleri seviyedeyim',
  mobile: 'Mobil uygulama', web: 'Web uygulaması', desktop: 'Masaüstü uygulaması',
  react_native: 'React Native', flutter: 'Flutter', native: 'Platforma özel geliştirme',
  train_model: 'Kendi modelimi eğitmek', use_api: 'Hazır AI servisinden yararlanmak', api: 'Hazır AI servisinden yararlanmak',
  other: 'Diğer — kısaca açıklayayım', none: 'Henüz bilmiyorum', not_sure: 'Henüz karar vermedim',
}

function DiscoveryForm({ discovery, busy, answer }: { discovery: DiscoveryView; busy: boolean; answer: (id: string, value: string | string[], extra?: DiscoveryAnswer[]) => Promise<boolean> }) {
  const requiredQuestions = discovery.questions.filter(q => q.required !== false)
  const initial = discovery.nextQuestion?.id || discovery.questions[0]?.id || ''
  const [currentId, setCurrentId] = useState(initial)
  const [drafts, setDrafts] = useState<Record<string, string | string[]>>({})
  const [otherDrafts, setOtherDrafts] = useState<Record<string, string>>({})
  const technologyQuestion = discovery.questions.find(q => q.targetField === 'knownTechnologies' && q.required === false)
  const [technologies, setTechnologies] = useState((discovery.answers.find(a => a.questionId === technologyQuestion?.id)?.value as string) || '')
  const question = requiredQuestions.find(q => q.id === currentId) || discovery.nextQuestion || requiredQuestions[0]
  if (!question) return null
  const advisorQuestions = requiredQuestions.filter(q => q.section !== 'project')
  const projectQuestions = requiredQuestions.filter(q => q.section === 'project')
  const advisorPending = advisorQuestions.some(q => q.required !== false && !q.completed)
  const activeSection = question.section || 'advisor'
  const sectionQuestions = activeSection === 'advisor' ? advisorQuestions : projectQuestions
  const index = sectionQuestions.findIndex(q => q.id === question.id)
  const selectSection = (section: 'advisor' | 'project') => {
    const questions = section === 'advisor' ? advisorQuestions : projectQuestions
    const next = questions.find(q => !q.completed) || questions[0]
    if (next) setCurrentId(next.id)
  }
  const saved = discovery.answers.find(a => a.questionId === question.id)?.value
  const normalize = (choice: string) => choice.startsWith('other:') ? 'other' : choice
  const savedChoices = Array.isArray(saved) ? saved : typeof saved === 'string' ? [saved] : []
  const savedOther = savedChoices.find(choice => choice.startsWith('other:'))?.slice(6) || ''
  const value = drafts[question.id] ?? (Array.isArray(saved) ? saved.map(normalize) : typeof saved === 'string' ? normalize(saved) : undefined) ?? (question.type === 'multi_choice' ? [] : '')
  const otherText = otherDrafts[question.id] ?? savedOther
  const wantsOther = question.type !== 'short_text' && (Array.isArray(value) ? value.includes('other') : value === 'other')
  const completed = requiredQuestions.filter(q => q.completed).length
  const canSubmit = (Array.isArray(value) ? value.length > 0 : value.trim().length > 0) && (!wantsOther || !!otherText.trim())
  const save = async (selected: string | string[]) => {
    const next = requiredQuestions.find(q => !q.completed && q.id !== question.id)
    const extra = technologyQuestion && question.targetField === 'experienceLevel' && technologies.trim()
      ? [{ questionId: technologyQuestion.id, value: technologies.trim() }] : []
    const encode = (choice: string) => question.type !== 'short_text' && choice === 'other' ? `other:${otherText.trim()}` : choice
    const saved = await answer(question.id, Array.isArray(selected) ? selected.map(encode) : encode(selected), extra)
    if (saved) setCurrentId(next?.id || '')
  }
  const submit = (event: React.FormEvent) => { event.preventDefault(); void save(value) }
  const canRecommend = activeSection === 'project' && (question.type === 'short_text' || question.options?.includes('recommend'))
  const labelFor = (option: string) => {
    if (question.targetField === 'experienceLevel') return ({ beginner: 'İlk projem olacak', basic: 'Örnekleri takip ederek kod yazdım', intermediate: 'Küçük bir proje geliştirdim', advanced: 'Projeleri kendi başıma geliştirebiliyorum' } as Record<string, string>)[option] || optionLabels[option] || option
    if (question.targetField === 'weeklyHours') return ({ '3': 'Haftada 2–3 saat', '6': 'Haftada 4–6 saat', '10': 'Haftada 7–10 saat', '15': 'Haftada 10 saatten fazla', '5': 'Emin değilim — 5 saatle planlayalım' } as Record<string, string>)[option] || `${option} saat`
    return optionLabels[option] || option
  }
  return <form onSubmit={submit} className={`${panel} !rounded-3xl shadow-2xl p-6 space-y-5`}>
    <div className="flex items-center justify-between text-xs text-slate-500"><span>KÜÇÜK BİR BAŞLANGIÇ</span><span>{completed} / {requiredQuestions.length}</span></div>
    <nav aria-label="Soru bölümleri" className={`grid ${projectQuestions.length ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
      {([{ id: 'advisor', title: 'Başlangıcın', questions: advisorQuestions }, { id: 'project', title: 'Projeye özel', questions: projectQuestions }] as const).filter(section => section.questions.length).map(section => <button
        key={section.id} type="button" aria-pressed={activeSection === section.id} disabled={busy || (section.id === 'project' && advisorPending) || !section.questions.length}
        onClick={() => selectSection(section.id)} className={`rounded-2xl border p-3 text-left transition-colors disabled:opacity-50 ${activeSection === section.id ? 'border-[#75a94b] bg-[#75a94b]/10' : 'border-slate-200 dark:border-slate-700 hover:border-[#75a94b]'}`}>
        <span className="block text-sm font-semibold">{section.id === 'advisor' ? '1.' : '2.'} {section.title}</span>
        <span className="block text-xs text-slate-500 mt-1">{section.questions.filter(q => q.completed).length} / {section.questions.length} cevap</span>
      </button>)}
    </nav>
    <p className="text-xs text-slate-500">{activeSection === 'advisor' ? 'Teknoloji seçimini ve öğrenme yolunu biz önereceğiz.' : 'Projenin yönünü netleştirelim. Sana uymayan şık varsa Diğer’i seç.'}</p>
    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-[#75a94b] transition-all" style={{ width: `${completed / requiredQuestions.length * 100}%` }} /></div>
    <h2 className="text-2xl font-bold tracking-tight leading-snug">{question.text}</h2>
    {question.type === 'short_text' ? <textarea className={`${input} min-h-24`} value={value as string} maxLength={2000} required disabled={busy} onChange={e => setDrafts(d => ({ ...d, [question.id]: e.target.value }))} aria-label={question.text} placeholder="Bir cümle yeterli…" />
      : <div className="space-y-2">{(question.options ?? []).filter(option => option !== 'recommend').map(option => {
        const chosen = Array.isArray(value) ? value.includes(option) : value === option
        return <label key={option} className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer text-sm ${chosen ? 'border-[#75a94b] bg-[#75a94b]/10' : 'border-slate-200 dark:border-slate-700'}`}>
          <input type={question.type === 'multi_choice' ? 'checkbox' : 'radio'} name={question.id} value={option} checked={chosen} disabled={busy} onChange={() => setDrafts(d => ({ ...d, [question.id]: Array.isArray(value) ? chosen ? value.filter(v => v !== option) : [...value.filter(v => v !== 'recommend'), option] : option }))} />{labelFor(option)}
        </label>
      })}</div>}
    {wantsOther && <textarea className={`${input} min-h-20`} value={otherText} maxLength={1000} required disabled={busy} onChange={event => setOtherDrafts(d => ({ ...d, [question.id]: event.target.value }))} aria-label="Diğer seçeneğinin açıklaması" placeholder="Ne düşündüğünü kısaca anlat…" />}
    {technologyQuestion && question.targetField === 'experienceLevel' && <details className="text-xs text-slate-500"><summary className="cursor-pointer">Bildiğin teknolojileri ekle (isteğe bağlı)</summary><input className={`${input} mt-3`} value={technologies} maxLength={2000} disabled={busy} onChange={event => setTechnologies(event.target.value)} aria-label="Bildiğin teknolojiler" placeholder="Örn. Python, HTML — boş bırakabilirsin" /></details>}
    <div className="flex justify-between gap-3"><button type="button" className={secondary} disabled={busy || index === 0} onClick={() => setCurrentId(sectionQuestions[index - 1].id)}><ArrowLeft size={15} />Önceki</button>
      <button type="submit" className={primary} disabled={!canSubmit || busy}>{busy ? <LoaderCircle size={16} className="animate-spin" /> : <ArrowRight size={16} />}Devam et</button></div>
    {canRecommend && <button type="button" className={secondary + ' w-full'} disabled={busy} onClick={() => void save(question.type === 'multi_choice' ? ['recommend'] : 'recommend')}><Sparkles size={15} />Önerinle ilerle</button>}
  </form>
}

function Workspace() {
  const { isDark } = useTheme()
  const [params, setParams] = useSearchParams()
  const projectId = params.get('project')
  const requestedMapId = params.get('map')
  const location = useLocation()
  const [idea] = useState((location.state as { idea?: string } | null)?.idea || '')
  const [bundle, setBundle] = useState<ExportBundle | null>(null)
  const [busy, setBusy] = useState(projectId ? 'Projen yükleniyor…' : '')
  const working = useRef(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [progress, setProgress] = useState<LearnerProgress | null>(null)
  const [reward, setReward] = useState<Reward | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showSupports, setShowSupports] = useState(false)
  const [memoryOpen, setMemoryOpen] = useState(false)
  const [knowledgeOpen, setKnowledgeOpen] = useState(false)
  const [memory, setMemory] = useState<TimeMachine | null>(null)
  const [memoryError, setMemoryError] = useState('')
  const [lesson, setLesson] = useState<NodeView | null>(null)
  const [quiz, setQuiz] = useState<AssessmentView | null>(null)
  const [submissionId, setSubmissionId] = useState('')
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [taskEvidence, setTaskEvidence] = useState('')
  const [advisorOpen, setAdvisorOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const flow = useRef<ReactFlowInstance<Node<LearningNodeData>> | null>(null)

  const perform = async (label: string, action: () => Promise<void>) => {
    if (working.current) return
    working.current = true; setBusy(label); setError('')
    try { await action() } catch (err) { setError(err instanceof Error ? err.message : 'İşlem tamamlanamadı.') }
    finally { working.current = false; setBusy('') }
  }
  const activate = useCallback((id: string) => { setSelectedId(id); setLesson(null); setQuiz(null); setTaskEvidence('') }, [])
  const root = bundle?.maps?.find(m => !m.parentMapId)
  const currentMap = bundle?.maps?.find(m => m.id === params.get('map') && m.kind !== 'adaptive') || root
  const graph = useMemo(() => {
    const result = bundle ? layoutMaps(bundle, activate, currentMap?.id) : { nodes: [], edges: [] }
    return { ...result, nodes: result.nodes.map((node): Node<LearningNodeData> => ({ ...node, data: { ...node.data, celebrated: reward?.kind === 'success' && reward.nodeId === node.id } })) }
  }, [bundle, activate, currentMap?.id, reward])
  const allNodes = bundle?.maps?.flatMap(m => m.nodes) || []
  const selected = allNodes.find(n => n.id === selectedId)
  const practice = selected?.status === 'locked' && !!progress?.practiceEnabled
  const selectedMap = bundle?.maps?.find(m => m.id === selected?.mapId)
  const recommendation = bundle ? recommendedNode(bundle, currentMap?.id) : undefined
  const branch = bundle?.maps?.find(m => m.targetNodeId === selected?.id && m.kind === 'adaptive')
  const branchPending = !!branch?.nodes.some(n => n.status !== 'completed')
  const completed = root?.nodes.filter(n => n.status === 'completed').length || 0
  const focus = useCallback((id: string) => {
    const node = flow.current?.getNode(id)
    if (node) void flow.current?.setCenter(node.position.x + 300, node.position.y + 100, { zoom: 0.95, duration: 450 })
  }, [])

  useEffect(() => { let cancelled = false; api.progress().then(data => { if (!cancelled) setProgress(data) }).catch(() => {}); return () => { cancelled = true } }, [])
  useEffect(() => { if (!reward) return; const timer = window.setTimeout(() => setReward(null), 3800); return () => window.clearTimeout(timer) }, [reward])

  useEffect(() => {
    let cancelled = false
    if (projectId) {
      api.exportProject(projectId).then(data => {
        if (!cancelled) {
          setBundle(data)
          const next = recommendedNode(data)
          setSelectedId(requestedMapId ? null : next?.id || null)
          if (!requestedMapId && next) {
            let map = data.maps?.find(m => m.id === next.mapId)
            while (map?.kind === 'adaptive') map = data.maps?.find(m => m.id === map!.parentMapId)
            if (map?.parentMapId) setParams({ project: projectId, map: map.id }, { replace: true })
          }
          localStorage.setItem('mergen_last_project', projectId)
        }
      }).catch(err => { if (!cancelled) setError(err.message) }).finally(() => { if (!cancelled) setBusy('') })
    }
    return () => { cancelled = true }
  }, [projectId, requestedMapId, setParams])

  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (memoryOpen) setMemoryOpen(false)
      else if (knowledgeOpen) setKnowledgeOpen(false)
      else if (advisorOpen) setAdvisorOpen(false)
      else setSelectedId(null)
    }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [advisorOpen, memoryOpen, knowledgeOpen])

  useEffect(() => {
    if (!projectId || !bundle?.maps?.length) return
    let cancelled = false
    api.timeMachine(projectId).then(data => {
      if (!cancelled) { setMemory(data); setMemoryError('') }
    }).catch(err => { if (!cancelled) setMemoryError(err.message) })
    return () => { cancelled = true }
  }, [projectId, bundle])

  const refreshMemory = async () => {
    try { setMemory(await api.timeMachine(projectId!)); setMemoryError('') }
    catch (err) { setMemoryError(err instanceof Error ? err.message : 'Geçmiş yüklenemedi.') }
  }
  const openMemory = () => { setSelectedId(null); setMemoryOpen(true) }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const instance = flow.current
      const nodes = instance?.getNodes() ?? []
      void instance?.fitView({ nodes: nodes.filter(node => node.position.x <= Math.min(...nodes.map(item => item.position.x)) + 720), padding: 0.25, maxZoom: 1, duration: 350 })
    }, 150)
    return () => window.clearTimeout(timer)
  }, [currentMap?.id])

  const recommendedId = recommendation?.id
  useEffect(() => {
    if (!recommendedId) return
    const timer = window.setTimeout(() => focus(recommendedId), 180)
    return () => window.clearTimeout(timer)
  }, [recommendedId, focus])

  const refresh = async () => {
    const next = await api.exportProject(projectId!)
    setBundle(next)
    setProgress(await api.progress())
    return next
  }
  const showRecommendation = (data: ExportBundle) => {
    const next = recommendedNode(data, currentMap?.id) || recommendedNode(data)
    if (next) {
      let map = data.maps?.find(m => m.id === next.mapId)
      while (map?.kind === 'adaptive') map = data.maps?.find(m => m.id === map!.parentMapId)
      if (map) setParams({ project: projectId!, ...(map.parentMapId ? { map: map.id } : {}) })
      activate(next.id); focus(next.id)
    }
  }
  const answer = async (id: string, value: string | string[], extra: DiscoveryAnswer[] = []) => {
    let saved = false
    await perform('Cevabın kaydediliyor…', async () => {
      await api.answer(projectId!, id, value, extra)
      await refresh()
      saved = true
    })
    return saved
  }
  const generate = () => void perform('Ayrıntılı yol haritan hazırlanıyor…', async () => {
    await api.generate(projectId!)
    const next = await refresh(); showRecommendation(next)
    setNotice('Haritan hazır. Vurgulanan durakta bilgini test edebilir veya sıfırdan öğrenebilirsin.')
  })
  const openSubmap = () => selected && void perform('Alt öğrenme haritan açılıyor…', async () => {
    const child = await api.submap(selected.id)
    await refresh()
    setParams({ project: projectId!, map: child.id })
    setSelectedId(null); setLesson(null); setQuiz(null)
    setNotice('Bu alt haritayı tamamladığında ana durak da tamamlanır. İlerlemen kaydedilir.')
  })
  const testKnowledge = () => selected && void perform('Bilgi testi hazırlanıyor…', async () => {
    const assessment = await api.assessment(selected.id, practice)
    setQuiz(assessment); setAnswers({}); setSubmissionId(crypto.randomUUID()); setLesson(null)
  })
  const teach = () => selected && void perform('Öğrenme yolun hazırlanıyor…', async () => {
    if (practice) { setLesson(await api.node(selected.id, true)); setQuiz(null); return }
    if (selectedMap?.kind === 'adaptive') { setLesson(await api.node(selected.id)); setQuiz(null); return }
    const newBranch = await api.learn(selected.id)
    await refresh()
    const first = newBranch.nodes.find(n => n.status === 'available' || n.status === 'in_progress') || newBranch.nodes[0]
    if (first) { activate(first.id); focus(first.id); setLesson(await api.node(first.id)) }
    setNotice('Sıfırdan öğrenme dalın ana haritanın yanında açıldı. Dalı tamamlayıp asıl durağın testine döneceksin.')
  })
  const submit = () => selected && quiz && void perform('Yanıtların değerlendiriliyor…', async () => {
    const result = await api.submit(selected.id, quiz, submissionId, answers, practice)
    if (result.practice) {
      setQuiz(null)
      setReward({id: Date.now(), kind: result.passed ? 'practice' : 'retry', points: 0, message: `%${result.score} doğru. Bu bir denemeydi; puanın ve gerçek ilerlemen değişmedi.`})
      setNotice(result.passed ? 'Denemeyi geçtin. Gerçek ilerleme için ön koşulları tamamlayıp bu durağa sırayla gelmelisin.' : `Denemede pekiştirilecek konular: ${result.weakSkills.join(', ')}. İlerlemen değişmedi.`)
      return
    }
    setReward({id: Date.now(), kind: result.passed ? 'success' : 'retry', points: result.pointsAwarded, nodeId: selected.id,
      message: result.passed ? 'Harika, bu bilgiyi artık projende kullanabilirsin.' : `${result.correctAnswers} doğru cevabın var. Eksik kalanları birlikte çalışabiliriz.`})
    const next = await refresh()
    setQuiz(null); showRecommendation(next)
    setNotice(result.passed ? `%${result.score}: Bilgin doğrulandı. ${selected.type === 'development_task' ? 'Şimdi proje görevinin çıktısını tamamla.' : 'Sıradaki durak vurgulandı.'}`
      : result.memoryReviewIds?.length ? `Eski bir konuyu kısa bir hatırlamayla pekiştirelim. Önceki durakların tamamlanmış kalıyor.${result.adaptiveMap ? ' Yeni konular için öğrenme dalın da hazır.' : ''}`
      : `%${result.score}: ${result.weakSkills.join(', ')} için ${result.adaptiveMap ? 'yan tarafta öğrenme dalı açıldı.' : 'bu durakta tekrar çalışabilirsin.'}`)
    if (result.memoryReviewIds?.length) openMemory()
  })
  const exportJson = () => {
    if (!bundle) return
    const url = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'mergen-roadmap.json'; anchor.click(); URL.revokeObjectURL(url)
  }
  const chat = (event: React.FormEvent) => {
    event.preventDefault()
    if (!message.trim()) return
    const text = message.trim()
    void perform('Danışman yanıtlıyor…', async () => {
      const reply = await api.advisor(projectId!, text, selected)
      setMessages(previous => [...previous, { role: 'user', text }, { role: 'advisor', text: reply.reply }]); setMessage('')
    })
  }

  const header = <LiveCanvasHeader title={currentMap?.parentMapId ? currentMap.title : bundle?.project.title || 'Proje keşfi'} completed={completed} total={root?.nodes.length || 0} download={exportJson} submap={!!currentMap?.parentMapId} points={progress?.totalPoints} level={progress?.level} />
  const alerts = <div className={`${root ? 'absolute top-36 left-6 z-[60] max-w-lg' : 'w-full mb-5'} space-y-2`} aria-live="polite">
    {busy && <div className={`${panel} p-3 flex items-center gap-2 text-sm`}><LoaderCircle size={16} className="animate-spin shrink-0" />{busy}</div>}
    {error && <div role="alert" className="rounded-xl border border-rose-400/50 bg-rose-50 dark:bg-[#301b23] p-3 text-sm flex justify-between gap-3"><span>{error}</span><button onClick={() => setError('')} aria-label="Hatayı kapat"><X size={15} /></button></div>}
    {notice && <div className={`${panel} p-3 text-sm flex justify-between gap-3`}><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Bildirimi kapat"><X size={15} /></button></div>}
  </div>

  if (!projectId) return <UserDashboard />
  if (!root) return <div className="min-h-screen w-full bg-[#F7F8FA] dark:bg-[#0B0D10] text-[#111318] dark:text-[#E9EDF3] relative">
    <div inert aria-hidden="true"><HeroSection externalIdea={bundle?.project.originalIdea || idea} /></div>
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" />
    <main className="fixed inset-0 z-50 flex items-center justify-center p-8"><div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl" role="dialog" aria-modal="true" aria-label="Proje keşfi">
      <Link to="/learn" className="inline-flex items-center gap-2 text-xs font-mono text-white/70 mb-4"><ArrowLeft size={14} />Projelerime dön</Link>{alerts}
      {bundle && !bundle.discovery.readyForRoadmap && <DiscoveryForm key={`${projectId}-${bundle.discovery.nextQuestion?.id}`} discovery={bundle.discovery} busy={!!busy} answer={answer} />}
      {busy && bundle?.discovery.readyForRoadmap ? <AdvisorWelcome roadmap en={bundle.project.locale === 'en'} /> : bundle?.discovery.readyForRoadmap && <section className={`${panel} p-8 text-center space-y-5`}><CheckCircle2 className="mx-auto text-[#75a94b]" size={36} /><h2 className="text-2xl font-semibold">Başlamak için hazırsın.</h2><p className="text-sm leading-relaxed text-slate-500">İlk çalışan sürüme giden yolu ve uygun teknolojileri önereceğiz. Bildiklerini ilerlerken kısa testlerle doğrulayabiliriz.</p><button className={primary} disabled={!!busy} onClick={generate}><Compass size={17} />Yol haritamı oluştur</button></section>}
      {projectId && !bundle && !busy && <button className={secondary} onClick={() => setParams({})}>Proje listesine dön</button>}
    </div></main></div>

  return <div className="relative h-dvh w-screen overflow-hidden bg-[#F7F8FA] dark:bg-[#0B0D10] text-[#111318] dark:text-[#E9EDF3]">
    {header}{alerts}<LearningReward reward={reward} />
    <nav aria-label="Canvas bölümleri" className={`${panel} absolute top-20 left-6 z-30 flex gap-1 p-1 shadow-sm text-xs font-semibold`}>
      <button aria-pressed={!memoryOpen && !knowledgeOpen} className={`px-4 py-2 rounded-xl cursor-pointer ${!memoryOpen && !knowledgeOpen ? 'bg-[#75a94b]/15 text-[#5C8738] dark:text-[#B7F36B]' : ''}`} onClick={() => { setMemoryOpen(false); setKnowledgeOpen(false) }}>Harita</button>
      <button aria-pressed={memoryOpen} className="px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-2 hover:bg-[#75a94b]/10" onClick={openMemory}><History size={15} />Zaman Makinesi{!!memory?.dueCount && <span className="rounded-full bg-[#75a94b]/20 px-1.5 text-[10px]">{memory.dueCount}</span>}</button>
      <button aria-pressed={knowledgeOpen} className="px-4 py-2 rounded-xl cursor-pointer inline-flex items-center gap-2 hover:bg-[#75a94b]/10" onClick={() => { setSelectedId(null); setKnowledgeOpen(value => !value) }}><BadgeCheck size={15} />Bildiklerim</button>
    </nav>
    {currentMap?.parentMapId && <div className={`${panel} absolute top-20 left-[470px] z-30 px-3 py-2 flex items-center gap-3 text-xs`}><button className="inline-flex items-center gap-1 cursor-pointer text-[#5C8738] dark:text-[#B7F36B]" onClick={() => { const parent = bundle?.maps?.find(m => m.id === currentMap.parentMapId); setSelectedId(null); setParams({ project: projectId!, ...(parent?.parentMapId ? { map: parent.id } : {}) }) }}><ArrowLeft size={14} />Üst haritaya dön</button><span title={currentMap.description}>Alt öğrenme haritası</span></div>}
    {!!memory?.dueCount && !selected && !memoryOpen && <div className={`${panel} absolute top-20 right-6 z-30 max-w-xs p-4 shadow-lg`}><p className="text-sm font-semibold">Öğrendiklerin hâlâ seninle mi?</p><p className="text-xs text-[#68717D] mt-1">{memory.dueCount} konu için kısa hatırlama zamanı. İlerlemeni kaybetmeden 1–2 dakika ayırabilirsin.</p><button className="mt-3 text-xs font-semibold text-[#5C8738] dark:text-[#B7F36B] inline-flex gap-1 items-center" onClick={openMemory}>Kısa tekrarı aç<ArrowRight size={13} /></button></div>}
    <div className="absolute inset-0">
      <ReactFlow nodes={graph.nodes} edges={visibleEdges(graph.edges, showSupports)} nodeTypes={nodeTypes} edgeTypes={edgeTypes} nodesDraggable={false} nodesConnectable={false} deleteKeyCode={null} minZoom={0.15} maxZoom={1.6} onInit={instance => { flow.current = instance; window.setTimeout(() => void instance.fitView({ nodes: graph.nodes.filter(node => node.position.x <= Math.min(...graph.nodes.map(item => item.position.x)) + 720), padding: 0.2, maxZoom: 1 }), 100) }} onPaneClick={() => setSelectedId(null)}>
        <Background color={isDark ? '#222730' : '#CBD5E1'} gap={32} size={1.2} className="opacity-60" /><LiveCanvasControls showSupports={showSupports} toggleSupports={() => setShowSupports(value => !value)} locate={() => bundle && showRecommendation(bundle)} />
      </ReactFlow>
    </div>
    <TimeMachinePanel open={memoryOpen} data={memory} loadingError={memoryError} disabled={!!busy} close={() => setMemoryOpen(false)} refresh={refreshMemory} onAnswered={async correct => { const latest = await api.progress(); setReward({id: Date.now(), kind: correct ? 'success' : 'retry', points: Math.max(0,latest.totalPoints-(progress?.totalPoints || 0)), message: correct ? 'Öğrendiklerin hâlâ seninle. Yola devam!' : 'Kısa bir hatırlama yeterli. İlerlemen güvende.'}); setProgress(latest) }} />
    <KnowledgePanel open={knowledgeOpen} bundle={bundle!} close={() => setKnowledgeOpen(false)} activate={activate} />
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      <button className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedId(null)} aria-label="Haritaya dön" />
      <aside className={`${panel} ${reward?.kind === 'retry' ? 'learning-shake' : ''} relative !rounded-3xl border-2 w-full max-w-4xl max-h-[88vh] shadow-2xl flex flex-col overflow-hidden`} role="dialog" aria-modal="true" aria-label="Öğrenme durağı">
      <div className="p-6 border-b border-[#E3E7EC] dark:border-[#2A3038] bg-[#F7F8FA] dark:bg-[#111318] flex items-start justify-between gap-3"><div><p className="text-[10px] font-mono uppercase tracking-wider text-[#68717D] dark:text-[#9CA3AF] mb-2">{selectedMap?.kind === 'adaptive' ? 'ÖĞRENME DALI' : selectedMap?.kind === 'submap' ? 'ALT ÖĞRENME HARİTASI' : 'ANA ÖĞRENME YOLU'}</p><h2 className="font-extrabold text-3xl tracking-tight leading-snug">{selected.title}</h2></div><button className="p-1" onClick={() => setSelectedId(null)} aria-label="Durağı kapat"><X size={19} /></button></div>
      <div className="p-10 overflow-y-auto space-y-6 text-sm">
        <p className="leading-relaxed text-slate-500 dark:text-slate-400">{selected.summary}</p>
        {practice && <div className="rounded-xl border border-amber-300/60 bg-amber-50 dark:bg-amber-900/15 px-4 py-3 text-xs leading-relaxed"><strong>Demo denemesi</strong> · Bu durağın içeriğini ve testini inceleyebilirsin. Sonucun puan, tamamlanma veya kilit açma olarak kaydedilmez.</div>}
        {selected.status === 'locked' && !practice ? <div className="space-y-2"><p>Önce şu durakları tamamla:</p><ul className="list-disc pl-5 text-slate-500">{(selected.prerequisites ?? []).map(id => <li key={id}>{allNodes.find(n => n.id === id)?.title || id}</li>)}</ul></div>
          : selected.type === 'submap' && !practice ? <div className="space-y-4"><p className="text-sm text-slate-500">Bu kapsamlı alanı küçük adımlara ayırarak çalış. Projene uygun teknolojiler, ön koşullar ve paralel öğrenme yolları ayrı bir haritada gösterilir.</p><button className={primary} disabled={!!busy} onClick={openSubmap}><Compass size={17} />{selected.childMapId ? 'Alt haritaya devam et' : 'Alt öğrenme haritamı aç'}</button>{selected.status === 'completed' && <p className="text-[#557440]">Bu durak tamamlandı; alt haritayı yeniden inceleyebilirsin.</p>}</div> : <>
            {selected.status === 'completed' ? <p className="flex items-center gap-2 text-[#557440] dark:text-[#B7F36B]"><CheckCircle2 size={17} />Bu durak tamamlandı.</p> : !quiz && <div className="grid grid-cols-2 gap-4">
              {branchPending ? <button className={primary + ' w-full'} onClick={() => { const next = branch?.nodes.find(n => ['available', 'in_progress', 'needs_review'].includes(n.status)); if (next) { activate(next.id); focus(next.id) } }}><Sparkles size={17} />Öğrenme dalıma devam et</button>
                : <button className={primary + ' w-full'} disabled={!!busy} onClick={testKnowledge}><BrainCircuit size={17} />{selected.status === 'needs_review' ? 'Bilgimi yeniden test et' : 'Bilgimi test et'}</button>}
              {!branchPending && <button className={secondary + ' w-full'} disabled={!!busy} onClick={teach}><BookOpen size={17} />{practice ? 'İçeriği incele' : selectedMap?.kind === 'adaptive' ? 'Hiç bilmiyorum, öğret' : branch ? 'Öğrenme dalımı tekrar incele' : 'Hiç bilmiyorum, öğret'}</button>}
              <p className="col-span-2 text-xs font-mono text-[#9CA3AF]">{practice ? 'Bu deneme gerçek yolculuğundan bağımsızdır; öğrenme dalı veya tamamlanma oluşturmaz.' : selectedMap?.kind === 'adaptive' ? 'Konuyu öğrenip kısa testi geçerek bu dalda ilerle.' : 'Bildiklerini doğrula ve ilerle. Bilmediklerin için ana yolun yanında sana özel bir dal açılır.'}</p>
            </div>}
            {quiz && <section className="space-y-5"><div><h3 className="font-semibold">{quiz.title}</h3><p className="text-xs text-slate-500 mt-1">{quiz.questions.length} soru · {practice ? 'Demo denemesi; ilerleme kaydedilmez' : 'Her yeni doğru cevap +10 puan'}</p></div>{quiz.questions.map((question, index) => <fieldset key={question.id} className="space-y-2"><legend className="font-medium mb-2">{index + 1}. {question.prompt}</legend>{(question.options ?? []).map((option, optionIndex) => <label key={optionIndex} className={`flex gap-2 items-start p-3 rounded-xl border cursor-pointer ${answers[question.id] === optionIndex ? 'border-[#75a94b] bg-[#75a94b]/10' : 'border-slate-200 dark:border-slate-700'}`}><input type="radio" name={question.id} disabled={!!busy} checked={answers[question.id] === optionIndex} onChange={() => setAnswers(previous => ({ ...previous, [question.id]: optionIndex }))} className="mt-1" /><span>{option}</span></label>)}</fieldset>)}<button className={primary + ' w-full'} disabled={!!busy || quiz.questions.some(q => answers[q.id] === undefined)} onClick={submit}>Yanıtlarımı değerlendir</button><button className="text-xs underline" disabled={!!busy} onClick={() => setQuiz(null)}>Teste sonra devam et</button></section>}
            {lesson?.id === selected.id && !quiz && <section className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-4"><h3 className="font-semibold">Birlikte öğrenelim</h3><p className="leading-relaxed whitespace-pre-wrap">{lesson.lesson}</p><h3 className="font-semibold">Bu konu neden gerekli?</h3><p className="leading-relaxed whitespace-pre-wrap">{lesson.whyNeeded}</p><h3 className="font-semibold">Neler öğreneceksin?</h3><ul className="list-disc pl-5 space-y-2">{(lesson.learningObjectives ?? []).map(text => <li key={text}>{text}</li>)}</ul>{(lesson.subtopics ?? []).length > 0 && <><h3 className="font-semibold">Çalışma başlıkları</h3><ul className="list-disc pl-5 space-y-1">{(lesson.subtopics ?? []).map(text => <li key={text}>{text}</li>)}</ul></>}{lesson.practicalTask && <div className="rounded-xl bg-[#75a94b]/10 p-4 space-y-2"><h3 className="font-semibold">Uygula</h3><p>{lesson.practicalTask.description}</p><p className="text-xs text-slate-500">Beklenen çıktı: {lesson.practicalTask.expectedOutput}</p></div>}<button className={primary + ' w-full'} disabled={!!busy} onClick={testKnowledge}>Öğrendim, bilgimi test et</button></section>}
            {selected.type === 'development_task' && !practice && !quiz && !branchPending && selected.status !== 'completed' && <form className="space-y-3 border-t pt-4 border-slate-200 dark:border-slate-700" onSubmit={event => { event.preventDefault(); void perform('Görev çıktın kaydediliyor…', async () => { const oldPoints = progress?.totalPoints || 0; await api.completeTask(selected.id, taskEvidence); const next = await refresh(); const latest = await api.progress(); setReward({id: Date.now(), kind: 'success', points: Math.max(0, latest.totalPoints-oldPoints), nodeId: selected.id, message: 'Projen için çalışan bir çıktı daha hazırladın!'}); showRecommendation(next); setNotice('Proje görevin tamamlandı. Sıradaki durak vurgulandı.') }) }}><label className="block font-medium" htmlFor="task-evidence">Proje görevinin çıktısı</label><textarea id="task-evidence" className={input} value={taskEvidence} onChange={e => setTaskEvidence(e.target.value)} placeholder="Çalışan çıktını veya bağlantısını açıkla…" required /><button className={secondary + ' w-full'} disabled={!!busy || !taskEvidence.trim()}>Görevi tamamla</button></form>}
            {selectedMap?.kind === 'adaptive' && <button className="text-xs underline" onClick={() => { const target = selectedMap.targetNodeId; if (target) { activate(target); focus(target) } }}>Ana duraktaki hedefime dön</button>}
          </>}
        <Bibliography key={selected.id} nodeId={selected.id} title={selected.title} />
      </div>
    </aside></div>}
    <button className="absolute bottom-6 right-6 z-40 cursor-pointer rounded-3xl" aria-label="Danışmanı aç" onClick={() => { setSelectedId(null); setAdvisorOpen(!advisorOpen) }}><TeacherAdvisorFigure size="md" showBubble showCaption /></button>
    <FloatingPanel open={advisorOpen} title="Proje danışmanı" icon={<Sparkles size={16} />} close={() => setAdvisorOpen(false)} width={360} height={400} anchor="advisor"><div className="min-h-0 flex-1 p-4 overflow-y-auto space-y-3 text-sm"><p className="text-xs text-slate-500">{selected ? `Seçili durak: ${selected.title}` : bundle?.project.title}. Sorunu gönderdiğinde ilgili proje ve öğrenme bağlamıyla yanıtlanır.</p>{messages.map((item, index) => <div key={index} className={`rounded-xl p-3 whitespace-pre-wrap ${item.role === 'user' ? 'bg-[#75a94b]/15 ml-7' : 'bg-slate-100 dark:bg-slate-800 mr-3'}`}>{item.text}</div>)}</div><form onSubmit={chat} className="p-3 flex gap-2"><input className={input} aria-label="Danışmana sorun" value={message} onChange={event => setMessage(event.target.value)} placeholder="Bu öğrenme dalı neden eklendi?" maxLength={4000} /><button className={primary + ' !p-3'} disabled={!!busy || !message.trim()} aria-label="Soruyu gönder"><Send size={17} /></button></form></FloatingPanel>
  </div>
}

export function LearningWorkspace() { const [params] = useSearchParams(); return <ReactFlowProvider key={params.get('project') || 'new'}><Workspace /></ReactFlowProvider> }
