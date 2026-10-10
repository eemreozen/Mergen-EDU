import type { Edge, Node } from '@xyflow/react'
import { createRouter, type Point } from './routing.ts'
import type { ExportBundle, MapView, NodeView } from '@/api/types'

export type LearningNodeData = { node: NodeView; stepNumber: number; mapTitle: string; adaptive: boolean; recommended: boolean; activate: (id: string) => void }

export function recommendedNode(bundle: ExportBundle, mapId?: string): NodeView | undefined {
  if (mapId) {
    const scope = new Set([mapId])
    let changed = true
    while (changed) {
      changed = false
      for (const map of bundle.maps ?? []) if (map.parentMapId && scope.has(map.parentMapId) && !scope.has(map.id)) { scope.add(map.id); changed = true }
    }
    bundle = { ...bundle, maps: bundle.maps?.filter(m => scope.has(m.id)) }
  }
  const ordered = (map: MapView) => {
    const { steps } = arrange(map)
    return [...map.nodes].sort((a, b) => steps.get(a.id)! - steps.get(b.id)!)
  }
  const all = (bundle.maps ?? []).flatMap(ordered)
  const branches = (bundle.maps ?? []).filter(m => m.kind === 'adaptive')
  for (const branch of branches) {
    const target = all.find(n => n.id === branch.targetNodeId)
    if (target?.status === 'completed') continue
    const next = ordered(branch).find(n => ['available', 'in_progress', 'needs_review'].includes(n.status))
    if (next) return next
    if (target && branch.nodes.every(n => n.status === 'completed')) return target
  }
  const activeTargets = new Set(branches.filter(m => m.nodes.some(n => n.status !== 'completed')).map(m => m.targetNodeId))
  const candidates = all.filter(n => !n.childMapId || !bundle.maps?.find(m => m.id === n.childMapId)?.nodes.some(child => child.status !== 'completed'))
  return candidates.find(n => !activeTargets.has(n.id) && n.status === 'in_progress')
    || candidates.find(n => !activeTargets.has(n.id) && n.status === 'available')
    || candidates.find(n => !activeTargets.has(n.id) && n.status === 'needs_review')
}

// Deterministic layered DAG layout. Progress and additional maps never move the root.
const COLUMN = 360
const ROW = 210
export const STOP_WIDTH = 220
export const STOP_HEIGHT = 144
const WIDTH = STOP_WIDTH
const HEIGHT = STOP_HEIGHT

function arrange(map: MapView) {
  const ids = new Set(map.nodes.map(n => n.id))
  const incoming = new Map(map.nodes.map(n => [n.id, [] as string[]]))
  const outgoing = new Map(map.nodes.map(n => [n.id, [] as string[]]))
  for (const edge of map.edges) {
    if (edge.kind !== 'requires' || !ids.has(edge.source) || !ids.has(edge.target)) continue
    incoming.get(edge.target)!.push(edge.source)
    outgoing.get(edge.source)!.push(edge.target)
  }
  const index = new Map(map.nodes.map((n, i) => [n.id, i]))
  const pending = new Map([...incoming].map(([id, parents]) => [id, parents.length]))
  const queue = map.nodes.filter(n => !pending.get(n.id)).map(n => n.id)
  const order: string[] = []
  const earliest = new Map(map.nodes.map(n => [n.id, 0]))
  while (queue.length) {
    const id = queue.shift()!
    order.push(id)
    for (const next of outgoing.get(id)!) {
      earliest.set(next, Math.max(earliest.get(next)!, earliest.get(id)! + 1))
      pending.set(next, pending.get(next)! - 1)
      if (!pending.get(next)) queue.push(next)
    }
  }
  // Defensive fallback for an invalid imported graph; the backend rejects cycles.
  for (const node of map.nodes) if (!order.includes(node.id)) order.push(node.id)
  const depth = Math.max(0, ...earliest.values())
  const ranks = new Map(earliest)
  // Place short prerequisite chains just before their consumer, rather than
  // stretching every independent starting point across the entire canvas.
  for (const id of [...order].reverse()) {
    const children = outgoing.get(id)!.filter(child => earliest.get(child)! > earliest.get(id)!)
    if (children.length) ranks.set(id, Math.max(earliest.get(id)!, Math.min(...children.map(child => ranks.get(child)!)) - 1))
    else if (incoming.get(id)!.length) ranks.set(id, depth)
  }
  const rows = new Map<number, string[]>()
  for (const id of order) {
    const rank = ranks.get(id)!
    rows.set(rank, [...(rows.get(rank) || []), id])
  }
  const slots = new Map<string, number>()
  for (const row of rows.values()) row.forEach((id, i) => slots.set(id, i))
  // Barycentric sweeps keep related parallel tracks next to each other.
  const rankedRows = [...rows].sort(([a], [b]) => a - b)
  for (let sweep = 0; sweep < 6; sweep++) {
    const forward = sweep % 2 === 0
    for (const [, row] of forward ? rankedRows : [...rankedRows].reverse()) {
      const neighbors = forward ? incoming : outgoing
      const score = (id: string) => {
        const near = neighbors.get(id)!
        return near.length ? near.reduce((sum, next) => sum + slots.get(next)!, 0) / near.length : slots.get(id)!
      }
      row.sort((a, b) => score(a) - score(b) || index.get(a)! - index.get(b)!)
      row.forEach((id, i) => slots.set(id, i))
    }
  }
  const columns = Math.max(1, ...[...rows.values()].map(row => row.length))
  // A repeated rise and fall echoes the logo while progress always moves right.
  // Parallel prerequisites retain separate lanes at every rank.
  const bend = (rank: number) => (1 + Math.cos(rank * Math.PI / 2)) * 64
  const positions = new Map<string, { x: number; y: number }>()
  const steps = new Map<string, number>()
  let step = 0
  for (const [rank, row] of rankedRows) {
    row.forEach((id, i) => {
      positions.set(id, { x: rank * COLUMN, y: bend(rank) + (i + (columns - row.length) / 2) * ROW })
      steps.set(id, ++step)
    })
  }
  return { positions, steps, ranks, height: Math.max(0, ...[...positions.values()].map(p => p.y)) + HEIGHT }
}

