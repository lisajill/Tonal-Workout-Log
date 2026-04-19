const ALL_MUSCLES = [
  'glutes', 'hamstrings', 'quads', 'hip_flexors',
  'lower_back', 'lats', 'calves', 'abs', 'obliques',
]

const MUSCLE_LABELS = {
  glutes: 'Glutes', hamstrings: 'Hamstrings', quads: 'Quads',
  hip_flexors: 'Hip Flexors', lower_back: 'Lower Back', lats: 'Lats',
  calves: 'Calves', abs: 'Abs', obliques: 'Obliques',
}

function shortDate(d) {
  const [, m, day] = d.split('-')
  return `${parseInt(m)}/${parseInt(day)}`
}

export default function MuscleMatrix({ sessions }) {
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))

  // Collect all muscles that appear in any session
  const activeMuscles = ALL_MUSCLES.filter(m =>
    sorted.some(s =>
      s.muscles_high_volume?.includes(m) || s.muscles_low_volume?.includes(m)
    )
  )

  return (
    <div className="card overflow-x-auto">
      <h2 className="label mb-4">Muscle Load — All Sessions</h2>

      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-surface-3">
            <th className="label pb-2 pr-4 text-left w-32">Muscle</th>
            {sorted.map(s => (
              <th key={s.date} className="label pb-2 px-2 text-center whitespace-nowrap">
                {shortDate(s.date)}
                {s.shot_day && <span className="block text-amber-400 normal-case font-normal">💉</span>}
              </th>
            ))}
            <th className="label pb-2 pl-4 text-center">Total sessions</th>
          </tr>
        </thead>
        <tbody>
          {activeMuscles.map(m => {
            const counts = sorted.map(s => {
              if (s.muscles_high_volume?.includes(m)) return 'high'
              if (s.muscles_low_volume?.includes(m)) return 'low'
              return null
            })
            const total = counts.filter(Boolean).length
            return (
              <tr key={m} className="border-b border-surface-3/40">
                <td className="py-2.5 pr-4 font-medium text-zinc-300 whitespace-nowrap">
                  {MUSCLE_LABELS[m]}
                </td>
                {counts.map((level, i) => (
                  <td key={i} className="py-2.5 px-2 text-center">
                    <Cell level={level} />
                  </td>
                ))}
                <td className="py-2.5 pl-4 text-center tabular-nums text-zinc-400">
                  {total} / {sorted.length}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-surface-3">
        <LegendItem color="bg-accent" label="High volume" />
        <LegendItem color="bg-accent/25" label="Low volume" />
        <LegendItem color="bg-surface-2" label="Not targeted" />
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span>💉</span> GLP-1 shot day
        </span>
      </div>
    </div>
  )
}

function Cell({ level }) {
  if (level === 'high') return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-accent text-white font-bold text-[10px]">H</span>
  )
  if (level === 'low') return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-accent/25 text-accent font-bold text-[10px]">L</span>
  )
  return <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-surface-2 text-zinc-700 text-[10px]">—</span>
}

function LegendItem({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span className={`inline-flex h-4 w-4 rounded ${color}`} />
      {label}
    </span>
  )
}
