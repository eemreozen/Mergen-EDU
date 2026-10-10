import { Position, type Edge, type Node } from '@xyflow/react'
import { createRouter, crossesBox, routeCrossings, type Point } from './routing.ts'
import type { ExportBundle, MapView, NodeView } from '@/api/types'

export type LearningNodeData = { node: NodeView; stepNumber: number; mapTitle: string; adaptive: boolean; recommended: boolean; activate: (id: string) => void; celebrated?: boolean }

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
  const ordered = (map: MapView) => learningSequence([map])
  const all = learningSequence(bundle.maps ?? [])
  const branches = (bundle.maps ?? []).filter(m => m.kind === 'adaptive')
    .sort((a,b) => all.findIndex(n => n.id === a.targetNodeId) - all.findIndex(n => n.id === b.targetNodeId))
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

// Stable topological learning order, independent of visual lane compaction.
// Insert each remediation immediately after its anchor, including nested maps.
export function learningSequence(maps: MapView[]): NodeView[] {
  const result: NodeView[] = [], visited = new Set<string>()
  const visit = (map: MapView) => {
    if (visited.has(map.id)) return
    visited.add(map.id)
    const remaining = new Set(map.nodes.map(n => n.id))
    while (remaining.size) {
      const node = map.nodes.find(n => remaining.has(n.id) && !map.edges.some(e =>
        e.kind === 'requires' && e.target === n.id && remaining.has(e.source)))
        || map.nodes.find(n => remaining.has(n.id))!
      remaining.delete(node.id)
      result.push(node)
      for (const child of maps.filter(m => m.parentMapId === map.id && (m.targetNodeId || m.parentNodeId) === node.id)) visit(child)
    }
  }
  for (const map of maps.filter(m => !maps.some(parent => parent.id === m.parentMapId))) visit(map)
  for (const map of maps) visit(map)
  return result
}

