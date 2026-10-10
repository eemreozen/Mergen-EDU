import type { ExportBundle, ProjectView, DiscoveryView, DiscoveryAnswer, MapView, NodeView, AssessmentView } from './types'
import type { MemoryChallenge, MemoryResult, TimeMachine } from './memory-types'
import type { ReferenceView } from './resource-types'

const SESSION_KEY = 'mergen_demo_session'
export function sessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(SESSION_KEY, id) }
  return id
}
export class ApiError extends Error {
  constructor(public code: string, message: string, public retryable: boolean) { super(message) }
}
const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1'
async function request<T>(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 150_000)
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) controller.abort()
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method, signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'X-Demo-Session': sessionId() },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const data = await response.json()
    if (!response.ok) throw new ApiError(data.error?.code || 'REQUEST_FAILED', data.error?.message || 'İstek tamamlanamadı.', !!data.error?.retryable)
    return data as T
  } catch (error) {
    if (signal?.aborted) throw error
    if (error instanceof ApiError) throw error
    throw new Error(error instanceof DOMException && error.name === 'AbortError'
      ? 'İstek zaman aşımına uğradı. Yeniden deneyebilirsin.' : 'Backend bağlantısı kurulamadı. Sunucunun açık olduğundan emin ol.')
  } finally { window.clearTimeout(timeout); signal?.removeEventListener('abort', abort) }
}
export interface LearnerProgress { totalPoints: number; level: number; correctAnswers: number; completedSteps: number; practiceEnabled: boolean }
export interface QuizResult {
  practice: boolean; pointsAwarded: number; correctAnswers: number;
  attemptId: string; passed: boolean; score: number; weakSkills: string[];
  remediationCreated: boolean; adaptiveMap: MapView | null; map: MapView
  memoryReviewIds: string[]
}
export const api = {
  progress: () => request<LearnerProgress>('/me/progress'),
  timeMachine: (projectId: string) => request<TimeMachine>(`/projects/${projectId}/time-machine`),
  prepareMemory: (reviewId: string) => request<MemoryChallenge>(`/memory/${reviewId}/prepare`, 'POST'),
  answerMemory: (reviewId: string, checkId: string, selectedIndex: number, submissionId: string) =>
    request<MemoryResult>(`/memory/${reviewId}/answer`, 'POST', { checkId, selectedIndex, submissionId }),
  projects: () => request<ProjectView[]>('/projects'),
  createProject: (idea: string, locale = 'tr') => request<ProjectView>('/projects', 'POST', { idea, locale }),
  exportProject: (id: string) => request<ExportBundle>(`/projects/${id}/export`),
  answer: (id: string, questionId: string, value: string | string[], extra: DiscoveryAnswer[] = []) => request<DiscoveryView>(`/projects/${id}/discovery/answers`, 'POST', { answers: [{ questionId, value }, ...extra] }),
  generate: (id: string) => request<MapView>(`/projects/${id}/roadmap/generate`, 'POST'),
  submap: (id: string) => request<MapView>(`/nodes/${id}/submap`, 'POST'),
  learn: (id: string) => request<MapView>(`/nodes/${id}/learn`, 'POST'),
  node: (id: string, practice = false) => request<NodeView>(`/nodes/${id}?practice=${practice}`),
  references: (id: string, signal?: AbortSignal) => request<ReferenceView>(`/nodes/${id}/references`, 'GET', undefined, signal),
  assessment: (id: string, practice = false) => request<AssessmentView>(`/nodes/${id}/assessment?practice=${practice}`),
  submit: (nodeId: string, quiz: AssessmentView, submissionId: string, answers: Record<string, number>, practice = false) => request<QuizResult>(`/nodes/${nodeId}/assessment/submit`, 'POST', {
    practice, assessmentId: quiz.id, version: quiz.version, submissionId,
    answers: quiz.questions.map(q => ({ questionId: q.id, selectedIndex: answers[q.id] })),
  }),
  completeTask: (id: string, expectedOutput: string) => request<MapView>(`/nodes/${id}`, 'PATCH', { action: 'complete_task', expectedOutput }),
  advisor: (projectId: string, message: string, node?: NodeView) => request<{ reply: string }>(`/advisor/chat`, 'POST', { projectId, message, currentNodeId: node?.id, currentMapId: node?.mapId }),
}
