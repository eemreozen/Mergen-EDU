import { create } from 'zustand'

export interface UserRoadmap {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  progress: number // 0-100
  completedMilestones: number
  totalMilestones: number
  tags: string[]
  lastActive: string
  lastActiveEn: string
  difficulty: 'Başlangıç' | 'Orta' | 'İleri'
  difficultyEn: 'Beginner' | 'Intermediate' | 'Advanced'
  status: 'in_progress' | 'completed'
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  streakDays: number
  totalXp: number
  level: number
}

const DEFAULT_ROADMAPS: UserRoadmap[] = [
  {
    id: 'roadmap-ai-fitness',
    title: 'AI Fitness & Beslenme Koçu',
    titleEn: 'AI Fitness & Nutrition Coach',
    description: 'Egzersiz hareketlerini kamera ile analiz eden ve kişiselleştirilmiş antrenman/beslenme programı sunan akıllı asistan.',
    descriptionEn: 'Smart assistant analyzing exercise movements and providing personalized workout & diet plans.',
    progress: 42,
    completedMilestones: 6,
    totalMilestones: 14,
    tags: ['Python', 'Computer Vision', 'PyTorch', 'FastAPI'],
    lastActive: '2 saat önce',
    lastActiveEn: '2 hours ago',
    difficulty: 'Orta',
    difficultyEn: 'Intermediate',
    status: 'in_progress',
  },
  {
    id: 'roadmap-ecommerce',
    title: 'Modern E-Ticaret & Ödeme Altyapısı',
    titleEn: 'Modern E-Commerce & Payments',
    description: 'Sepet yönetimi, Stripe/Iyzico güvenli ödeme akışı ve sipariş durumu takip paneli içeren modern online mağaza platformu.',
    descriptionEn: 'Full-stack online store with cart checkout, secure Stripe payment gateway, and order tracking.',
    progress: 18,
    completedMilestones: 2,
    totalMilestones: 11,
    tags: ['React', 'TypeScript', 'Node.js', 'Stripe API', 'PostgreSQL'],
    lastActive: 'Dün',
    lastActiveEn: 'Yesterday',
    difficulty: 'Başlangıç',
    difficultyEn: 'Beginner',
    status: 'in_progress',
  },
  {
    id: 'roadmap-realtime-chat',
    title: 'Gerçek Zamanlı Sohbet & WebRTC',
    titleEn: 'Real-Time Chat & WebRTC Calling',
    description: 'WebSockets ile anlık mesajlaşma, oda bazlı grup kanalları ve WebRTC üzerinden kesintisiz birebir görüntülü arama.',
    descriptionEn: 'Real-time WebSocket chat rooms, group channels, and peer-to-peer WebRTC video calling.',
    progress: 75,
    completedMilestones: 9,
    totalMilestones: 12,
    tags: ['WebSockets', 'WebRTC', 'Redis', 'Docker'],
    lastActive: '3 gün önce',
    lastActiveEn: '3 days ago',
    difficulty: 'İleri',
    difficultyEn: 'Advanced',
    status: 'in_progress',
  },
]

export const MOCK_USER: UserProfile = {
  id: 'usr-emre-01',
  name: 'Emre Özen',
  email: 'eemreozen@users.noreply.github.com',
  avatar: 'EÖ',
  role: 'Yazılım Öğrenicisi',
  streakDays: 5,
  totalXp: 1420,
  level: 4,
}

interface AuthState {
  user: UserProfile | null
  roadmaps: UserRoadmap[]
  loginAsMockUser: () => void
  logout: () => void
  deleteRoadmap: (id: string) => void
  createRoadmapFromIdea: (idea: string) => UserRoadmap
  resetRoadmapsToDefault: () => void
}

const STORAGE_USER_KEY = 'projectpath_auth_user'
const STORAGE_ROADMAPS_KEY = 'projectpath_user_roadmaps'

function loadSavedUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function loadSavedRoadmaps(): UserRoadmap[] {
  try {
    const raw = localStorage.getItem(STORAGE_ROADMAPS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_ROADMAPS
  } catch {
    return DEFAULT_ROADMAPS
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadSavedUser(),
  roadmaps: loadSavedRoadmaps(),

  loginAsMockUser: () => {
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(MOCK_USER))
    set({ user: MOCK_USER })
  },

  logout: () => {
    localStorage.removeItem(STORAGE_USER_KEY)
    set({ user: null })
  },

  deleteRoadmap: (id: string) => {
    const nextRoadmaps = get().roadmaps.filter(r => r.id !== id)
    localStorage.setItem(STORAGE_ROADMAPS_KEY, JSON.stringify(nextRoadmaps))
    set({ roadmaps: nextRoadmaps })
  },

  createRoadmapFromIdea: (idea: string) => {
    const trimmed = idea.trim()
    const newRoadmap: UserRoadmap = {
      id: `roadmap-${Date.now()}`,
      title: trimmed.slice(0, 42) + (trimmed.length > 42 ? '...' : ''),
      titleEn: trimmed.slice(0, 42) + (trimmed.length > 42 ? '...' : ''),
      description: trimmed,
      descriptionEn: trimmed,
      progress: 0,
      completedMilestones: 0,
      totalMilestones: 10,
      tags: ['TypeScript', 'FullStack', 'AI'],
      lastActive: 'Şimdi oluşturuldu',
      lastActiveEn: 'Created just now',
      difficulty: 'Başlangıç',
      difficultyEn: 'Beginner',
      status: 'in_progress',
    }

    const nextRoadmaps = [newRoadmap, ...get().roadmaps]
    localStorage.setItem(STORAGE_ROADMAPS_KEY, JSON.stringify(nextRoadmaps))
    set({ roadmaps: nextRoadmaps })
    return newRoadmap
  },

  resetRoadmapsToDefault: () => {
    localStorage.setItem(STORAGE_ROADMAPS_KEY, JSON.stringify(DEFAULT_ROADMAPS))
    set({ roadmaps: DEFAULT_ROADMAPS })
  },
}))