// Keep supports that join otherwise separate required-work components visible.
// Hiding optional detail must never leave an entire workstream floating.
export function visibleEdges(edges: Edge[], showSupports: boolean) {
  const parent = new Map<string,string>()
  const find = (id: string): string => {
    const next = parent.get(id)
    if (!next) { parent.set(id,id); return id }
    if (next === id) return id
    const root = find(next); parent.set(id,root); return root
  }
  const join = (edge: Edge) => { const a=find(edge.source), b=find(edge.target); parent.set(a,b); return a !== b }
  for (const edge of edges.filter(e => !e.data?.optional)) join(edge)
  const bridges = new Set(edges.filter(e => e.data?.optional && join(e)).map(e => e.id))
  return edges.filter(e => showSupports || !e.data?.optional || bridges.has(e.id))
    .map(e => bridges.has(e.id) ? {...e,data:{...e.data,connectivity:true}} : e)
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
  for (const edge of [...map.edges].sort((a,b) => Number(a.kind !== 'requires')-Number(b.kind !== 'requires'))) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) continue
    if (edge.kind === 'supports') {
      const seen = new Set<string>(), queue = [edge.target]
      while (queue.length) {
        const id = queue.pop()!
        if (seen.has(id)) continue
        seen.add(id); queue.push(...outgoing.get(id)!)
      }
      if (seen.has(edge.source)) continue // optional links may legally point backward
    }
    if (outgoing.get(edge.source)!.includes(edge.target)) continue
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
  const ranks = new Map(earliest)
  // Compact only independent prerequisite chains toward their first merge.
  // Moving an internal fork forward creates artificial skip-level connections.
  for (const root of order.filter(id => !incoming.get(id)!.length)) {
    const chain = [root]
    let current = root
    while (outgoing.get(current)!.length === 1) {
      const next = outgoing.get(current)![0]
      if (incoming.get(next)!.length !== 1) {
        const shift = earliest.get(next)! - earliest.get(current)! - 1
        if (shift > 0) for (const id of chain) ranks.set(id, earliest.get(id)! + shift)
        break
      }
      if (chain.includes(next)) break
      chain.push(next); current = next
    }
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
  let branchIndex = 0
  const steps = new Map(learningSequence(maps).map((node,i) => [node.id,i+1]))
  const positioned = new Map<string, { x: number; y: number }>()
  for (const map of maps) {
    const layout = arrange(map)
    const anchorId = map.targetNodeId || map.parentNodeId || ''
    const anchor = positioned.get(anchorId)
    const offsetX = map === root ? 100 : (anchor?.x ?? 100) + COLUMN
    let offsetY = 120
    if (map !== root) {
      const preferAbove = branchIndex++ % 2 === 1
      const localPoints = [...layout.positions.values()]
      const left = offsetX - 28
      const right = offsetX + Math.max(...localPoints.map(p => p.x)) + WIDTH + 28
      // Only nearby columns determine the branch lane. A distant tall fork
      // must not push this branch hundreds of pixels away from its anchor.
      const neighbors = nodes.filter(n => n.position.x + WIDTH > left && n.position.x < right)
      const low = Math.max(anchor?.y ?? 120, ...neighbors.map(n => n.position.y + HEIGHT))
      const high = Math.min(anchor?.y ?? 120, ...neighbors.map(n => n.position.y))
      const localTop = Math.min(...localPoints.map(p => p.y))
      const candidates = [
        { above: false, y: low + 72 - localTop },
        { above: true, y: high - 72 - layout.height },
      ]
      const occupied = edges.filter(e => !e.data?.branch).map(e => e.data!.points as Point[])
      // Reserve existing routes as well as node bounds. Later branches must
      // not force an already visible main connection to reroute or disappear.
      for (const candidate of candidates) {
        while (localPoints.some(p => occupied.some(points => points.some((point,i) => i > 0 &&
          crossesBox(points[i-1],point,{x:offsetX+p.x,y:candidate.y+p.y,width:WIDTH,height:HEIGHT},28))))) {
          candidate.y += candidate.above ? -ROW : ROW
        }
      }
      const first = localPoints[0]
      const score = (candidate: typeof candidates[number]) => {
        if (!anchor || !first) return candidate.above === preferAbove ? 0 : 1
        const end: Point = [offsetX+first.x+84,candidate.y+first.y+32]
        const gutter = anchor.x + WIDTH + 28
        const connector: Point[] = [[anchor.x+136,anchor.y+32],[gutter,anchor.y+32],[gutter,end[1]],end]
        return routeCrossings(connector,occupied)*10000 + Math.abs(end[1]-anchor.y-32)
          + (candidate.above === preferAbove ? 0 : ROW * 2)
      }
      candidates.sort((a,b) => score(a)-score(b))
      offsetY = candidates[0].y
    }
    for (const node of map.nodes) {
      const local = layout.positions.get(node.id)!
      const position = { x: offsetX + local.x, y: offsetY + local.y }
      positioned.set(node.id, position)
      nodes.push({ id: node.id, type: 'learningStop', position, width: WIDTH, height: HEIGHT,
        // Controlled refreshes replace node objects without measured dimensions.
        // Explicit ports keep React Flow's handle bounds initialized on every
        // quiz/reward update, even when ResizeObserver has no size change to report.
        handles: [
          {id:'in',type:'target',position:Position.Left,x:84,y:32,width:0,height:0},
          {id:'out',type:'source',position:Position.Right,x:136,y:32,width:0,height:0},
        ],
        data: { node, stepNumber: steps.get(node.id)!, mapTitle: map.title,
          adaptive: map.kind === 'adaptive', recommended: node.id === recommendation, activate } })
    }
    for (const edge of map.edges) {
      // A -> C adds no visible information when A -> B -> C already exists.
      // Keep the saved dependencies intact; reduce only the rendered graph.
      if (edge.kind === 'requires') {
        const seen = new Set<string>([edge.source])
        const queue = [edge.source]
        while (queue.length) {
          const id = queue.shift()!
          for (const next of map.edges) {
            if (next === edge || next.kind !== 'requires' || next.source !== id || seen.has(next.target)) continue
            seen.add(next.target); queue.push(next.target)
          }
        }
        if (seen.has(edge.target)) continue
      }
      const source = positioned.get(edge.source)
      const target = positioned.get(edge.target)
      if (!source || !target) continue
      edges.push({ ...edge, type: 'learningRoute', sourceHandle: 'out', targetHandle: 'in',
        data: { isCompleted: map.nodes.find(n => n.id === edge.source)?.status === 'completed',
          isRemedial: map.kind === 'adaptive', isActive: edge.target === recommendation,
          optional: edge.kind === 'supports',
          // The router chooses the nearest free corridor for skip-level links.
        },
      })
    }
    // Freeze ordinary routes before placing descendants, whose lanes reserve
    // these paths. Routing the full root again after adding a branch was fragile.
    const mapRoute = createRouter(nodes.map(n => ({...n.position,width:WIDTH,height:HEIGHT})))
    for (const edge of edges.filter(e => map.edges.some(saved => saved.id === e.id))) {
      const source = positioned.get(edge.source)!, target = positioned.get(edge.target)!
      const start: Point = [source.x+136,source.y+32], end: Point = [target.x+84,target.y+32]
      edge.data!.points = mapRoute(start,end,[start,[start[0]+104,start[1]],[end[0]-104,end[1]],end])
    }
    if (anchor) {
      // Attach every entry, including disconnected components in older saved maps.
      const requiredTargets = new Set(map.edges.filter(edge => edge.kind === 'requires').map(edge => edge.target))
      const entries = map.nodes.filter(node => !requiredTargets.has(node.id))
      for (const first of entries) edges.push({ id: `branch-${map.id}-${first.id}`, source: anchorId, target: first.id,
        sourceHandle: 'out', targetHandle: 'in', type: 'learningRoute',
        data: { isRemedial: true, branch: true, gutterX: anchor.x + WIDTH + 28 } })
    }
  }
  // Route cross-map connectors after all branches have been placed.
  // Ordinary routes were reserved during placement and remain unchanged.
  const obstacles = nodes.map(n => ({ ...n.position, width: WIDTH, height: HEIGHT }))
  const occupied: Point[][] = []
  const route = createRouter(obstacles)
  const branchRoute = createRouter(obstacles, occupied)
  // Ordinary links establish the occupied corridors before branch connectors.
  for (const edge of [...edges].sort((a,b) => Number(!!a.data?.branch)-Number(!!b.data?.branch))) {
    const source = positioned.get(edge.source)!, target = positioned.get(edge.target)!
    const start: Point = [source.x + 136, source.y + 32], end: Point = [target.x + 84, target.y + 32]
    const data = edge.data as { gutterX?: number; gutterY?: number; points?: Point[] }
    const exit = start[0] + 104, entry = end[0] - 104
    const preferred: Point[] = data.gutterX !== undefined
      ? [start, [exit, start[1]], [data.gutterX, start[1]], [data.gutterX, end[1]], [entry, end[1]], end]
      : data.gutterY !== undefined
        ? [start, [exit, start[1]], [exit, data.gutterY], [entry, data.gutterY], [entry, end[1]], end]
        : [start, [exit, start[1]], [entry, end[1]], end]
    data.points ??= edge.data?.branch ? branchRoute(start, end, preferred) : route(start, end, preferred)
    occupied.push(data.points)
  }
  return { nodes, edges }
}
