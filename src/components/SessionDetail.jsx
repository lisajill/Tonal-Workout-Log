import { useState } from 'react'
import ReadinessLegend from './ReadinessLegend.jsx'

const MUSCLE_LABELS = {
  glutes: 'Glutes', hamstrings: 'Hamstrings', quads: 'Quads', calves: 'Calves',
  abs: 'Abs', obliques: 'Obliques', back: 'Back', chest: 'Chest',
  shoulders: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps',
}

const SWEAT = { dry: 'Dry', untracked: '—', light: 'Light', moderate: 'Moderate', heavy: 'Heavy', null: '—' }

function readinessEmoji(val) {
  if (val == null) return { icon: '—', color: 'text-zinc-600', bg: 'bg-surface-2' }
  if (val <= 25)  return { icon: '💀', color: 'text-red-400',     bg: 'bg-red-950/40' }
  if (val <= 50)  return { icon: '🥵', color: 'text-orange-400',  bg: 'bg-orange-950/40' }
  if (val <= 75)  return { icon: '🌤', color: 'text-yellow-400',  bg: 'bg-yellow-950/40' }
  if (val <= 90)  return { icon: '🌿', color: 'text-green-400',   bg: 'bg-green-950/40' }
  return          { icon: '✨', color: 'text-emerald-400', bg: 'bg-emerald-950/40' }
}

function sessionKey(s) {
  return s.tonal_activity_id ?? `${s.date}::${s.workout}`
}

