import { useState } from 'react'

const PROGRAM_MAP = {
  'Heavy Express — Floor Bridge + Ankle Straps':       'he_floor_bridge',
  'Heavy Express — Glute Bridge + Hamstring + Quad':   'he_glute',
  'Heavy Express — Hip Thrust + Hamstring':            'he_hip',
  'Hands Free Lower Body':                             'hfla',
  'Hands Free Lower Body + Core B':                   'hflb',
  'Hamstring + Quad Strength':                         'hqs',
}

const SWEAT = { dry: 'Dry', untracked: '—', light: 'Light', moderate: 'Moderate', heavy: 'Heavy' }

const COLS = [
  { key: 'date',             label: 'Date',           align: 'left' },
  { key: 'workout',          label: 'Workout',        align: 'left' },
  { key: 'duration',         label: 'Duration (min)', align: 'right' },
  { key: 'total_volume',     label: 'Volume (lbs)',   align: 'right' },
  { key: 'total_reps',       label: 'Reps',           align: 'right' },
  { key: 'subjective_rating',label: 'Rating',         align: 'center' },
  { key: 'sweat',            label: 'Sweat',          align: 'left' },
  { key: 'energy_level',     label: 'Energy',         align: 'right' },
  { key: 'avg_hr',           label: 'Avg HR',         align: 'right' },
]

export default function SessionLog({ sessions, onSelectSession }) {
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  function handleSort(key) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...sessions].sort((a, b) => {
    let av = a[sortKey] ?? -Infinity
    let bv = b[sortKey] ?? -Infinity
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? av - bv : bv - av
  })

  return (
    <div className="card overflow-x-auto">
      <h2 className="label mb-4">Session Log</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-3">
            {COLS.map(({ key, label, align }) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className={`label pb-2 pr-6 cursor-pointer select-none whitespace-nowrap hover:text-zinc-200 transition-colors text-${align}`}
              >
                {label}
                {sortKey === key && (
                  <span className="ml-1 text-accent">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => (
            <tr
              key={s.tonal_activity_id ?? `${s.date}::${s.workout}`}
              onClick={() => onSelectSession?.(s.date)}
              className="border-b border-surface-3/40 hover:bg-surface-2 transition-colors cursor-pointer group"
            >
              <td className="py-3 pr-6 text-zinc-400 tabular-nums">{s.date}</td>
              <td className="py-3 pr-6 max-w-[240px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-zinc-100 group-hover:text-accent transition-colors">{s.workout}</span>
                  {PROGRAM_MAP[s.workout] && (
                    <a
                      href={`#programs`}
                      onClick={e => e.stopPropagation()}
                      className="text-zinc-600 hover:text-accent transition-colors text-xs shrink-0"
                      title="View custom workout"
                    >↗</a>
                  )}
                </div>
                {s.notes && <p className="text-[11px] text-amber-400/80 mt-0.5 leading-snug">{s.notes}</p>}
              </td>
              <td className="py-3 pr-6 tabular-nums text-zinc-300 text-right">{s.duration}</td>
              <td className="py-3 pr-6 tabular-nums text-zinc-300 text-right">{s.total_volume?.toLocaleString() ?? '—'}</td>
              <td className="py-3 pr-6 tabular-nums text-zinc-300 text-right">{s.total_reps ?? '—'}</td>
              <td className="py-3 pr-6 text-center"><RatingPips value={s.subjective_rating} /></td>
              <td className="py-3 pr-6 text-zinc-300">{SWEAT[s.sweat] ?? s.sweat}</td>
              <td className="py-3 pr-6 tabular-nums text-zinc-300 text-right">{s.energy_level}</td>
              <td className="py-3 pr-6 tabular-nums text-zinc-300 text-right">{s.avg_hr ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RatingPips({ value }) {
  return (
    <span className="relative group/rating inline-flex items-center justify-center gap-0.5 cursor-default">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${
          i < Math.floor(value) ? 'text-accent'
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
