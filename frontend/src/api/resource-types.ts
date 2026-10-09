import type { ResourceView } from './types'

export interface ReferenceView {
  resources: ResourceView[]
  status: 'complete' | 'partial' | 'unavailable'
}
