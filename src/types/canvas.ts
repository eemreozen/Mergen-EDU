export type NodeCategory = 'root' | 'domain' | 'learning' | 'task'

export type NodeStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'needs_review'

export interface QuizQuestion {
  id: string
  questionTr: string
  questionEn: string
  optionsTr: string[]
  optionsEn: string[]
  correctIndex: number
  explanationTr: string
  explanationEn: string
}

export interface QuizData {
  id: string
  nodeId: string
  titleTr: string
  titleEn: string
  passingScore: number
  questions: QuizQuestion[]
}

export interface NodeData {
  id: string
  titleTr: string
  titleEn: string
  category: NodeCategory
  status: NodeStatus
  domain?: string
  estimatedHours?: number
  hasSubmap?: boolean
  submapId?: string
  isSelfReported?: boolean
  isRemedial?: boolean
  whyNeededTr?: string
  whyNeededEn?: string
  prerequisitesTr?: string[]
  prerequisitesEn?: string[]
  learningObjectivesTr?: string[]
  learningObjectivesEn?: string[]
  practicalTaskTr?: string
  practicalTaskEn?: string
  resources?: { title: string; url: string; type: 'video' | 'doc' | 'interactive' }[]
  quizId?: string
  [key: string]: unknown
}

export interface OnboardingAnswers {
  experienceLevel: string // 'beginner' | 'basic' | 'intermediate' | 'advanced'
  knownTechs: string[]
  mlKnowledge: string // 'none' | 'concepts' | 'basic_models' | 'production'
  weeklyHours: string // '2-5' | '5-10' | '10-20' | '20+'
  primaryGoal: string // 'mvp' | 'deep_learning' | 'portfolio' | 'startup'
}

export interface AdvisorMessage {
  id: string
  sender: 'advisor' | 'user'
  textTr: string
  textEn: string
  timestamp: string
  action?: {
    type: 'add_remedial_node'
    labelTr: string
    labelEn: string
    confirmed?: boolean
  }
}