export default function SessionDetail({ sessions, initialKey: initialKeyProp }) {
  const sorted = [...sessions].sort((a, b) => (b.timestamp ?? b.date).localeCompare(a.timestamp ?? a.date))
  const initialKey = initialKeyProp && sorted.some(s => sessionKey(s) === initialKeyProp)
    ? initialKeyProp
    : sessionKey(sorted[0])
  const [selected, setSelected] = useState(initialKey)

  function selectSession(key) {
    setSelected(key)
    window.location.hash = `sessions:${key}`
  }
  const session = sorted.find(s => sessionKey(s) === selected)

  if (!session) return <div className="card text-zinc-500 text-sm">No sessions.</div>

  const muscles = Object.keys(MUSCLE_LABELS)
  const hasPre  = muscles.some(m => session.pre_readiness?.[m] != null)
  const hasPost = muscles.some(m => session.post_readiness?.[m] != null)

  const sessionPRs = Object.entries(session.prs ?? {})
    .filter(([, pr]) => pr.weight != null)

  const dateCounts = sorted.reduce((acc, s) => { acc[s.date] = (acc[s.date] ?? 0) + 1; return acc }, {})

  return (
    <div className="space-y-5">
      {/* Session picker */}
      <select
        value={selected}
        onChange={e => selectSession(e.target.value)}
        className="rounded-lg bg-surface-2 border border-surface-3 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-accent w-full sm:w-auto"
      >
        {sorted.map(s => {
          const key = sessionKey(s)
          const showName = dateCounts[s.date] > 1
          return (
            <option key={key} value={key}>
              {s.date}{showName ? ` · ${s.workout.split('—')[1]?.trim() ?? s.workout}` : ''}
            </option>
          )
        })}
      </select>

      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">{session.workout}</h2>
            <p className="text-zinc-500 text-sm mt-0.5">{session.date} · {session.phase} phase</p>
          </div>
          <RatingBadge value={session.subjective_rating} />
        </div>

        {/* Key stats */}
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          <MiniStat label="Duration"  value={`${session.duration}m`} />
          <MiniStat label="Volume"    value={`${session.total_volume?.toLocaleString() ?? '—'} lbs`} />
          <MiniStat label="Reps"      value={session.total_reps ?? '—'} />
          <MiniStat label="TUT"       value={session.time_under_tension ? `${session.time_under_tension}m` : '—'} />
          <MiniStat label="Avg HR"    value={session.avg_hr ? `${session.avg_hr} bpm` : '—'} />
          <MiniStat label="Max HR"    value={session.max_hr ? `${session.max_hr} bpm` : '—'} />
          <MiniStat label="Calories"  value={session.calories ? `${session.calories} kcal` : '—'} />
          <MiniStat label="Work"      value={session.total_work_kj ? `${session.total_work_kj} kJ` : '—'} />
          <MiniStat label="Sweat"     value={SWEAT[session.sweat] ?? session.sweat ?? '—'} />
        </div>

        {/* Notes */}
        {session.notes && (
          <div className="mt-4 rounded-lg bg-amber-950/30 border border-amber-900/40 px-3 py-2.5">
            <p className="text-xs font-medium text-amber-400/80 mb-0.5">Notes</p>
            <p className="text-sm text-amber-300/90">{session.notes}</p>
          </div>
        )}

        {/* Body map */}
        {session.bodymap && (
          <div className="mt-4 flex items-center gap-3">
            <p className="label shrink-0">Body Map</p>
            <div className="overflow-hidden rounded-lg" style={{ aspectRatio: '1206/1510', height: '10rem' }}>
              <img
                src={session.bodymap}
                alt={`Body map for ${session.date}`}
                className="h-full w-full object-contain object-top"
              />
            </div>
          </div>
        )}
      </div>

      {(hasPre || hasPost) && (
        <div className="card">
          <h3 className="label mb-3">Muscle Readiness</h3>
          <div className={`grid gap-x-3 gap-y-2 text-xs items-center ${hasPre && hasPost ? 'grid-cols-[auto_1fr_1fr]' : 'grid-cols-[auto_1fr]'}`}>
            <div />
            {hasPre  && <div className="label text-center pb-1">Pre</div>}
            {hasPost && <div className="label text-center pb-1">Post</div>}
            {muscles.map(m => {
              const pre  = readinessEmoji(session.pre_readiness?.[m])
              const post = readinessEmoji(session.post_readiness?.[m])
              const hasValue = session.pre_readiness?.[m] != null || session.post_readiness?.[m] != null
              if (!hasValue) return null
              return (
                <>
                  <div key={`${m}-lbl`} className="text-zinc-400 font-medium pr-2 whitespace-nowrap">{MUSCLE_LABELS[m]}</div>
                  {hasPre  && <ReadinessCell key={`${m}-pre`}  val={session.pre_readiness?.[m]}  {...pre} />}
                  {hasPost && <ReadinessCell key={`${m}-post`} val={session.post_readiness?.[m]} {...post} />}
                </>
              )
            })}
          </div>
          <ReadinessLegend />
        </div>
      )}

      {/* PRs this session */}
      {sessionPRs.length > 0 && (
        <div className="card">
          <h3 className="label mb-3">PRs This Session</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sessionPRs.map(([key, pr]) => (
              <div key={key} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                <span className="text-sm text-zinc-300">{formatMovement(key)}</span>
                <span className="text-sm font-bold text-accent tabular-nums">{pr.weight} lbs</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Muscle targets */}
      {(session.muscles_high_volume?.length || session.muscles_low_volume?.length) ? (
        <div className="card">
          <h3 className="label mb-3">Muscles Targeted</h3>
          <div className="flex flex-wrap gap-2">
            {session.muscles_high_volume?.map(m => (
              <span key={m} className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent capitalize">
                {m.replace(/_/g, ' ')} · high
              </span>
            ))}
            {session.muscles_low_volume?.map(m => (
              <span key={m} className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-zinc-400 capitalize">
                {m.replace(/_/g, ' ')} · low
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Movements performed */}
      {session.movements?.length > 0 && (
        <details className="card group">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <h3 className="label">Movements</h3>
            <span className="text-zinc-600 group-open:rotate-180 transition-transform">▾</span>
          </summary>
          <div className="mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-3">
                  <th className="label pb-2 text-left pr-4">Movement</th>
                  <th className="label pb-2 text-right pr-6">Reps</th>
                  <th className="label pb-2 text-left">Sets</th>
                </tr>
              </thead>
              <tbody>
                {session.movements.map((m, i) => (
                  <tr key={i} className="border-b border-surface-3/30 align-top">
                    <td className="py-2 pr-4 text-zinc-300 whitespace-nowrap">{m.name}</td>
                    <td className="py-2 pr-6 text-zinc-500 tabular-nums text-right whitespace-nowrap">
                      {m.warmup_sets > 0 && <span className="block text-zinc-600">{m.warmup_sets}W</span>}
                      <span>{m.sets.length}×{m.sets[0]?.duration_sec != null ? `${m.sets[0].duration_sec}s` : (m.sets[0]?.reps || '—')}</span>
                    </td>
                    <td className="py-2">
                      {m.warmup_sets > 0 && (
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-zinc-600 tabular-nums text-xs">W</span>
                          {m.warmup_prs?.includes('power') && <PRBadge type="power" />}
                        </div>
                      )}
                      {m.sets.map((s, j) => (
                        <div key={j} className="flex items-center gap-1 mb-0.5">
                          <span className="text-zinc-400 tabular-nums text-xs">{s.weight_lbs} lbs</span>
                          {s.prs?.includes('strength') && <PRBadge type="strength" />}
                          {s.prs?.includes('power') && <PRBadge type="power" />}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[11px] text-zinc-600 flex gap-3">
              <span><PRBadge type="strength" /> Strength PR (1RM)</span>
              <span><PRBadge type="power" /> Power PR</span>
            </p>
          </div>
        </details>
      )}
    </div>
  )
}

function ReadinessCell({ val, icon, color, bg }) {
  return (
    <div className={`${bg} rounded-lg flex items-center justify-center gap-1.5 py-1.5 px-2`}>
      <span className="text-base leading-none">{icon !== '—' ? icon : ''}</span>
      <span className={`text-xs font-medium tabular-nums ${color}`}>
        {val != null ? `${val}%` : '—'}
      </span>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2 text-center">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-100 tabular-nums">{value}</p>
    </div>
  )
}

function RatingBadge({ value }) {
  const color = value >= 4.5 ? 'text-emerald-400' : value >= 3.5 ? 'text-accent' : 'text-yellow-400'
  return (
    <div className="text-right shrink-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mb-0.5">Session Rating</p>
      <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-xs text-zinc-500">out of 5</p>
    </div>
  )
}

function PRBadge({ type }) {
  return type === 'strength'
    ? <span className="rounded px-1 py-px text-[9px] font-bold uppercase tracking-wide bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">S</span>
    : <span className="rounded px-1 py-px text-[9px] font-bold uppercase tracking-wide bg-yellow-950/60 text-yellow-400 border border-yellow-800/40">P</span>
}

function formatMovement(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
