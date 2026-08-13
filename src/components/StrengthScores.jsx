import sessions from '../data/sessions.json'
import {
  LineChart, Line, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceArea,
} from 'recharts'
import { AXIS, GRID, ChartTip } from './chartTheme.jsx'

const COLORS = {
  overall: '#6366f1',
  upper:   '#22d3ee',
  lower:   '#a78bfa',
  core:    '#f43f5e',
  fs:      '#10b981',
  mq:      '#f59e0b',
}

const HISTORY = [
  { date: '2026-01-12', overall: 445, upper: 461, lower: 424, core: 450 },
  { date: '2026-01-13', overall: 445, upper: 461, lower: 424, core: 450 },
  { date: '2026-01-16', overall: 445, upper: 461, lower: 424, core: 450 },
  { date: '2026-02-03', overall: 445, upper: 461, lower: 424, core: 450 },
  { date: '2026-02-04', overall: 445, upper: 461, lower: 424, core: 450 },
  { date: '2026-04-04', overall: 445, upper: 461, lower: 423, core: 450 },
  { date: '2026-04-05', overall: 450, upper: 461, lower: 439, core: 450 },
  { date: '2026-04-18', overall: 450, upper: 461, lower: 439, core: 450 },
  { date: '2026-04-19', overall: 452, upper: 461, lower: 444, core: 450 },
  { date: '2026-04-25', overall: 453, upper: 461, lower: 449, core: 450 },
  { date: '2026-04-26', overall: 462, upper: 461, lower: 475, core: 450 },
  { date: '2026-04-29', overall: 468, upper: 461, lower: 493, core: 450 },
  { date: '2026-05-02', overall: 468, upper: 461, lower: 494, core: 450 },
  { date: '2026-05-03', overall: 474, upper: 462, lower: 505, core: 454 },
  { date: '2026-05-07', overall: 480, upper: 462, lower: 524, core: 454 },
  { date: '2026-05-08', overall: 484, upper: 465, lower: 534, core: 454 },
  { date: '2026-05-09', overall: 493, upper: 487, lower: 535, core: 456 },
  { date: '2026-05-24', overall: 493, upper: 487, lower: 435, core: 456 },
  { date: '2026-05-25', overall: 493, upper: 487, lower: 536, core: 456 },
  { date: '2026-05-27', overall: 496, upper: 486, lower: 536, core: 465 },
  { date: '2026-05-30', overall: 496, upper: 487, lower: 535, core: 465 },
  { date: '2026-05-31', overall: 496, upper: 487, lower: 536, core: 465 },
  { date: '2026-06-07', overall: 496, upper: 487, lower: 536, core: 465 },
  { date: '2026-06-13', overall: 502, upper: 487, lower: 553, core: 465 },
  { date: '2026-06-14', overall: 507, upper: 487, lower: 570, core: 465 },
  { date: '2026-06-18', overall: 519, upper: 487, lower: 605, core: 465 },
  { date: '2026-06-19', overall: 519, upper: 487, lower: 606, core: 465 },
  { date: '2026-07-05', overall: 523, upper: 487, lower: 616, core: 465 },
  { date: '2026-07-18', overall: 523, upper: 487, lower: 616, core: 465 },
  { date: '2026-07-19', overall: 523, upper: 487, lower: 616, core: 465 },
  { date: '2026-07-24', overall: 523, upper: 487, lower: 616, core: 465 },
  { date: '2026-07-25', overall: 523, upper: 487, lower: 616, core: 466 },
  { date: '2026-07-26', overall: 523, upper: 487, lower: 616, core: 466 },
  { date: '2026-08-01', overall: 523, upper: 487, lower: 616, core: 465 },
  { date: '2026-08-02', overall: 523, upper: 487, lower: 618, core: 465 },
  { date: '2026-08-13', overall: 523, upper: 487, lower: 618, core: 465 },
]

function shortDate(d) {
  const [, m, day] = d.split('-')
  return `${parseInt(m)}/${parseInt(day)}`
}

function daysBetween(a, b) {
  const p = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
  return Math.round((p(b) - p(a)) / 86400000)
}

const chartData = HISTORY.map(r => ({ ...r, label: shortDate(r.date) }))

const current = HISTORY[HISTORY.length - 1]
const first = HISTORY[0]

// Latest snapshot at least 30 days before the most recent one
const baseline30 = [...HISTORY].reverse().find(r => daysBetween(r.date, current.date) >= 30) ?? first

