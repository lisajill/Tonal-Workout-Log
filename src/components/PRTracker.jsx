import { ComposedChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

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

function formatMovement(key) {
  return MOVEMENT_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function daysSince(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return Math.floor((Date.now() - new Date(y, m - 1, d, 12).getTime()) / 86400000)
}

// One entry per PR event, chronological, grouped per movement
function buildHistory(sessions) {
  const chronological = [...sessions].sort((a, b) => (a.timestamp ?? a.date).localeCompare(b.timestamp ?? b.date))
  const byMovement = {}
  const events = []
  for (const s of chronological) {
    for (const [key, pr] of Object.entries(s.prs ?? {})) {
      if (pr.weight == null) continue
      const list = (byMovement[key] ??= [])
      const prevBest = list.length ? list[list.length - 1].weight : null
      const event = { key, weight: pr.weight, date: pr.date ?? s.date, prevBest }
      list.push(event)
      events.push(event)
    }
  }
  return { byMovement, events }
}

function PRTip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-surface-3 bg-surface-1/95 px-2.5 py-1.5 shadow-lg">
      <p className="mono-stat text-[11px] font-semibold text-zinc-100">{d.weight} lbs</p>
      <p className="mono-stat text-[10px] text-zinc-500">{d.date}</p>
    </div>
  )
}

