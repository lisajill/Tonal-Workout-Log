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
  const sorted = [...sessions].sort((a, b) => (a.timestamp ?? a.date).localeCompare(b.timestamp ?? b.date))

  // Collect all muscles that appear in any session
  const activeMuscles = ALL_MUSCLES.filter(m =>
    sorted.some(s =>
      s.muscles_high_volume?.includes(m) || s.muscles_low_volume?.includes(m)
    )
  )

  return (
    <div className="card overflow-x-auto">
      <div className="section-header">
        <h2 className="font-display italic text-2xl text-zinc-100">Muscle Matrix</h2>
        <p className="text-xs text-zinc-600">load per session — all sessions</p>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-surface-3">
            <th className="label pb-2 pr-4 text-left w-32">Muscle</th>
            {sorted.map(s => (
              <th key={s.date} className="label pb-2 px-2 text-center whitespace-nowrap">
                {shortDate(s.date)}
                {s.shot_day && (
                  <span className="relative group/shot inline-block">
                    <span className="block text-amber-400 normal-case font-normal cursor-default">💉</span>
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 whitespace-nowrap rounded-md bg-surface-3 border border-surface-3 px-2 py-1 text-xs text-zinc-200 shadow-lg opacity-0 group-hover/shot:opacity-100 transition-opacity">
                      GLP-1 shot day
                    </span>
                  </span>
                )}
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
  const tip = level === 'high' ? 'High volume' : level === 'low' ? 'Low volume' : 'Not targeted'
  const style =
    level === 'high' ? 'bg-accent text-white' :
    level === 'low'  ? 'bg-accent/25 text-accent' :
                       'bg-surface-2 text-zinc-700'
  const label = level === 'high' ? 'H' : level === 'low' ? 'L' : '—'
  return (
    <span className="relative group/cell inline-flex">
      <span className={`inline-flex h-6 w-6 items-center justify-center rounded font-bold text-[10px] cursor-default ${style}`}>
        {label}
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 whitespace-nowrap rounded-md bg-surface-3 border border-surface-3 px-2 py-1 text-xs text-zinc-200 shadow-lg opacity-0 group-hover/cell:opacity-100 transition-opacity">
        {tip}
      </span>
    </span>
  )
}

function LegendItem({ color, label }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span className={`inline-flex h-4 w-4 rounded ${color}`} />
      {label}
    </span>
  )
}
