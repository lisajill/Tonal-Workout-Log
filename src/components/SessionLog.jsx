import { Fragment, useState } from 'react'

const SWEAT = { dry: 'Dry', untracked: '—', light: 'Light', moderate: 'Moderate', heavy: 'Heavy' }

// Left accent bar encodes session focus (design.md): lower=violet, upper=pink, full-body=indigo
const FOCUS_COLORS = { lower: '#a78bfa', upper: '#f472b6', full: '#818cf8', none: '#303036' }
const UPPER = new Set(['chest', 'back', 'shoulders', 'biceps', 'triceps'])
const LOWER = new Set(['glutes', 'hamstrings', 'quads', 'calves'])

function sessionFocus(s) {
  const muscles = [...(s.muscles_high_volume ?? []), ...(s.muscles_low_volume ?? [])]
  const hasUpper = muscles.some(m => UPPER.has(m))
  const hasLower = muscles.some(m => LOWER.has(m))
  if (hasUpper && hasLower) return 'full'
  if (hasUpper) return 'upper'
  if (hasLower) return 'lower'
  return 'none'
}

const COLS = [
  { key: 'date',             label: 'Date',     align: 'left' },
  { key: 'workout',          label: 'Workout',  align: 'left' },
  { key: 'duration',         label: 'Min',      align: 'right' },
  { key: 'total_volume',     label: 'Volume',   align: 'right' },
  { key: 'total_reps',       label: 'Reps',     align: 'right' },
  { key: 'subjective_rating',label: 'Rating',   align: 'center' },
  { key: 'sweat',            label: 'Sweat',    align: 'left' },
  { key: 'energy_level',     label: 'Energy',   align: 'right' },
  { key: 'avg_hr',           label: 'Avg HR',   align: 'right' },
]

function sessionKey(s) {
  return s.tonal_activity_id ?? `${s.date}::${s.workout}`
}

