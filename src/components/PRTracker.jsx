const MOVEMENT_LABELS = {
  barbell_hip_thrust:                 'Barbell Hip Thrust',
  barbell_lying_glute_bridge:         'Barbell Lying Glute Bridge',
  prone_bench_hamstring_curl:         'Prone Bench Hamstring Curl',
  prone_bench_sl_hamstring_curl:      'Prone Bench SL Hamstring Curl',
  standing_sl_hamstring_curl:         'Standing SL Hamstring Curl',
  standing_leg_extension:             'Standing Leg Extension',
  standing_hip_abduction:             'Standing Hip Abduction',
  standing_donkey_kick:               'Standing Donkey Kick',
  standing_diagonal_glute_kickback:   'Standing Diagonal Glute Kickback',
  standing_straight_leg_glute_kickback: 'Standing Straight Leg Glute Kickback',
}

const CAT_PR = '#f472b6'

export default function PRTracker({ sessions }) {
  const bests = deriveBests(sessions)
  const maxWeight = Math.max(...bests.map(b => b.weight ?? 0), 1)

  return (
    <div className="space-y-5">
      <h1 className="font-display italic text-3xl" style={{ color: CAT_PR }}>Personal Records</h1>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2">
              <th className="label py-2.5 pl-5 pr-6 text-left">Movement</th>
              <th className="label py-2.5 pr-6 text-right">Best Weight</th>
              <th className="label py-2.5 pr-6 text-left w-[30%]">&nbsp;</th>
              <th className="label py-2.5 pr-5 text-left">Date Set</th>
            </tr>
          </thead>
          <tbody>
            {bests.map(({ key, weight, date, isNew }, i) => (
              <tr key={key} className={`border-b border-surface-3/40 hover:bg-surface-2 transition-colors ${i % 2 === 1 ? 'bg-surface-0/40' : ''}`}>
                <td className="py-3 pl-5 pr-6 font-medium text-zinc-100">{MOVEMENT_LABELS[key] ?? key}</td>
                <td className="py-3 pr-6 text-right whitespace-nowrap">
                  {weight != null ? (
                    <span className="mono-stat text-zinc-100 font-semibold">
                      {weight} <span className="text-[10px] text-zinc-500 font-medium">lbs</span>
                      {isNew && <span className="pr-badge ml-2">⬆ New</span>}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="py-3 pr-6">
                  {weight != null && (
                    <div className="h-1.5 w-full rounded-full bg-surface-2">
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${Math.round((weight / maxWeight) * 100)}%`, backgroundColor: CAT_PR }}
                      />
                    </div>
                  )}
                </td>
                <td className="py-3 pr-5 text-zinc-400 mono-stat text-xs">{date ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

function deriveBests(sessions) {
  const movements = Object.keys(MOVEMENT_LABELS)
  const map = {}

  for (const s of sessions) {
    for (const [key, pr] of Object.entries(s.prs ?? {})) {
      if (pr.weight == null) continue
      if (!map[key] || pr.weight > map[key].weight) {
        map[key] = { weight: pr.weight, date: pr.date, isNew: pr.date === s.date }
      }
    }
  }

  // Mark isNew only if this PR was set in the most recent session
  const latestDate = sessions.reduce((max, s) => s.date > max ? s.date : max, '')
  return movements.map(key => ({
    key,
    weight: map[key]?.weight ?? null,
    date: map[key]?.date ?? null,
    isNew: map[key]?.date === latestDate,
  }))
}
