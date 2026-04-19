import { useState } from 'react'

const SWEAT = { dry: 'Dry', untracked: '—', light: 'Light', moderate: 'Moderate', heavy: 'Heavy' }

const COLS = [
  { key: 'date',             label: 'Date',           align: 'left' },
  { key: 'workout',          label: 'Workout',        align: 'left' },
  { key: 'duration',         label: 'Duration (min)', align: 'right' },
  { key: 'total_volume',     label: 'Volume (lbs)',   align: 'right' },
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
              key={s.date}
              onClick={() => onSelectSession?.(s.date)}
              className="border-b border-surface-3/40 hover:bg-surface-2 transition-colors cursor-pointer group"
            >
              <td className="py-3 pr-6 text-zinc-400 tabular-nums">{s.date}</td>
              <td className="py-3 pr-6 font-medium text-zinc-100 max-w-[220px] group-hover:text-accent transition-colors">{s.workout}</td>
              <td className="py-3 pr-6 tabular-nums text-zinc-300 text-right">{s.duration}</td>
              <td className="py-3 pr-6 tabular-nums text-zinc-300 text-right">{s.total_volume?.toLocaleString() ?? '—'}</td>
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
    <span className="flex items-center justify-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${
          i < Math.floor(value) ? 'text-accent'
          : i === Math.floor(value) && value % 1 >= 0.5 ? 'text-accent/50'
          : 'text-surface-3'
        }`}>●</span>
      ))}
    </span>
  )
}
