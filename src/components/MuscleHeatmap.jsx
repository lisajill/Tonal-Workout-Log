import { useState } from 'react'
import ReadinessLegend from './ReadinessLegend.jsx'

const MUSCLES = ['glutes', 'hamstrings', 'quads', 'calves', 'abs', 'obliques', 'back', 'chest', 'shoulders', 'biceps', 'triceps']

const MUSCLE_LABELS = {
  glutes: 'Glutes', hamstrings: 'Hamstrings', quads: 'Quads', calves: 'Calves',
  abs: 'Abs', obliques: 'Obliques', back: 'Back', chest: 'Chest',
  shoulders: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps',
}

function emoji(val) {
  if (val == null) return { icon: '—', bg: 'bg-surface-2', text: 'text-zinc-600', tip: 'No data' }
  if (val <= 25)  return { icon: '💀', bg: 'bg-red-950/60',    text: 'text-red-300',    tip: `${val}% — Cooked` }
  if (val <= 50)  return { icon: '🥵', bg: 'bg-orange-950/60', text: 'text-orange-300', tip: `${val}% — Fatigued` }
  if (val <= 75)  return { icon: '🌤', bg: 'bg-yellow-950/60', text: 'text-yellow-300', tip: `${val}% — Recovering` }
  if (val <= 90)  return { icon: '🌿', bg: 'bg-green-950/60',  text: 'text-green-300',  tip: `${val}% — Ready` }
  return          { icon: '✨', bg: 'bg-emerald-950/60', text: 'text-emerald-300', tip: `${val}% — Fresh` }
}

export default function MuscleHeatmap({ sessions }) {
  const [selectedIdx, setSelectedIdx] = useState(sessions.length - 1)
  const session = sessions[selectedIdx]

  return (
    <div className="space-y-5">
      <h1 className="font-semibold text-3xl" style={{ color: '#fb923c' }}>Readiness</h1>
      {/* Session picker */}
      <select
        value={selectedIdx}
        onChange={e => setSelectedIdx(Number(e.target.value))}
        className="rounded-lg bg-surface-2 border border-surface-3 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-accent w-full sm:w-auto"
      >
        {sessions.map((s, i) => (
          <option key={i} value={i}>
            {s.date}{sessions.filter(x => x.date === s.date).length > 1 ? ` · ${s.workout}` : ''}
          </option>
        ))}
      </select>

      <div className="card">
        <p className="text-zinc-300 font-medium mb-1">{session.workout}</p>
        <p className="text-zinc-500 text-xs mb-5">{session.date}</p>

        <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-2 items-center text-sm">
          {/* Header row */}
          <div />
          <div className="label text-center pb-1">Pre-session</div>
          <div className="label text-center pb-1">Post-session</div>

          {MUSCLES.map(m => {
            const pre  = emoji(session.pre_readiness?.[m])
            const post = emoji(session.post_readiness?.[m])
            return (
              <>
                <div key={`${m}-label`} className="text-zinc-400 text-xs font-medium pr-2 whitespace-nowrap">
                  {MUSCLE_LABELS[m]}
                </div>
                <Cell key={`${m}-pre`}  {...pre} />
                <Cell key={`${m}-post`} {...post} />
              </>
            )
          })}
        </div>

        <ReadinessLegend />
      </div>
    </div>
  )
}

function Cell({ icon, bg, text, tip }) {
  return (
    <div className="relative group/cell">
      <div className={`${bg} rounded-lg flex flex-col items-center justify-center py-2 gap-0.5 cursor-default`}>
        <span className="text-lg leading-none">{icon === '—' ? '' : icon}</span>
        <span className={`text-[10px] font-medium ${text}`}>
          {tip === 'No data' ? '—' : tip.split(' — ')[0]}
        </span>
      </div>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 whitespace-nowrap rounded-md bg-surface-3 border border-surface-3 px-2 py-1 text-xs text-zinc-200 shadow-lg opacity-0 group-hover/cell:opacity-100 transition-opacity">
        {tip}
      </span>
    </div>
  )
}
