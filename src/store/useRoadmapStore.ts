import { create } from 'zustand'
import {
  type Edge,
  type Node,
  type OnEdgesChange,
  type OnNodesChange,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react'
import {
  initialMlSubmapEdges,
  initialMlSubmapNodes,
  initialRootEdges,
  initialRootNodes,
  pythonQuizData,
  remedialPythonNode,
} from '@/data/mockCanvasData'
import {
  type AdvisorMessage,
  type NodeData,
  type NodeStatus,
  type OnboardingAnswers,
  type QuizData,
} from '@/types/canvas'

interface RoadmapState {
  currentLevel: 'root' | 'ml-submap'
  projectName: string
  rootNodes: Node<NodeData>[]
  rootEdges: Edge[]
  mlSubmapNodes: Node<NodeData>[]
  mlSubmapEdges: Edge[]
  selectedNode: Node<NodeData> | null
  isDetailPanelOpen: boolean
  isQuizOpen: boolean
  activeQuiz: QuizData | null
  isRemedialNodeAdded: boolean
  adaptiveNotice: string | null
  onboardingAnswers: OnboardingAnswers | null
  isAdvisorOpen: boolean
  advisorMessages: AdvisorMessage[]

  // Navigation
  navigateToSubmap: (submapId: string) => void
  navigateToRoot: () => void

  // Node selection & Detail Panel
  selectNode: (node: Node<NodeData> | null) => void
  closeDetailPanel: () => void
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void

  // Knowledge Assessment & Adaptive insertion
  openQuiz: (quizId: string) => void
  closeQuiz: () => void
  handleQuizCompletion: (passed: boolean) => void
  insertRemedialNode: () => void
  clearAdaptiveNotice: () => void

  // Onboarding
  setOnboardingAnswers: (answers: OnboardingAnswers) => void

  // Advisor
  toggleAdvisor: () => void
  setAdvisorOpen: (open: boolean) => void
  sendAdvisorMessage: (userText: string) => void

  // React Flow handlers
  onNodesChange: OnNodesChange<Node<NodeData>>
  onEdgesChange: OnEdgesChange

  // Demo Reset
  resetDemo: () => void
}

const STORAGE_KEY = 'projectpath_interactive_state_v1'

function loadSavedState(): Partial<RoadmapState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // Ignore parse error
  }
  return null
}

