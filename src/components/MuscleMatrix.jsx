const CAT_STRENGTH = '#a78bfa'

// Region grouping — muscles only render if they appear in the data
const REGIONS = [
  { label: 'Lower Body', muscles: ['glutes', 'hamstrings', 'quads', 'hip_flexors', 'adductors', 'calves'] },
  { label: 'Core',       muscles: ['abs', 'obliques', 'core', 'lower_back'] },
  { label: 'Upper Body', muscles: ['chest', 'back', 'lats', 'shoulders', 'biceps', 'triceps', 'forearms', 'grip'] },
]

const MUSCLE_LABELS = {
  glutes: 'Glutes', hamstrings: 'Hamstrings', quads: 'Quads', hip_flexors: 'Hip Flexors',
  adductors: 'Adductors', calves: 'Calves', abs: 'Abs', obliques: 'Obliques',
  core: 'Core (general)', lower_back: 'Lower Back', chest: 'Chest', back: 'Back', lats: 'Lats',
  shoulders: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms', grip: 'Grip',
}

// Manual sessions sometimes tag muscles as "Quads" / "Core" — normalize to snake_case
function normalizeMuscle(m) {
  return m.toLowerCase().replace(/\s+/g, '_')
}

function pad2(n) { return String(n).padStart(2, '0') }

function getWeekStart(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay()
  const sun = new Date(y, m - 1, d - day)
  return `${sun.getFullYear()}-${pad2(sun.getMonth() + 1)}-${pad2(sun.getDate())}`
}

function localTodayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`
}

function shortDate(d) {
  const [, m, day] = d.split('-')
  return `${parseInt(m)}/${parseInt(day)}`
}

function daysSince(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return Math.floor((Date.now() - new Date(y, m - 1, d, 12).getTime()) / 86400000)
}

// Cell color by weekly training load: high-volume hit = 1, low-volume = 0.5
function cellStyle(score) {
  if (score <= 0) return { backgroundColor: '#18181b' }
  const alpha = score >= 2.5 ? 0.95 : score >= 1.5 ? 0.7 : score >= 1 ? 0.48 : 0.25
  return { backgroundColor: `rgba(167, 139, 250, ${alpha})` }
}

function staleness(days) {
  if (days == null) return { text: 'never', cls: 'text-zinc-700' }
  if (days <= 7)  return { text: `${days}d`, cls: 'text-emerald-400' }
  if (days <= 14) return { text: `${days}d`, cls: 'text-amber-400' }
  return { text: `${days}d`, cls: 'text-red-400' }
}

export default function MuscleMatrix({ sessions }) {
  const sorted = [...sessions].sort((a, b) => (a.timestamp ?? a.date).localeCompare(b.timestamp ?? b.date))
  if (!sorted.length) return <div className="card text-zinc-500 text-sm">No sessions.</div>

  const todayStr = localTodayStr()
  const currentWeek = getWeekStart(todayStr)

  // All weeks from first session through this week
  const weeks = []
  {
    let [y, m, d] = getWeekStart(sorted[0].date).split('-').map(Number)
    let cursor = new Date(y, m - 1, d)
    for (;;) {
      const ws = `${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}-${pad2(cursor.getDate())}`
      weeks.push(ws)
      if (ws === currentWeek) break
      cursor.setDate(cursor.getDate() + 7)
      if (weeks.length > 104) break // safety
    }
  }

  // muscle → { weekScores: {week: score}, lastDate, totalSessions }
  const stats = {}
  const seen = new Set()
  for (const s of sorted) {
    const week = getWeekStart(s.date)
    const hit = (raw, w) => {
      const m = normalizeMuscle(raw)
      seen.add(m)
      const st = (stats[m] ??= { weekScores: {}, lastDate: null, totalSessions: 0 })
      st.weekScores[week] = (st.weekScores[week] ?? 0) + w
      if (!st.lastDate || s.date > st.lastDate) st.lastDate = s.date
      st.totalSessions += 1
    }
    for (const m of s.muscles_high_volume ?? []) hit(m, 1)
    for (const m of s.muscles_low_volume ?? []) hit(m, 0.5)
  }

  const regions = REGIONS
    .map(r => ({ ...r, muscles: r.muscles.filter(m => seen.has(m)) }))
    .filter(r => r.muscles.length > 0)
  // anything in the data we didn't classify
  const classified = new Set(REGIONS.flatMap(r => r.muscles))
  const other = [...seen].filter(m => !classified.has(m))
  if (other.length) regions.push({ label: 'Other', muscles: other })

  // most neglected currently-trained muscle (trained before, stale longest)
  const neglected = [...seen]
    .map(m => ({ m, days: stats[m].lastDate ? daysSince(stats[m].lastDate) : null }))
    .filter(x => x.days != null)
    .sort((a, b) => b.days - a.days)[0]

  return (
    <div className="space-y-5">
      <h1 className="font-display italic text-3xl" style={{ color: CAT_STRENGTH }}>Muscle Matrix</h1>

      <div className="card overflow-x-auto">
        <div className="section-header">
          <div>
            <h2 className="label">Weekly Coverage</h2>
            <p className="text-xs text-zinc-500 mt-1">
              How often each muscle gets trained, week by week — darker = more work.
              {neglected && neglected.days > 7 && <> Most neglected: <span className="text-amber-400">{MUSCLE_LABELS[neglected.m] ?? neglected.m}</span> ({neglected.days}d ago).</>}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[10px] text-zinc-500 shrink-0">
            <span>less</span>
            {[0.5, 1, 1.5, 2.5].map(s => (
              <span key={s} className="h-3 w-3 rounded-sm" style={cellStyle(s)} />
            ))}
            <span>more</span>
          </div>
        </div>

        <table className="w-full text-xs min-w-[560px]">
          <thead>
            <tr>
              <th className="label !text-[9px] text-left pb-2 pr-3 w-28">Muscle</th>
              {weeks.map(w => (
                <th key={w} className={`label !text-[9px] pb-2 px-0.5 text-center mono-stat ${w === currentWeek ? '!text-accent-hover' : ''}`}>
                  {shortDate(w)}
                </th>
              ))}
              <th className="label !text-[9px] pb-2 pl-3 text-right whitespace-nowrap">Last hit</th>
              <th className="label !text-[9px] pb-2 pl-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {regions.map(region => (
              <RegionRows key={region.label} region={region} weeks={weeks} stats={stats} currentWeek={currentWeek} />
            ))}
          </tbody>
        </table>

        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-zinc-600">
          <span>High-volume session = 1 · low-volume = ½</span>
          <span><span className="text-emerald-400">●</span> hit within 7d</span>
          <span><span className="text-amber-400">●</span> 8–14d ago</span>
          <span><span className="text-red-400">●</span> 15d+ — due</span>
        </p>
      </div>
    </div>
  )
}

function RegionRows({ region, weeks, stats, currentWeek }) {
  return (
    <>
      <tr>
        <td colSpan={weeks.length + 3} className="pt-4 pb-1.5">
          <span className="label !text-[10px]" style={{ color: CAT_STRENGTH }}>{region.label}</span>
        </td>
      </tr>
      {region.muscles.map(m => {
        const st = stats[m]
        const days = st?.lastDate ? daysSince(st.lastDate) : null
        const stale = staleness(days)
        return (
          <tr key={m} className="group">
            <td className="py-px pr-3 text-zinc-300 whitespace-nowrap">{MUSCLE_LABELS[m] ?? m}</td>
            {weeks.map(w => {
              const score = st?.weekScores[w] ?? 0
              return (
                <td key={w} className="px-0.5 py-px">
                  <div
                    className={`h-5 w-full rounded-sm ${w === currentWeek ? 'ring-1 ring-inset ring-surface-3' : ''}`}
                    style={cellStyle(score)}
                    title={`${MUSCLE_LABELS[m] ?? m} — week of ${shortDate(w)}: ${score > 0 ? `${score}× load` : 'not trained'}`}
                  />
                </td>
              )
            })}
            <td className={`pl-3 text-right mono-stat whitespace-nowrap ${stale.cls}`}>{stale.text}</td>
            <td className="pl-3 text-right mono-stat text-zinc-500">{st?.totalSessions ?? 0}</td>
          </tr>
        )
      })}
    </>
  )
}
