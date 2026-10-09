import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { layoutMaps, recommendedNode } from '../src/features/learning/layout.ts'

const bundle = JSON.parse(readFileSync(new URL('../../backend/contracts/examples/roadmap.json', import.meta.url)))
const root = bundle.maps.find(map => !map.parentMapId)
assert.ok(root.nodes.length >= 12)
const original = structuredClone(bundle)
const target = recommendedNode(bundle)
assert.ok(target)
const before = layoutMaps(bundle, () => {})
target.status = 'needs_review'
const branch = { ...structuredClone(root), id: 'branch', kind: 'adaptive', parentMapId: root.id, targetNodeId: target.id,
  nodes: [{ ...structuredClone(target), id: 'gap-1', mapId: 'branch', status: 'available' },
    { ...structuredClone(target), id: 'gap-2', mapId: 'branch', status: 'locked' }],
  edges: [{ id: 'gap-edge', source: 'gap-1', target: 'gap-2', kind: 'requires' }] }
bundle.maps.push(branch)
const after = layoutMaps(bundle, () => {})
for (const node of before.nodes) assert.deepEqual(after.nodes.find(n => n.id === node.id).position, node.position)
assert.deepEqual(root.edges, original.maps.find(m => m.id === root.id).edges)
assert.equal(recommendedNode(bundle).id, 'gap-1')
assert.ok(after.nodes.find(n => n.id === 'gap-1').position.x > Math.max(...before.nodes.map(n => n.position.x)))
assert.ok(after.edges.some(edge => edge.source === target.id && edge.target === 'gap-1'))
// Previously saved remediation maps can contain a second, disconnected skill
// chain. Every entry must still have a visible connection to the main target.
branch.nodes.push({...structuredClone(branch.nodes[0]), id:'gap-3'})
const legacy = layoutMaps(bundle, () => {})
assert.ok(legacy.edges.some(edge => edge.source === target.id && edge.target === 'gap-3'))
assert.ok(legacy.edges.filter(edge => edge.data?.branch).every(edge => !edge.data.optional))
branch.nodes.pop()
branch.nodes[0].status = 'completed'; branch.nodes[1].status = 'available'
assert.equal(recommendedNode(bundle).id, 'gap-2')
branch.nodes[1].status = 'completed'
assert.equal(recommendedNode(bundle).id, target.id)
target.status = 'completed'
assert.notEqual(recommendedNode(bundle)?.id, target.id)
assert.deepEqual(layoutMaps({ ...bundle, maps: [] }, () => {}), {nodes: [], edges: []})

function checkGeometry(bundle) {
  const graph = layoutMaps(bundle, () => {})
  const positioned = new Map(graph.nodes.map(node => [node.id, node]))
  for (const map of bundle.maps) {
    for (const edge of map.edges.filter(edge => edge.kind === 'requires')) {
      assert.ok(positioned.get(edge.target).position.y > positioned.get(edge.source).position.y, 'Prerequisites must flow downward')
    }
  }
  for (const [i, a] of graph.nodes.entries()) for (const b of graph.nodes.slice(i + 1)) {
    assert.ok(Math.abs(a.position.x - b.position.x) >= 270 || Math.abs(a.position.y - b.position.y) >= 80, 'Node bounds must not overlap')
  }
  assert.ok(graph.edges.every(edge => edge.sourceHandle === 'out' && edge.targetHandle === 'in'))
}
checkGeometry(bundle)
// Multiple independent chains converge into one consumer; unrelated roots should
// be placed near that consumer instead of creating full-height crossing routes.
const converging = structuredClone(original)
const map = converging.maps.find(m => !m.parentMapId)
map.nodes = Array.from({length: 15}, (_, i) => ({...map.nodes[0], id: `n${i}`}))
const links = [[0,1],[1,2],[2,3],[3,4],[5,4],[4,6],[6,7],[8,9],[9,7],[10,7],[7,11],[12,11],[7,13],[13,14],[11,14]]
map.edges = links.map(([s,t],i) => ({id:`e${i}`,source:`n${s}`,target:`n${t}`,kind:'requires'}))
converging.maps = [map]
checkGeometry(converging)
const positions = new Map(layoutMaps(converging, () => {}).nodes.map(n => [n.id,n.position]))
assert.ok(positions.get('n10').y > positions.get('n0').y, 'A late prerequisite belongs near its consumer')
const activate = () => {}
assert.deepEqual(layoutMaps(converging, activate), layoutMaps(converging, activate))
if (process.argv[2]) checkGeometry(JSON.parse(readFileSync(process.argv[2])))
console.log('Learning layout: prerequisite order, convergence, non-overlap, stable root, separate branches — passed')

