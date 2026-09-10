import React, {useMemo, useState} from 'react'
import {createRoot} from 'react-dom/client'
import yaml from 'js-yaml'
import './style.css'

const source = `project:\n  goal: "GitHub PJを設計・実装・検証・公開まで進める"\nnodes:\n  goal: {type: goal, status: done, label: Goal, x: 80, y: 180}\n  decision: {type: decision, status: doing, label: Decision, x: 260, y: 180, demand: "公開方法を決めてください", options: [Pages, Vercel, Cloudflare]}\n  phase: {type: phase, status: todo, label: Phase, x: 440, y: 180}\n  task: {type: task, status: todo, label: Task, x: 620, y: 180}\n  gate: {type: gate, status: waiting, label: Gate, x: 800, y: 180}\nedges:\n  - [goal, decision, demand]\n  - [decision, phase, answer]\n  - [phase, task, demand]\n  - [task, gate, result]\n`

function App(){
  const spec = useMemo(() => yaml.load(source), [])
  const [selected, setSelected] = useState('decision')
  const nodes = Object.entries(spec.nodes)
  const stats = {
    total: nodes.length,
    done: nodes.filter(([,n])=>n.status==='done').length,
    blocked: nodes.filter(([,n])=>n.status==='blocked').length,
    decisions: nodes.filter(([,n])=>n.type==='decision' && n.status!=='done').length
  }
  const progress = Math.round(stats.done / stats.total * 100)
  return <main>
    <header><div><b>DevSteps</b><span> Block Exchange POC</span></div><div className="stats">{progress}% · blocked {stats.blocked} · decisions {stats.decisions}</div></header>
    <section className="graph">
      <svg viewBox="0 0 980 380">
        <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z"/></marker></defs>
        {spec.edges.map(([a,b,message])=>{const A=spec.nodes[a],B=spec.nodes[b];return <g key={a+b}><line x1={A.x+120} y1={A.y+30} x2={B.x} y2={B.y+30} markerEnd="url(#arrow)"/><text x={(A.x+B.x)/2+40} y={A.y+20}>{message}</text></g>})}
        {nodes.map(([id,n])=><g key={id} className={`node ${n.status} ${selected===id?'selected':''}`} onClick={()=>setSelected(id)}>
          <rect x={n.x} y={n.y} width="120" height="60" rx="8"/><text x={n.x+12} y={n.y+25}>{n.label}</text><text x={n.x+12} y={n.y+46} className="status">● {n.status}</text>
        </g>)}
      </svg>
    </section>
    <aside><small>BLOCK</small><h2>{selected}</h2><pre>{JSON.stringify(spec.nodes[selected], null, 2)}</pre>{spec.nodes[selected]?.demand && <><small>DEMAND</small><p>{spec.nodes[selected].demand}</p><div className="options">{spec.nodes[selected].options.map((o,i)=><button key={o}>{i+1}. {o}</button>)}</div></>}</aside>
  </main>
}
createRoot(document.getElementById('root')).render(<App />)