export default function SessionLog({ sessions, onSelectSession }) {
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [expanded, setExpanded] = useState(new Set())

  function handleSort(key) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function toggleExpand(key, e) {
    e.stopPropagation()
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const sorted = [...sessions].sort((a, b) => {
    let av = a[sortKey] ?? -Infinity
    let bv = b[sortKey] ?? -Infinity
    if (sortKey === 'date') {
      const at = a.timestamp ?? a.date
      const bt = b.timestamp ?? b.date
      return sortDir === 'asc' ? at.localeCompare(bt) : bt.localeCompare(at)
    }
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? av - bv : bv - av
  })

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="section-header !mb-0 border-b-0 px-5 pt-5 pb-3">
        <div>
          <h2 className="font-semibold text-2xl text-zinc-100">Session Log</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{sessions.length} Tonal sessions — click a row for detail, ▸ to preview movements</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-zinc-500">
          {[['Lower', FOCUS_COLORS.lower], ['Upper', FOCUS_COLORS.upper], ['Full body', FOCUS_COLORS.full]].map(([n, c]) => (
            <span key={n} className="flex items-center gap-1.5">
              <span className="h-2.5 w-1 rounded-full" style={{ backgroundColor: c }} />
              <span className="label !text-[9px]">{n}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-surface-2">
            <th className="w-8" />
            {COLS.map(({ key, label, align }) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className={`label py-2.5 pr-5 cursor-pointer select-none whitespace-nowrap hover:text-zinc-200 transition-colors text-${align}`}
              >
                {label}
                {sortKey === key && (
                  <span className="ml-1 text-accent-hover">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, idx) => {
            const key = sessionKey(s)
            const isOpen = expanded.has(key)
            const focus = sessionFocus(s)
            const prEntries = Object.entries(s.prs ?? {}).filter(([, pr]) => pr.weight != null)
            return (
              <Fragment key={key}>
                <tr
                  onClick={() => onSelectSession?.(key)}
                  className={`border-b border-surface-3/40 hover:bg-surface-2 transition-colors cursor-pointer group ${
                    idx % 2 === 1 ? 'bg-surface-0/40' : ''
                  }`}
                  style={{ boxShadow: `inset 3px 0 0 0 ${FOCUS_COLORS[focus]}` }}
                >
                  <td className="pl-2 py-3 align-top">
                    {s.movements?.length > 0 && (
                      <button
                        onClick={e => toggleExpand(key, e)}
                        className={`text-zinc-600 hover:text-zinc-200 transition-transform text-xs ${isOpen ? 'rotate-90' : ''}`}
                        title="Preview movements"
                      >▸</button>
                    )}
                  </td>
                  <td className="py-3 pr-5 text-zinc-400 mono-stat text-xs whitespace-nowrap">{s.date}</td>
                  <td className="py-3 pr-5 max-w-[260px]">
                    <span className="font-medium text-zinc-100 group-hover:text-accent-hover transition-colors">{s.workout}</span>
                    {s.notes && <p className="text-[11px] text-amber-400/80 mt-0.5 leading-snug">{s.notes}</p>}
                    {prEntries.length > 0 && (
                      <p className="mt-1 flex flex-wrap gap-1">
                        {prEntries.map(([k, pr]) => (
                          <span key={k} className="pr-badge">⬆ {k.replace(/_/g, ' ')} {pr.weight}</span>
                        ))}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-5 mono-stat text-zinc-300 text-right">{s.duration}</td>
                  <td className="py-3 pr-5 mono-stat text-zinc-100 font-medium text-right">{s.total_volume?.toLocaleString() ?? '—'}</td>
                  <td className="py-3 pr-5 mono-stat text-zinc-300 text-right">{s.total_reps ?? '—'}</td>
                  <td className="py-3 pr-5 text-center"><RatingPips value={s.subjective_rating} /></td>
                  <td className="py-3 pr-5 text-zinc-400 text-xs">{SWEAT[s.sweat] ?? s.sweat}</td>
                  <td className="py-3 pr-5 mono-stat text-zinc-300 text-right">{s.energy_level}</td>
                  <td className="py-3 pr-5 mono-stat text-zinc-300 text-right">{s.avg_hr ?? '—'}</td>
                </tr>
                {isOpen && s.movements?.length > 0 && (
                  <tr className="border-b border-surface-3/40 bg-surface-0/60">
                    <td />
                    <td colSpan={COLS.length} className="py-3 pr-5">
                      <div className="grid grid-cols-1 gap-x-8 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                        {s.movements.map((m, i) => {
                          const weights = m.sets.map(x => x.weight_lbs).filter(v => v != null)
                          const allSame = weights.length > 0 && weights.every(v => v === weights[0])
                          const hasPR = m.sets.some(x => x.prs?.length) || m.warmup_prs?.length
                          const weightLabel = weights.length === 0 ? ''
                            : allSame ? ` @ ${weights[0]} lbs`
                            : ` @ ${Math.min(...weights)}–${Math.max(...weights)} lbs`
                          return (
                            <div key={i} className="flex items-baseline justify-between gap-3 text-xs">
                              <span className="text-zinc-300 truncate">
                                {m.name}
                                {hasPR && <span className="pr-badge ml-1.5">PR</span>}
                              </span>
                              <span className="mono-stat text-zinc-500 whitespace-nowrap">
                                {m.sets.length} sets{weightLabel}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
      </div>
    </div>
  )
}

function RatingPips({ value }) {
  return (
    <span className="relative group/rating inline-flex items-center justify-center gap-0.5 cursor-default">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${
          i < Math.floor(value) ? 'text-accent-hover'
          : i === Math.floor(value) && value % 1 >= 0.5 ? 'text-accent/50'
          : 'text-surface-3'
        }`}>●</span>
      ))}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 whitespace-nowrap rounded-md bg-surface-3 border border-surface-3 px-2 py-1 text-xs text-zinc-200 shadow-lg opacity-0 group-hover/rating:opacity-100 transition-opacity">
        Session rating: {value} / 5
      </span>
    </span>
  )
}
