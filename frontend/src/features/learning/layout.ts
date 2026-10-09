import type { Edge, Node } from '@xyflow/react'
import type { ExportBundle, MapView, NodeView } from '@/api/types'

export type LearningNodeData = { node: NodeView; stepNumber: number; mapTitle: string; adaptive: boolean; recommended: boolean; activate: (id: string) => void }

export function recommendedNode(bundle: ExportBundle): NodeView | undefined {
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
  return all.find(n => !activeTargets.has(n.id) && n.status === 'in_progress')
    || all.find(n => !activeTargets.has(n.id) && n.status === 'available')
    || all.find(n => !activeTargets.has(n.id) && n.status === 'needs_review')
}

// Deterministic layered DAG layout. Progress and additional maps never move the root.
const COLUMN = 350
const ROW = 156
const WIDTH = 270
const HEIGHT = 80

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
  const positions = new Map<string, { x: number; y: number }>()
  const steps = new Map<string, number>()
  let step = 0
  for (const [rank, row] of rankedRows) {
    row.forEach((id, i) => {
      positions.set(id, { x: (i + Math.floor((columns - row.length) / 2)) * COLUMN, y: rank * ROW })
      steps.set(id, ++step)
    })
  }
  return { positions, steps, ranks, width: (columns - 1) * COLUMN + WIDTH }
}

export function layoutMaps(bundle: ExportBundle, activate: (id: string) => void) {
  const nodes: Node<LearningNodeData>[] = []
  const edges: Edge[] = []
  const recommendation = recommendedNode(bundle)?.id
  const root = (bundle.maps ?? []).find(m => !m.parentMapId)
  if (!root) return { nodes, edges }
  const remaining = (bundle.maps ?? []).filter(m => m.id !== root.id)
  const maps = [root]
  // Parent maps are positioned before their children even when the API order differs.
  while (remaining.length) {
    const next = remaining.findIndex(m => maps.some(parent => parent.id === m.parentMapId))
    maps.push(...remaining.splice(next < 0 ? 0 : next, 1))
  }
  let nextBranchX = 0
  let rootRight = 0
  const positioned = new Map<string, { x: number; y: number }>()
  for (const map of maps) {
    const layout = arrange(map)
    const anchorId = map.targetNodeId || map.parentNodeId || ''
    const anchor = positioned.get(anchorId)
    const offsetX = map === root ? 100 : Math.max(rootRight + 180, nextBranchX)
    const offsetY = map === root ? 120 : (anchor?.y ?? 120) + ROW
    for (const node of map.nodes) {
      const local = layout.positions.get(node.id)!
      const position = { x: offsetX + local.x, y: offsetY + local.y }
      positioned.set(node.id, position)
      nodes.push({ id: node.id, type: 'learningStop', position, width: WIDTH, height: HEIGHT,
        data: { node, stepNumber: layout.steps.get(node.id)!, mapTitle: map.title,
          adaptive: map.kind === 'adaptive', recommended: node.id === recommendation, activate } })
    }
    if (map === root) rootRight = offsetX + layout.width
    else nextBranchX = offsetX + layout.width + 180
    for (const edge of map.edges) {
      const source = positioned.get(edge.source)
      const target = positioned.get(edge.target)
      if (!source || !target) continue
      const long = target.y - source.y > ROW + 1 || target.y <= source.y
      edges.push({ ...edge, type: 'learningRoute', sourceHandle: 'out', targetHandle: 'in',
        data: { isCompleted: map.nodes.find(n => n.id === edge.source)?.status === 'completed',
          isRemedial: map.kind === 'adaptive', isActive: edge.target === recommendation,
          optional: edge.kind === 'supports',
          // Long routes travel in the gap beside labels, never through nodes.
          gutterX: long ? source.x + WIDTH + 28 : undefined },
      })
    }
    if (anchor) {
      // Attach every entry, including disconnected components in older saved maps.
      const requiredTargets = new Set(map.edges.filter(edge => edge.kind === 'requires').map(edge => edge.target))
      const entries = map.nodes.filter(node => !requiredTargets.has(node.id))
      for (const first of entries) edges.push({ id: `branch-${map.id}-${first.id}`, source: anchorId, target: first.id,
        sourceHandle: 'out', targetHandle: 'in', type: 'learningRoute',
        data: { isRemedial: true, branch: true, gutterX: offsetX - 65 } })
    }
  }
  return { nodes, edges }
}