export default function PRTracker({ sessions }) {
  const { byMovement, events } = buildHistory(sessions)

  // Every movement that has ever PR'd — not just the hardcoded label list
  const allKeys = [...new Set([...Object.keys(MOVEMENT_LABELS), ...Object.keys(byMovement)])]
  const cards = allKeys.map(key => {
    const list = byMovement[key] ?? []
    const first = list[0]?.weight ?? null
    const best = list.reduce((b, e) => Math.max(b, e.weight), 0) || null
    const last = list[list.length - 1]
    const growth = first != null && best != null && first !== best
      ? Math.round(((best - first) / first) * 100)
      : null
    return { key, list, first, best, last, growth, count: list.length }
  }).sort((a, b) => (b.growth ?? -1) - (a.growth ?? -1) || (b.best ?? 0) - (a.best ?? 0))

  const totalPRs = events.length
  const latest = events[events.length - 1]
  const mostImproved = cards.find(c => c.growth != null)
  const sinceLast = latest ? daysSince(latest.date) : null

  return (
    <div className="space-y-5">
      <h1 className="font-semibold text-3xl" style={{ color: CAT_PR }}>Personal Records</h1>

      {/* Insight chips */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="stat-card" style={{ borderLeftColor: CAT_PR }}>
          <p className="label">Total PRs</p>
          <p className="mono-stat mt-1 text-2xl font-bold" style={{ color: CAT_PR }}>{totalPRs}</p>
          <p className="text-[11px] text-zinc-500">across {cards.filter(c => c.count > 0).length} movements</p>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#34d399' }}>
          <p className="label">Most Improved</p>
          <p className="mono-stat mt-1 text-2xl font-bold text-emerald-400">+{mostImproved?.growth}%</p>
          <p className="text-[11px] text-zinc-500 truncate">{formatMovement(mostImproved?.key ?? '')}</p>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#a78bfa' }}>
          <p className="label">Latest PR</p>
          <p className="mono-stat mt-1 text-2xl font-bold text-zinc-100">{latest?.weight} <span className="text-sm text-zinc-500 font-medium">lbs</span></p>
          <p className="text-[11px] text-zinc-500 truncate">{formatMovement(latest?.key ?? '')} · {latest?.date}</p>
        </div>
        <div className="stat-card" style={{ borderLeftColor: sinceLast != null && sinceLast > 14 ? '#fb923c' : '#34d399' }}>
          <p className="label">Since Last PR</p>
          <p className={`mono-stat mt-1 text-2xl font-bold ${sinceLast != null && sinceLast > 14 ? 'text-orange-400' : 'text-zinc-100'}`}>
            {sinceLast}d
          </p>
          <p className="text-[11px] text-zinc-500">{sinceLast != null && sinceLast > 14 ? 'one is overdue — go take it' : 'records are fresh'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] items-start">
        {/* Movement progression cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {cards.map(({ key, list, first, best, last, growth, count }) => (
            <div key={key} className="card !p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg leading-tight text-zinc-100">{formatMovement(key)}</p>
                  <p className="mono-stat mt-0.5 text-[11px] text-zinc-600">
                    {count > 0 ? `${count} PR${count > 1 ? 's' : ''} · last ${last.date}` : 'no PR logged yet'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="mono-stat text-2xl font-bold" style={{ color: best != null ? CAT_PR : '#52525b' }}>
                    {best ?? '—'}
                    {best != null && <span className="ml-1 text-[10px] font-medium text-zinc-500">lbs</span>}
                  </p>
                  {growth != null && (
                    <span className="mono-stat text-[11px] font-semibold text-emerald-400">+{growth}%</span>
                  )}
                </div>
              </div>
              {count > 1 ? (
                <div className="mt-2 -mx-1">
                  <ResponsiveContainer width="100%" height={72}>
                    <ComposedChart data={list.map((e, i) => ({ ...e, i }))} margin={{ top: 6, right: 4, bottom: 0, left: 4 }}>
                      <defs>
                        <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CAT_PR} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={CAT_PR} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="i" hide />
                      <YAxis hide domain={[(dataMin) => Math.max(0, dataMin * 0.7), (dataMax) => dataMax * 1.08]} />
                      <Tooltip content={<PRTip />} cursor={{ stroke: '#3f3f46' }} />
                      <Area
                        isAnimationActive={false}
                        type="stepAfter" dataKey="weight"
                        stroke={CAT_PR} strokeWidth={2} fill={`url(#grad-${key})`}
                        dot={{ r: 2.5, fill: CAT_PR, strokeWidth: 0 }}
                        activeDot={{ r: 4, stroke: '#0f0f11', strokeWidth: 1.5 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <p className="mono-stat flex justify-between px-1 text-[10px] text-zinc-600">
                    <span>{first} lbs · {list[0].date}</span>
                    <span>→ {best} lbs</span>
                  </p>
                </div>
              ) : count === 1 ? (
                <p className="mt-3 text-[11px] text-zinc-600">
                  Single record at <span className="mono-stat text-zinc-400">{best} lbs</span> — beat it to start a streak.
                </p>
              ) : (
                <p className="mt-3 text-[11px] text-zinc-700">Waiting for a first record.</p>
              )}
            </div>
          ))}
        </div>

        {/* Trophy timeline */}
        <div className="card !p-0 overflow-hidden lg:sticky lg:top-16">
          <div className="section-header !mb-0 border-b-0 px-4 pt-4 pb-2">
            <h2 className="label">PR Timeline</h2>
            <span className="pr-badge">⬆ {totalPRs}</span>
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-4 pb-4">
            <div className="relative ml-1.5 border-l border-surface-3 pl-4 space-y-3 pt-2">
              {[...events].reverse().map((e, i) => (
                <div key={i} className="relative">
                  <span
                    className="absolute -left-[22.5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-surface-1"
                    style={{ backgroundColor: e.prevBest == null ? '#52525b' : CAT_PR }}
                  />
                  <p className="mono-stat text-[10px] text-zinc-600">{e.date}</p>
                  <p className="text-xs text-zinc-300 leading-snug">{formatMovement(e.key)}</p>
                  <p className="mono-stat text-xs">
                    <span className="font-bold" style={{ color: CAT_PR }}>{e.weight} lbs</span>
                    {e.prevBest != null ? (
                      <span className="text-zinc-600"> · was {e.prevBest} <span className="text-emerald-400">(+{Math.round(((e.weight - e.prevBest) / e.prevBest) * 100)}%)</span></span>
                    ) : (
                      <span className="text-zinc-600"> · first record</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