function saveStateToStorage(state: Partial<RoadmapState>) {
  try {
    const payload = {
      currentLevel: state.currentLevel,
      projectName: state.projectName,
      rootNodes: state.rootNodes,
      rootEdges: state.rootEdges,
      mlSubmapNodes: state.mlSubmapNodes,
      mlSubmapEdges: state.mlSubmapEdges,
      isRemedialNodeAdded: state.isRemedialNodeAdded,
      onboardingAnswers: state.onboardingAnswers,
      advisorMessages: state.advisorMessages,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore quota error
  }
}

const defaultAdvisorMessages: AdvisorMessage[] = [
  {
    id: 'msg-1',
    sender: 'advisor',
    textTr: 'Merhaba! Ben ProjectPath AI Öğrenme Danışmanınızım. AI Fitness projeniz ve Machine Learning alt haritanızla ilgili sorularınızı yanıtlayabilir veya yol haritanızı uyarlayabilirim.',
    textEn: "Hello! I'm your ProjectPath AI Learning Advisor. I can assist you with your AI Fitness project, guide you through the ML submap, or adapt your learning milestones.",
    timestamp: 'Şimdi / Now',
  },
]

export const useRoadmapStore = create<RoadmapState>((set, get) => {
  const saved = loadSavedState()

  return {
    currentLevel: saved?.currentLevel || 'root',
    projectName: saved?.projectName || 'AI Fitness App',
    rootNodes: saved?.rootNodes || initialRootNodes,
    rootEdges: saved?.rootEdges || initialRootEdges,
    mlSubmapNodes: saved?.mlSubmapNodes || initialMlSubmapNodes,
    mlSubmapEdges: saved?.mlSubmapEdges || initialMlSubmapEdges,
    selectedNode: null,
    isDetailPanelOpen: false,
    isQuizOpen: false,
    activeQuiz: null,
    isRemedialNodeAdded: saved?.isRemedialNodeAdded || false,
    adaptiveNotice: null,
    onboardingAnswers: saved?.onboardingAnswers || null,
    isAdvisorOpen: false,
    advisorMessages: saved?.advisorMessages || defaultAdvisorMessages,

    navigateToSubmap: (submapId: string) => {
      if (submapId === 'ml-submap') {
        set({ currentLevel: 'ml-submap', selectedNode: null, isDetailPanelOpen: false })
        saveStateToStorage(get())
      }
    },

    navigateToRoot: () => {
      set({ currentLevel: 'root', selectedNode: null, isDetailPanelOpen: false })
      saveStateToStorage(get())
    },

    selectNode: (node: Node<NodeData> | null) => {
      if (node) {
        set({ selectedNode: node, isDetailPanelOpen: true })
      } else {
        set({ selectedNode: null, isDetailPanelOpen: false })
      }
    },

    closeDetailPanel: () => {
      set({ isDetailPanelOpen: false, selectedNode: null })
    },

    updateNodeStatus: (nodeId: string, status: NodeStatus) => {
      const { currentLevel, rootNodes, mlSubmapNodes } = get()
      if (currentLevel === 'root') {
        const updated = rootNodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status } } : n)
        set({ rootNodes: updated })
      } else {
        const updated = mlSubmapNodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, status } } : n)
        set({ mlSubmapNodes: updated })
      }
      saveStateToStorage(get())
    },

    openQuiz: (quizId: string) => {
      if (quizId === 'quiz-python') {
        set({ isQuizOpen: true, activeQuiz: pythonQuizData })
      }
    },

    closeQuiz: () => {
      set({ isQuizOpen: false, activeQuiz: null })
    },

    handleQuizCompletion: (passed: boolean) => {
      const { mlSubmapNodes, mlSubmapEdges, isRemedialNodeAdded } = get()

      if (passed) {
        // Success: Mark Python as completed and unlock NumPy & Pandas
        const updatedNodes = mlSubmapNodes.map(node => {
          if (node.id === 'ml-python') {
            return { ...node, data: { ...node.data, status: 'completed' as NodeStatus } }
          }
          if (node.id === 'ml-numpy-pandas') {
            return { ...node, data: { ...node.data, status: 'available' as NodeStatus } }
          }
          return node
        })
        set({
          mlSubmapNodes: updatedNodes,
          isQuizOpen: false,
          activeQuiz: null,
          adaptiveNotice: 'Tebrikler! Değerlendirmeyi başarıyla tamamladın. Sonraki konu ("NumPy ve Pandas") açıldı.',
        })
      } else {
        // Failure: Mark Python as needs_review, and insert adaptive remedial practice node!
        const updatedNodes = mlSubmapNodes.map(node => {
          if (node.id === 'ml-python') {
            return { ...node, data: { ...node.data, status: 'needs_review' as NodeStatus } }
          }
          return node
        })

        if (!isRemedialNodeAdded) {
          // Add the remedial node between Python and NumPy/Pandas
          const nextNodes = [...updatedNodes, remedialPythonNode]
          const nextEdges: Edge[] = [
            ...mlSubmapEdges.filter(e => e.id !== 'e-ml-python-numpy'),
            {
              id: 'e-python-remedial',
              source: 'ml-python',
              target: 'ml-remedial-python',
              animated: true,
              style: { stroke: '#F59E0B', strokeDasharray: '4 4' },
            },
            {
              id: 'e-remedial-numpy',
              source: 'ml-remedial-python',
              target: 'ml-numpy-pandas',
              style: { stroke: '#2A3038' },
            },
          ]
          set({
            mlSubmapNodes: nextNodes,
            mlSubmapEdges: nextEdges,
            isRemedialNodeAdded: true,
            isQuizOpen: false,
            activeQuiz: null,
            adaptiveNotice: 'Öğrenme haritan, gelişim ihtiyaçlarına göre güncellendi. "Python Fonksiyonları — Ek Pratik" adımı eklendi.',
          })
        } else {
          set({
            mlSubmapNodes: updatedNodes,
            isQuizOpen: false,
            activeQuiz: null,
            adaptiveNotice: 'Konu "Gözden Geçirilmeli" olarak işaretlendi. Ek pratik görevini tamamlayarak ilerleyebilirsin.',
          })
        }
      }
      saveStateToStorage(get())
    },

    insertRemedialNode: () => {
      const { mlSubmapNodes, mlSubmapEdges, isRemedialNodeAdded } = get()
      if (isRemedialNodeAdded) return

      const nextNodes = [...mlSubmapNodes, remedialPythonNode]
      const nextEdges: Edge[] = [
        ...mlSubmapEdges.filter(e => e.id !== 'e-ml-python-numpy'),
        {
          id: 'e-python-remedial',
          source: 'ml-python',
          target: 'ml-remedial-python',
          animated: true,
          style: { stroke: '#F59E0B', strokeDasharray: '4 4' },
        },
        {
          id: 'e-remedial-numpy',
          source: 'ml-remedial-python',
          target: 'ml-numpy-pandas',
          style: { stroke: '#2A3038' },
        },
      ]

      set({
        mlSubmapNodes: nextNodes,
        mlSubmapEdges: nextEdges,
        isRemedialNodeAdded: true,
        adaptiveNotice: 'Yapay zekâ danışman önerisiyle "Python Fonksiyonları — Ek Pratik" adımı yol haritana eklendi!',
      })
      saveStateToStorage(get())
    },

    clearAdaptiveNotice: () => {
      set({ adaptiveNotice: null })
    },

    setOnboardingAnswers: (answers: OnboardingAnswers) => {
      // Personalize roadmap node statuses based on answers
      let updatedMlNodes = initialMlSubmapNodes.map(n => ({ ...n, data: { ...n.data } }))
      
      if (answers.experienceLevel === 'intermediate' || answers.knownTechs.includes('Python')) {
        // Intermediate profile: mark Python as self-reported & available
        updatedMlNodes = updatedMlNodes.map(n => {
          if (n.id === 'ml-python') {
            return {
              ...n,
              data: { ...n.data, isSelfReported: true, status: 'available' as NodeStatus },
            }
          }
          if (n.id === 'ml-numpy-pandas') {
            return {
              ...n,
              data: { ...n.data, status: 'available' as NodeStatus },
            }
          }
          return n
        })
      } else if (answers.experienceLevel === 'advanced') {
        // Advanced profile: mark Python as completed
        updatedMlNodes = updatedMlNodes.map(n => {
          if (n.id === 'ml-python') {
            return {
              ...n,
              data: { ...n.data, status: 'completed' as NodeStatus },
            }
          }
          if (n.id === 'ml-numpy-pandas') {
            return {
              ...n,
              data: { ...n.data, status: 'available' as NodeStatus },
            }
          }
          return n
        })
      }

      set({
        onboardingAnswers: answers,
        mlSubmapNodes: updatedMlNodes,
        currentLevel: 'root',
      })
      saveStateToStorage(get())
    },

    toggleAdvisor: () => {
      set(s => ({ isAdvisorOpen: !s.isAdvisorOpen }))
    },

    setAdvisorOpen: (open: boolean) => {
      set({ isAdvisorOpen: open })
    },

    sendAdvisorMessage: (userText: string) => {
      const { currentLevel, isRemedialNodeAdded } = get()
      const timestamp = 'Şimdi / Now'

      const userMsg: AdvisorMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        textTr: userText,
        textEn: userText,
        timestamp,
      }

      set(s => ({ advisorMessages: [...s.advisorMessages, userMsg] }))

      // Deterministic Contextual AI responses
      setTimeout(() => {
        let replyTr = ''
        let replyEn = ''
        let action: AdvisorMessage['action'] = undefined

        const lower = userText.toLowerCase()

        if (lower.includes('ek pratik') || lower.includes('pratik ekle')) {
          replyTr = 'Python fonksiyonları ve parametre yönetimi konusunda ek pratik görevi oluşturabilirim. Bu adımı yol haritana eklemek ister misin?'
          replyEn = 'I can add an extra practice milestone for Python functions and parameter handling. Would you like me to insert this into your roadmap?'
          action = {
            type: 'add_remedial_node',
            labelTr: 'Haritaya Ekle',
            labelEn: 'Insert into Map',
          }
        } else if (lower.includes('neden') && (lower.includes('yeni') || lower.includes('eklendi') || lower.includes('remedial'))) {
          replyTr = isRemedialNodeAdded
            ? 'Yapılan Python bilgi değerlendirmesinde fonksiyon tanımlama ve veri yapıları konularında eksikler tespit edildi. NumPy ve Pandas gibi vektörize kütüphanelere geçmeden önce bu eksiklerin tamamlanması için yol haritan otomatik olarak güncellendi.'
            : 'Şu anda haritada herhangi bir telafi görevi bulunmuyor. Dilediğinde zorlandığın konular için ek pratik talep edebilirsin.'
          replyEn = isRemedialNodeAdded
            ? 'The assessment indicated areas for improvement in function signatures and data structures. To ensure a solid foundation before advancing to NumPy arrays, an adaptive practice milestone was inserted.'
            : 'No remedial tasks are currently active on your roadmap.'
        } else if (lower.includes('nereden başlamalı') || lower.includes('nereden başlamalıyım')) {
          if (currentLevel === 'ml-submap') {
            replyTr = 'Machine Learning alt haritasındasın. İlk olarak "Python Temelleri" adımından başlamalısın. Eğer bu konuya hakimsen "Bilgimi Test Et" butonuna tıklayarak doğrudan sonraki aşamaya geçebilirsin.'
            replyEn = 'You are currently in the Machine Learning submap. Start with "Python Fundamentals". If you already know this, click "Test My Knowledge" to fast-track.'
          } else {
            replyTr = 'AI Fitness uygulamasının çekirdek değeri öneri motorudur. Önce "Machine Learning (Öneri Motoru)" alt haritasını tamamlamanı, ardından Mobil arayüz entegrasyonuna geçmeni tavsiye ederim.'
            replyEn = 'The core value of your AI Fitness app is its recommendation engine. I recommend beginning with the "Machine Learning" submap first.'
          }
        } else if (lower.includes('machine learning neden') || lower.includes('ml neden')) {
          replyTr = 'Kullanıcının geçmiş antrenman sıklığını, dinlenme nabzını ve performansını analiz ederek statik listeler yerine kişiye özel dinamik egzersiz önerisi sunmak için Machine Learning gereklidir.'
          replyEn = 'Machine Learning is vital to provide dynamic, physiology-aware workout recommendations based on biometric history rather than static routines.'
        } else if (lower.includes('python bilmiyorsam')) {
          replyTr = 'Endişelenme! Hazırladığımız yol haritası sıfırdan başlamaya uygundur. "Python Temelleri" konusundaki interaktif egzersizler seni adım adım hazırlayacak.'
          replyEn = "No worries! The roadmap is built for foundational learning. The interactive exercises in 'Python Fundamentals' will guide you step by step."
        } else {
          replyTr = `"${userText.slice(0, 40)}..." sorunu kaydettim. Prototip modunda önceden tanımlanmış hızlı aksiyonları kullanarak yol haritanı yönlendirebilirsin.`
          replyEn = `Captured your query: "${userText.slice(0, 40)}...". In prototype mode, use the quick action prompts to test adaptive features.`
        }

        const advisorReply: AdvisorMessage = {
          id: `advisor-${Date.now()}`,
          sender: 'advisor',
          textTr: replyTr,
          textEn: replyEn,
          timestamp: 'Şimdi / Now',
          action,
        }

        set(s => ({ advisorMessages: [...s.advisorMessages, advisorReply] }))
        saveStateToStorage(get())
      }, 400)
    },

    onNodesChange: changes => {
      const { currentLevel, rootNodes, mlSubmapNodes } = get()
      if (currentLevel === 'root') {
        set({ rootNodes: applyNodeChanges(changes, rootNodes) })
      } else {
        set({ mlSubmapNodes: applyNodeChanges(changes, mlSubmapNodes) })
      }
    },

    onEdgesChange: changes => {
      const { currentLevel, rootEdges, mlSubmapEdges } = get()
      if (currentLevel === 'root') {
        set({ rootEdges: applyEdgeChanges(changes, rootEdges) })
      } else {
        set({ mlSubmapEdges: applyEdgeChanges(changes, mlSubmapEdges) })
      }
    },

    resetDemo: () => {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {}
      set({
        currentLevel: 'root',
        projectName: 'AI Fitness App',
        rootNodes: initialRootNodes,
        rootEdges: initialRootEdges,
        mlSubmapNodes: initialMlSubmapNodes,
        mlSubmapEdges: initialMlSubmapEdges,
        selectedNode: null,
        isDetailPanelOpen: false,
        isQuizOpen: false,
        activeQuiz: null,
        isRemedialNodeAdded: false,
        adaptiveNotice: null,
        onboardingAnswers: null,
        advisorMessages: defaultAdvisorMessages,
        isAdvisorOpen: false,
      })
    },
  }
})
