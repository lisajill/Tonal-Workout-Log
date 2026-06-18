import { useState } from 'react'
import ReadinessLegend from './ReadinessLegend.jsx'

const CAT_STRENGTH = '#a78bfa'

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

// Local-parts parse — never new Date('YYYY-MM-DD') (UTC shift)
function dayName(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' })
}

function longDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
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

  // Build previous-best map from sessions that came before this one
  const chronological = [...sessions].sort((a, b) => (a.timestamp ?? a.date).localeCompare(b.timestamp ?? b.date))
  const currentIdx = chronological.findIndex(s => sessionKey(s) === selected)
  const prevBests = {}
  for (const s of chronological.slice(0, currentIdx)) {
    for (const [key, pr] of Object.entries(s.prs ?? {})) {
      if (pr.weight != null && (prevBests[key] == null || pr.weight > prevBests[key])) {
        prevBests[key] = pr.weight
      }
    }
  }

  const dateCounts = sorted.reduce((acc, s) => { acc[s.date] = (acc[s.date] ?? 0) + 1; return acc }, {})
  const idx = sorted.findIndex(s => sessionKey(s) === selected)
  const newer = idx > 0 ? sorted[idx - 1] : null
  const older = idx < sorted.length - 1 ? sorted[idx + 1] : null

  return (
    <div className="space-y-5">
      {/* Session picker + prev/next */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => older && selectSession(sessionKey(older))}
          disabled={!older}
          className="rounded-lg border border-surface-3 bg-surface-1 px-2.5 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Older session"
        >←</button>
        <select
          value={selected}
          onChange={e => selectSession(e.target.value)}
          className="rounded-lg bg-surface-1 border border-surface-3 text-zinc-200 text-sm px-3 py-2 focus:outline-none focus:border-accent w-full sm:w-auto"
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
        <button
          onClick={() => newer && selectSession(sessionKey(newer))}
          disabled={!newer}
          className="rounded-lg border border-surface-3 bg-surface-1 px-2.5 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Newer session"
        >→</button>
      </div>

      {/* Day header — reference's "Monday / Feb 12" block (design.md) */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 px-5 py-4 border-b border-surface-3">
          <div>
            <h2 className="font-semibold text-3xl leading-tight" style={{ color: CAT_STRENGTH }}>
              {dayName(session.date)}
            </h2>
            <p className="text-sm text-zinc-400 mt-0.5">
              <span className="mono-stat text-zinc-500">{longDate(session.date)}</span>
              {' · '}{session.workout}
              {session.phase ? <span className="text-zinc-600"> · {session.phase} phase</span> : null}
            </p>
            {(session.muscles_high_volume?.length || session.muscles_low_volume?.length) ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {session.muscles_high_volume?.map(m => (
                  <span key={m} className="label !text-[9px] rounded-full bg-cat-strength/20 px-2 py-0.5 !text-cat-strength">
                    {m.replace(/_/g, ' ')}
                  </span>
                ))}
                {session.muscles_low_volume?.map(m => (
                  <span key={m} className="label !text-[9px] rounded-full bg-surface-2 px-2 py-0.5">
                    {m.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <RatingBadge value={session.subjective_rating} />
        </div>

        {/* Stat strip — hairline grid via gap-px over a surface-3 backdrop */}
        <div className="grid grid-cols-3 gap-px bg-surface-3/60 sm:grid-cols-9">
          <StripStat label="Duration"  value={session.duration} unit="min" />
          <StripStat label="Volume"    value={session.total_volume?.toLocaleString()} unit="lbs" emph />
          <StripStat label="Reps"      value={session.total_reps} />
          <StripStat label="TUT"       value={session.time_under_tension} unit="min" />
          <StripStat label="Avg HR"    value={session.avg_hr} unit="bpm" />
          <StripStat label="Max HR"    value={session.max_hr} unit="bpm" />
          <StripStat label="Calories"  value={session.calories} unit="kcal" />
          <StripStat label="Work"      value={session.total_work_kj} unit="kJ" />
          <StripStat label="Sweat"     value={SWEAT[session.sweat] ?? session.sweat} />
        </div>
      </div>

      {/* Notes */}
      {session.notes && (
        <div className="rounded-lg bg-amber-950/30 border border-amber-900/40 border-l-[3px] border-l-amber-400 px-4 py-3">
          <p className="label !text-[10px] !text-amber-400/80 mb-1">Notes</p>
          <p className="text-sm text-amber-200/90 leading-relaxed">{session.notes}</p>
        </div>
      )}

      {/* Movement grid — exercises as rows, sets as columns (the reference's core layout) */}
      {session.movements?.length > 0 && (
        <div className="card">
          <div className="section-header">
            <h3 className="label">Movements</h3>
            <p className="text-[11px] text-zinc-600 flex gap-3">
              <span><PRMark type="strength" /> strength PR</span>
              <span><PRMark type="power" /> power PR</span>
              <span><PRMark type="volume" /> volume PR</span>
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {session.movements.map((m, i) => <MovementBlock key={i} movement={m} />)}
          </div>
        </div>
      )}

      {(hasPre || hasPost) && (
        <div className="card">
          <div className="section-header"><h3 className="label">Muscle Readiness</h3></div>
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
          <div className="section-header">
            <h3 className="label">PRs This Session</h3>
            <span className="pr-badge">⬆ {sessionPRs.length} PR{sessionPRs.length > 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {sessionPRs.map(([key, pr]) => {
              const prev = prevBests[key]
              const pct = prev != null ? Math.round(((pr.weight - prev) / prev) * 100) : null
              return (
                <div key={key} className="flex items-center justify-between rounded-lg bg-surface-2 border-l-[3px] border-l-cat-pr px-3 py-2">
                  <span className="text-sm text-zinc-300">{formatMovement(key)}</span>
                  <div className="text-right">
                    <span className="mono-stat text-sm font-bold text-cat-pr">{pr.weight} lbs</span>
                    {prev != null
                      ? <p className="mono-stat text-xs text-zinc-500">{prev} → {pr.weight} ({pct > 0 ? '+' : ''}{pct}%)</p>
                      : <p className="text-xs text-zinc-600">first time</p>
                    }
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Body map */}
      {session.bodymap && (
        <div className="card">
          <div className="section-header"><h3 className="label">Body Map</h3></div>
          <div className="overflow-hidden rounded-lg" style={{ aspectRatio: '1206/1510', height: '14rem' }}>
            <img
              src={session.bodymap}
              alt={`Body map for ${session.date}`}
              className="h-full w-full object-contain object-top"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// One movement: SET 1…N columns with WT / REPS rows, per the reference grid
function MovementBlock({ movement: m }) {
  const hasWarmup = m.warmup_sets > 0
  return (
    <div className="rounded-lg border border-surface-3 bg-surface-0/40 px-4 py-3 overflow-x-auto">
      <div className="flex items-baseline justify-between gap-3 border-b border-surface-3 pb-2 mb-2">
        <p className="text-lg text-zinc-100 whitespace-nowrap">{m.name}</p>
        {(m.warmup_prs?.length > 0) && (
          <span className="flex gap-1 shrink-0">{m.warmup_prs.map(t => <PRMark key={t} type={t} warmup />)}</span>
        )}
      </div>
      <table className="w-full">
        <thead>
          <tr>
            <th className="w-12" />
            {hasWarmup && <th className="label !text-[9px] text-center px-1.5 pb-1.5 text-zinc-600">W{m.warmup_sets > 1 ? `×${m.warmup_sets}` : ''}</th>}
            {m.sets.map((_, j) => (
              <th key={j} className="label !text-[9px] text-center px-1.5 pb-1.5 whitespace-nowrap">Set {j + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="label !text-[9px] pr-2">WT</td>
            {hasWarmup && <td className="text-center text-xs text-zinc-600 px-1.5 py-1">—</td>}
            {m.sets.map((s, j) => (
              <td key={j} className={`text-center px-1.5 py-1 ${s.prs?.length ? 'bg-cat-pr/15 rounded' : ''}`}>
                <span className={`mono-stat text-sm font-semibold ${s.prs?.length ? 'text-cat-pr' : 'text-zinc-100'}`}>
                  {s.weight_lbs ?? '—'}
                </span>
                {s.prs?.length > 0 && (
                  <span className="ml-1 inline-flex gap-0.5 align-middle">
                    {s.prs.map(t => <PRMark key={t} type={t} />)}
                  </span>
                )}
              </td>
            ))}
          </tr>
          <tr>
            <td className="label !text-[9px] pr-2">{m.sets.some(s => s.duration_sec != null) ? 'TIME' : 'REPS'}</td>
            {hasWarmup && <td className="text-center text-xs text-zinc-600 px-1.5 py-1">·</td>}
            {m.sets.map((s, j) => (
              <td key={j} className="text-center px-1.5 py-1">
                <span className="mono-stat text-xs text-zinc-400">
                  {s.duration_sec != null ? `${s.duration_sec}s` : s.reps || '—'}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function PRMark({ type, warmup }) {
  const styles = {
    strength: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
    power:    'bg-yellow-950/60 text-yellow-400 border-yellow-800/40',
    volume:   'bg-sky-950/60 text-sky-400 border-sky-800/40',
  }
  const letter = type === 'strength' ? 'S' : type === 'power' ? 'P' : 'V'
  return (
    <span className={`rounded border px-1 py-px text-[9px] font-bold uppercase tracking-wide ${styles[type] ?? styles.strength}`}>
      {warmup ? `W·${letter}` : letter}
    </span>
  )
}

function ReadinessCell({ val, icon, color, bg }) {
  return (
    <div className={`${bg} rounded-lg flex items-center justify-center gap-1.5 py-1.5 px-2`}>
      <span className="text-base leading-none">{icon !== '—' ? icon : ''}</span>
      <span className={`mono-stat text-xs font-medium ${color}`}>
        {val != null ? `${val}%` : '—'}
      </span>
    </div>
  )
}

function StripStat({ label, value, unit, emph }) {
  return (
    <div className="bg-surface-1 px-3 py-2.5 text-center">
      <p className="label !text-[9px]">{label}</p>
      <p className={`mono-stat mt-0.5 text-sm font-semibold ${emph ? 'text-accent-hover' : 'text-zinc-100'}`}>
        {value ?? '—'}
        {unit && value != null && <span className="ml-0.5 text-[9px] font-medium text-zinc-500">{unit}</span>}
      </p>
    </div>
  )
}

function RatingBadge({ value }) {
  const color = value >= 4.5 ? 'text-emerald-400' : value >= 3.5 ? 'text-accent-hover' : 'text-yellow-400'
  return (
    <div className="text-right shrink-0">
      <p className="label !text-[9px] mb-0.5">Session Rating</p>
      <p className={`text-4xl ${color}`}>{value}</p>
      <p className="text-xs text-zinc-500">out of 5</p>
    </div>
  )
}

function formatMovement(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