// Ordinary child maps have their own canvas; remediation remains attached locally.
const nested = structuredClone(original)
const main = nested.maps.find(m => !m.parentMapId)
const parent = main.nodes[0]
parent.childMapId = 'detail'
parent.status = 'in_progress'
const detail = { ...structuredClone(main), id: 'detail', kind: 'submap', parentMapId: main.id, parentNodeId: parent.id,
  nodes: [{...structuredClone(parent), id: 'detail-1', mapId: 'detail', childMapId: null, status: 'available'},
    {...structuredClone(parent), id: 'detail-2', mapId: 'detail', childMapId: null, status: 'locked'}],
  edges: [{id:'detail-edge', source:'detail-1', target:'detail-2', kind:'requires'}] }
nested.maps.push(detail)
assert.ok(!layoutMaps(nested, () => {}, main.id).nodes.some(n => n.id === 'detail-1'))
const detailGraph = layoutMaps(nested, () => {}, detail.id)
assert.deepEqual(detailGraph.nodes.map(n => n.id), ['detail-1', 'detail-2'])
assert.notEqual(detailGraph.nodes[0].position.x, detailGraph.nodes[1].position.x)
assert.notEqual(recommendedNode(nested)?.id, parent.id)
const remediation = {...structuredClone(detail), id:'local-gap', kind:'adaptive', parentMapId:detail.id, targetNodeId:'detail-1',
 nodes:[{...detail.nodes[0],id:'local-gap-1',mapId:'local-gap'}],edges:[]}
nested.maps.push(remediation)
const scoped = layoutMaps(nested, () => {}, detail.id)
assert.ok(scoped.edges.some(e => e.source === 'detail-1' && e.target === 'local-gap-1'))
assert.ok(!scoped.nodes.some(n => n.mapId === main.id))
console.log('Separate submaps, local remediation and non-linear chain placement — passed')

// One short fork used to disable every bend in a mostly sequential roadmap.
const turning = structuredClone(original)
const turningMap = turning.maps.find(m => !m.parentMapId)
turningMap.nodes = Array.from({length: 14}, (_, i) => ({...turningMap.nodes[0], id: `turn-${i}`}))
turningMap.edges = Array.from({length: 12}, (_, i) => ({id: `turn-edge-${i}`, source: `turn-${i}`, target: `turn-${i + 1}`, kind: 'requires'}))
turningMap.edges.push({id: 'turn-fork', source: 'turn-13', target: 'turn-3', kind: 'requires'})
turning.maps = [turningMap]
checkGeometry(turning)
const turningGraph = layoutMaps(turning, activate)
const chain = Array.from({length: 13}, (_, i) => turningGraph.nodes.find(n => n.id === `turn-${i}`).position)
const changes = chain.slice(1).map((position, i) => position.x - chain[i].x)
assert.ok(changes.some(dx => dx > 40) && changes.some(dx => dx < -40), 'A roadmap with a fork must still turn in both directions')
assert.ok(Math.max(...chain.map(p => p.x)) - Math.min(...chain.map(p => p.x)) >= 300, 'Turns must remain visible at normal zoom')
assert.deepEqual(turningMap.edges.length, 13, 'Visual turns must not add dependencies')
console.log('Mostly sequential maps with a short fork follow a visible winding route — passed')
