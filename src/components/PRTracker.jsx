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

export default function PRTracker({ sessions }) {
  const bests = deriveBests(sessions)

  return (
    <div className="card overflow-x-auto">
      <h2 className="label mb-4">Personal Records</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-3">
            <th className="label pb-2 pr-6 text-left">Movement</th>
            <th className="label pb-2 pr-6 text-right">Best Weight (lbs)</th>
            <th className="label pb-2 text-left">Date Set</th>
          </tr>
        </thead>
        <tbody>
          {bests.map(({ key, weight, date, isNew }) => (
            <tr key={key} className="border-b border-surface-3/40 hover:bg-surface-2 transition-colors">
              <td className="py-3 pr-6 font-medium text-zinc-100">{MOVEMENT_LABELS[key] ?? key}</td>
              <td className="py-3 pr-6 text-right">
                {weight != null ? (
                  <span className="tabular-nums text-zinc-100 font-semibold">
                    {weight}
                    {isNew && <span className="ml-2 text-xs text-amber-400 font-bold">PR</span>}
                  </span>
                ) : (
                  <span className="text-zinc-600">—</span>
                )}
              </td>
              <td className="py-3 text-zinc-400 tabular-nums">{date ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