const REGIONS = [
  { key: 'overall', label: 'Overall' },
  { key: 'upper',   label: 'Upper'   },
  { key: 'core',    label: 'Core'    },
  { key: 'lower',   label: 'Lower'   },
]

const SCORE_NAMES = { overall: 'Overall', upper: 'Upper', core: 'Core', lower: 'Lower' }
const GOAL_NAMES = { fs: 'Functional Strength', mq: 'Movement Quality' }

const goalsData = (() => {
  const seen = {}
  return sessions
    .filter(s => s.functional_strength != null || s.movement_quality != null)
    .map(s => {
      const base = s.date.slice(5).replace('-', '/')
      seen[base] = (seen[base] ?? 0) + 1
      return {
        date: s.date,
        label: seen[base] > 1 ? `${base}+` : base,
        fs: s.functional_strength ?? null,
        mq: s.movement_quality ?? null,
      }
    })
})()

const latestGoals = goalsData[goalsData.length - 1]

export default function StrengthScores() {
  const delta30 = current.overall - baseline30.overall
  const regionGains30 = ['upper', 'core', 'lower'].map(key => ({ key, gain: current[key] - baseline30[key] }))
  const fastest = regionGains30.reduce((b, r) => r.gain > b.gain ? r : b, regionGains30[0])
  const strongest = ['upper', 'core', 'lower'].reduce((b, k) => current[k] > current[b] ? k : b, 'upper')
  const sinceUpdate = daysBetween(current.date, new Date().toISOString().slice(0, 10))

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold text-zinc-100">Strength Scores</h1>

      {/* Insight chips */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="stat-card" style={{ borderLeftColor: COLORS.overall }}>
          <p className="label">Last 30 Days</p>
          <p className={`mono-stat mt-1 text-2xl font-bold ${delta30 > 0 ? 'text-emerald-400' : delta30 < 0 ? 'text-red-400' : 'text-zinc-100'}`}>
            {delta30 > 0 ? `↑ +${delta30}` : delta30 < 0 ? `↓ ${delta30}` : '—'}
          </p>
          <p className="text-[11px] text-zinc-500">overall score · since {baseline30.date}</p>
        </div>
        <div className="stat-card" style={{ borderLeftColor: COLORS[fastest.key] }}>
          <p className="label">Fastest Growing</p>
          <p className="mono-stat mt-1 text-2xl font-bold" style={{ color: COLORS[fastest.key] }}>
            {SCORE_NAMES[fastest.key]}
          </p>
          <p className="text-[11px] text-zinc-500">+{fastest.gain} in 30 days</p>
        </div>
        <div className="stat-card" style={{ borderLeftColor: COLORS[strongest] }}>
          <p className="label">Strongest Region</p>
          <p className="mono-stat mt-1 text-2xl font-bold" style={{ color: COLORS[strongest] }}>
            {SCORE_NAMES[strongest]}
          </p>
          <p className="text-[11px] text-zinc-500">score {current[strongest]}</p>
        </div>
        <div className="stat-card" style={{ borderLeftColor: sinceUpdate > 7 ? '#fb923c' : '#34d399' }}>
          <p className="label">Last Snapshot</p>
          <p className={`mono-stat mt-1 text-2xl font-bold ${sinceUpdate > 7 ? 'text-orange-400' : 'text-zinc-100'}`}>{sinceUpdate}d</p>
          <p className="text-[11px] text-zinc-500">{sinceUpdate > 7 ? 'time to grab fresh scores' : `ago · ${current.date}`}</p>
        </div>
      </div>

      {/* Region cards with sparklines */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {REGIONS.map(({ key, label }) => {
          const delta = current[key] - first[key]
          return (
            <div key={key} className="stat-card !p-0 overflow-hidden" style={{ borderLeftColor: COLORS[key] }}>
              <div className="px-4 pt-4">
                <span className="label">{label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="mono-stat text-3xl font-bold" style={{ color: COLORS[key] }}>
                    {current[key]}
                  </span>
                  <span className={`mono-stat text-xs font-medium ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                    {delta > 0 ? `+${delta}` : delta || '±0'}
                  </span>
                </div>
              </div>
              <div className="mt-1 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id={`spark-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS[key]} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={COLORS[key]} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Area isAnimationActive={false} type="monotone" dataKey={key} stroke={COLORS[key]} strokeWidth={1.5} fill={`url(#spark-${key})`} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )
        })}
      </div>

      {/* History chart */}
      <div className="card">
        <div className="section-header">
          <div>
            <h2 className="label">Strength Score History</h2>
            <p className="text-zinc-500 text-xs mt-1">All-time progression across body regions</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={28} />
            <YAxis {...AXIS} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTip names={SCORE_NAMES} />} cursor={{ stroke: '#3f3f46' }} />
            <Legend formatter={v => SCORE_NAMES[v] ?? v} wrapperStyle={{ fontSize: 11, color: '#71717a' }} iconType="circle" iconSize={7} />
            {REGIONS.map(({ key }) => (
              <Line
                key={key}
                isAnimationActive={false}
                type="monotone"
                dataKey={key}
                stroke={COLORS[key]}
                strokeWidth={key === 'overall' ? 2.5 : 1.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Goals Progress */}
      {goalsData.length > 0 && (
        <div className="card">
          <div className="section-header">
            <div>
              <h2 className="label">Goals Progress</h2>
              <p className="text-zinc-500 text-xs mt-1">Functional Strength and Movement Quality per session — weekly metrics, reset each week. Shaded bands = Tonal's target ranges.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {latestGoals?.fs != null && (
              <div className="stat-card !bg-surface-2" style={{ borderLeftColor: COLORS.fs }}>
                <p className="label mb-1">Functional Strength</p>
                <p className="mono-stat text-2xl font-bold" style={{ color: COLORS.fs }}>{latestGoals.fs}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {latestGoals.fs >= 100 && latestGoals.fs <= 133 ? '✓ in target range 100–133' : 'Target 100–133'}
                </p>
              </div>
            )}
            {latestGoals?.mq != null && (
              <div className="stat-card !bg-surface-2" style={{ borderLeftColor: COLORS.mq }}>
                <p className="label mb-1">Movement Quality</p>
                <p className="mono-stat text-2xl font-bold" style={{ color: COLORS.mq }}>{latestGoals.mq}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {latestGoals.mq >= 59 && latestGoals.mq <= 79 ? '✓ in target range 59–79' : 'Target 59–79'}
                </p>
              </div>
            )}
          </div>
          {goalsData.length > 1 && (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={goalsData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={28} />
                <YAxis {...AXIS} domain={[0, 'auto']} />
                <Tooltip content={<ChartTip names={GOAL_NAMES} />} cursor={{ stroke: '#3f3f46' }} />
                <Legend formatter={v => GOAL_NAMES[v] ?? v} wrapperStyle={{ fontSize: 11, color: '#71717a' }} iconType="circle" iconSize={7} />
                <ReferenceArea y1={100} y2={133} fill={COLORS.fs} fillOpacity={0.06} stroke={COLORS.fs} strokeOpacity={0.2} strokeDasharray="3 3" />
                <ReferenceArea y1={59} y2={79} fill={COLORS.mq} fillOpacity={0.06} stroke={COLORS.mq} strokeOpacity={0.2} strokeDasharray="3 3" />
                <Line isAnimationActive={false} type="monotone" dataKey="fs" stroke={COLORS.fs} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls />
                <Line isAnimationActive={false} type="monotone" dataKey="mq" stroke={COLORS.mq} strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Historical table with per-snapshot deltas */}
      <div className="card !p-0 overflow-hidden">
        <div className="section-header !mb-0 border-b-0 px-5 pt-5 pb-3">
          <h2 className="label">Score Log</h2>
          <p className="text-zinc-500 text-xs">every snapshot · deltas vs previous</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-surface-2">
              <th className="label py-2.5 pl-5">Date</th>
              {REGIONS.map(({ key, label }) => (
                <th key={key} className="label py-2.5 pr-5 text-right" style={{ color: COLORS[key] }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...HISTORY].reverse().map((row, i, arr) => {
              const prev = arr[i + 1]
              return (
                <tr key={row.date} className={`border-b border-surface-3/40 last:border-0 ${i % 2 === 1 ? 'bg-surface-0/40' : ''}`}>
                  <td className="py-2 pl-5 text-zinc-400 mono-stat text-xs">{row.date}</td>
                  {REGIONS.map(({ key }) => {
                    const d = prev ? row[key] - prev[key] : 0
                    return (
                      <td key={key} className="py-2 pr-5 text-right mono-stat">
                        <span className="text-zinc-200">{row[key]}</span>
                        {d !== 0 && (
                          <span className={`ml-1.5 text-[10px] ${d > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {d > 0 ? `+${d}` : d}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