export function layoutMaps(bundle: ExportBundle, activate: (id: string) => void, activeMapId?: string) {
  const nodes: Node<LearningNodeData>[] = []
  const edges: Edge[] = []
  const recommendation = recommendedNode(bundle, activeMapId)?.id
  const root = (bundle.maps ?? []).find(m => activeMapId ? m.id === activeMapId : !m.parentMapId)
  if (!root) return { nodes, edges }
  const visible = new Set([root.id])
  if (activeMapId) {
    let changed = true
    while (changed) {
      changed = false
      for (const map of bundle.maps ?? []) if (map.kind === 'adaptive' && map.parentMapId && visible.has(map.parentMapId) && !visible.has(map.id)) { visible.add(map.id); changed = true }
    }
  }
  const remaining = (bundle.maps ?? []).filter(m => m.id !== root.id && (!activeMapId || visible.has(m.id)))
  const maps = [root]
  // Parent maps are positioned before their children even when the API order differs.
  while (remaining.length) {
    const next = remaining.findIndex(m => maps.some(parent => parent.id === m.parentMapId))
    maps.push(...remaining.splice(next < 0 ? 0 : next, 1))
  }
  let bottom = 0
  let top = 120
  let branchIndex = 0
  const positioned = new Map<string, { x: number; y: number }>()
  for (const map of maps) {
    const layout = arrange(map)
    const anchorId = map.targetNodeId || map.parentNodeId || ''
    const anchor = positioned.get(anchorId)
    const offsetX = map === root ? 100 : (anchor?.x ?? 100) + COLUMN
    const above = map !== root && branchIndex++ % 2 === 1
    const offsetY = map === root ? 120 : above ? top - layout.height - 100 : bottom + 100
    for (const node of map.nodes) {
      const local = layout.positions.get(node.id)!
      const position = { x: offsetX + local.x, y: offsetY + local.y }
      positioned.set(node.id, position)
      nodes.push({ id: node.id, type: 'learningStop', position, width: WIDTH, height: HEIGHT,
        data: { node, stepNumber: layout.steps.get(node.id)!, mapTitle: map.title,
          adaptive: map.kind === 'adaptive', recommended: node.id === recommendation, activate } })
    }
    bottom = Math.max(bottom, offsetY + layout.height)
    top = Math.min(top, offsetY)
    for (const edge of map.edges) {
      const source = positioned.get(edge.source)
      const target = positioned.get(edge.target)
      if (!source || !target) continue
      const long = target.x - source.x > COLUMN + 1 || target.x <= source.x
      edges.push({ ...edge, type: 'learningRoute', sourceHandle: 'out', targetHandle: 'in',
        data: { isCompleted: map.nodes.find(n => n.id === edge.source)?.status === 'completed',
          isRemedial: map.kind === 'adaptive', isActive: edge.target === recommendation,
          optional: edge.kind === 'supports',
          // Skip-level routes use a clear lane above this map.
          gutterY: long ? offsetY - 52 - (layout.steps.get(edge.source) ?? 0) * 8 : undefined },
      })
    }
    if (anchor) {
      // Attach every entry, including disconnected components in older saved maps.
      const requiredTargets = new Set(map.edges.filter(edge => edge.kind === 'requires').map(edge => edge.target))
      const entries = map.nodes.filter(node => !requiredTargets.has(node.id))
      for (const first of entries) edges.push({ id: `branch-${map.id}-${first.id}`, source: anchorId, target: first.id,
        sourceHandle: 'out', targetHandle: 'in', type: 'learningRoute',
        data: { isRemedial: true, branch: true, gutterX: anchor.x + WIDTH + 65 } })
    }
  }
  // Route only after every map has been placed: later branches are obstacles too.
  const route = createRouter(nodes.map(n => ({ ...n.position, width: WIDTH, height: HEIGHT })))
  for (const edge of edges) {
    const source = positioned.get(edge.source)!, target = positioned.get(edge.target)!
    const start: Point = [source.x + 136, source.y + 32], end: Point = [target.x + 84, target.y + 32]
    const data = edge.data as { gutterX?: number; gutterY?: number; points?: Point[] }
    const exit = start[0] + 104, entry = end[0] - 104
    const preferred: Point[] = data.gutterX !== undefined
      ? [start, [exit, start[1]], [data.gutterX, start[1]], [data.gutterX, end[1]], [entry, end[1]], end]
      : data.gutterY !== undefined
        ? [start, [exit, start[1]], [exit, data.gutterY], [entry, data.gutterY], [entry, end[1]], end]
        : [start, [exit, start[1]], [entry, end[1]], end]
    data.points = route(start, end, preferred)
  }
  return { nodes, edges }
}
