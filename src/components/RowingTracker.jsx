import cardioLog from '../data/zone2_log.json'
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { AXIS, GRID, ChartTip } from './chartTheme.jsx'

const CAT_ROWING = '#38bdf8' // sky-400 — rowing category color (design.md)
const POWER = '#f59e0b'

function shortDate(d) {
  const [, m, day] = d.split('-')
  return `${parseInt(m)}/${parseInt(day)}`
}

function parseSplitSecs(s) {
  if (!s) return null
  const [m, sec] = s.split(':')
  return parseFloat(m) * 60 + parseFloat(sec)
}

function fmtSplit(secs) {
  if (secs == null) return '—'
  const m = Math.floor(secs / 60)
  const s = (secs % 60).toFixed(1).padStart(4, '0')
  return `${m}:${s}`
}

export default function RowingTracker() {
  const sessions = [...cardioLog]
    .filter(s => s.activity === 'Rowing' && s.rowing_avg_split)
    .sort((a, b) => (a.timestamp ?? a.date).localeCompare(b.timestamp ?? b.date))

  if (sessions.length === 0) {
    return (
      <div className="card text-zinc-500 text-sm">No rowing sessions logged yet.</div>
    )
  }

  const chartData = sessions.map(s => ({
    label: shortDate(s.date),
    date: s.date,
    split_sec: parseSplitSecs(s.rowing_avg_split),
    watts: s.rowing_avg_watts ?? null,
    distance: s.rowing_distance_m ?? null,
    spm: s.rowing_stroke_rate_spm ?? null,
  }))

  const bestSplit = sessions.reduce((best, s) => {
    const sec = parseSplitSecs(s.rowing_avg_split)
    return (best === null || sec < best) ? sec : best
  }, null)
  const bestWatts = Math.max(...sessions.map(s => s.rowing_avg_watts ?? 0))
  const totalDist = sessions.reduce((t, s) => t + (s.rowing_distance_m ?? 0), 0)

  return (
    <div className="space-y-5">

      <h1 className="font-display italic text-3xl" style={{ color: CAT_ROWING }}>Rowing</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card flex flex-col gap-1" style={{ borderLeftColor: CAT_ROWING }}>
          <span className="label">Sessions</span>
          <span className="mono-stat text-3xl font-bold text-zinc-100">{sessions.length}</span>
          <span className="text-xs text-zinc-500">on the Hydrow</span>
        </div>
        <div className="stat-card flex flex-col gap-1" style={{ borderLeftColor: CAT_ROWING }}>
          <span className="label">Total Distance</span>
          <span className="mono-stat text-3xl font-bold" style={{ color: CAT_ROWING }}>{(totalDist / 1000).toFixed(2)}</span>
          <span className="text-xs text-zinc-500">km</span>
        </div>
        <div className="stat-card flex flex-col gap-1" style={{ borderLeftColor: CAT_ROWING }}>
          <span className="label">Best Split</span>
          {/* split is the primary performance metric — large mono (design.md) */}
          <span className="mono-stat text-3xl font-bold" style={{ color: CAT_ROWING }}>{fmtSplit(bestSplit)}</span>
          <span className="text-xs text-zinc-500">per 500m · lower is faster</span>
        </div>
        <div className="stat-card flex flex-col gap-1" style={{ borderLeftColor: CAT_ROWING }}>
          <span className="label">Best Watts</span>
          <span className="mono-stat text-3xl font-bold" style={{ color: POWER }}>{bestWatts}W</span>
          <span className="text-xs text-zinc-500">avg peak power</span>
        </div>
      </div>

      {/* Trend charts — only when 2+ sessions */}
      {chartData.length > 1 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card">
              <div className="section-header">
                <div>
                  <h2 className="label">Split /500m</h2>
                  <p className="text-xs text-zinc-500 mt-1">Goal: below 3:00 — axis flipped so up = improving</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gradRowSplit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CAT_ROWING} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={CAT_ROWING} stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="label" {...AXIS} />
                  <YAxis {...AXIS} reversed tickFormatter={v => fmtSplit(v)} domain={['auto', 'auto']} />
                  <Tooltip content={<ChartTip names={{ split_sec: 'Avg Split' }} formats={{ split_sec: v => `${fmtSplit(v)} /500m` }} />} cursor={{ stroke: '#3f3f46' }} />
                  <Area isAnimationActive={false} type="monotone" dataKey="split_sec" stroke={CAT_ROWING} strokeWidth={2} fill="url(#gradRowSplit)" dot={{ r: 3 }} activeDot={{ r: 4.5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="section-header">
                <div>
                  <h2 className="label">Avg Peak Power</h2>
                  <p className="text-xs text-zinc-500 mt-1">Higher = more powerful</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="label" {...AXIS} />
                  <YAxis {...AXIS} unit="W" domain={['auto', 'auto']} />
                  <Tooltip content={<ChartTip names={{ watts: 'Avg Peak Power' }} formats={{ watts: v => `${v} W` }} />} cursor={{ stroke: '#3f3f46' }} />
                  <Line isAnimationActive={false} type="monotone" dataKey="watts" stroke={POWER} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4.5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="section-header">
              <div>
                <h2 className="label">Distance per Session</h2>
                <p className="text-xs text-zinc-500 mt-1">Meters rowed — longer sessions or faster pace = more distance</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barCategoryGap="35%">
                <defs>
                  <linearGradient id="gradRowDist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CAT_ROWING} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={CAT_ROWING} stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="label" {...AXIS} />
                <YAxis {...AXIS} unit="m" domain={['auto', 'auto']} />
                <Tooltip content={<ChartTip names={{ distance: 'Distance' }} formats={{ distance: v => `${v} m` }} />} cursor={{ fill: '#242428', opacity: 0.5 }} />
                <Bar isAnimationActive={false} dataKey="distance" fill="url(#gradRowDist)" radius={[5, 5, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Session log */}
      <div className="card !p-0 overflow-hidden">
        <div className="section-header !mb-0 border-b-0 px-5 pt-5 pb-3">
          <h2 className="label">Session Log</h2>
          <p className="text-xs text-zinc-600">drag fixed at 104</p>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="bg-surface-2">
              <th className="label py-2.5 pl-5 pr-4 text-left">Date</th>
              <th className="label py-2.5 pr-4 text-left">Program</th>
              <th className="label py-2.5 pr-4 text-right">Dist</th>
              <th className="label py-2.5 pr-4 text-right" style={{ color: CAT_ROWING }}>Split /500m</th>
              <th className="label py-2.5 pr-4 text-right" style={{ color: POWER }}>Watts</th>
              <th className="label py-2.5 pr-4 text-right">SPM</th>
              <th className="label py-2.5 pr-5 text-right">Avg HR</th>
            </tr>
          </thead>
          <tbody>
            {[...sessions].reverse().map((s, i) => (
              <tr key={s.uuid} className={`border-b border-surface-3/40 ${i % 2 === 1 ? 'bg-surface-0/40' : ''}`}>
                <td className="py-2.5 pl-5 pr-4 text-zinc-400 mono-stat text-xs">{s.date}</td>
                <td className="py-2.5 pr-4 text-zinc-300">{s.rowing_program ?? '—'}</td>
                <td className="py-2.5 pr-4 text-zinc-300 mono-stat text-right">{s.rowing_distance_m ? `${s.rowing_distance_m}m` : '—'}</td>
                <td className="py-2.5 pr-4 mono-stat text-right text-base font-semibold" style={{ color: CAT_ROWING }}>{s.rowing_avg_split ?? '—'}</td>
                <td className="py-2.5 pr-4 mono-stat text-right" style={{ color: POWER }}>{s.rowing_avg_watts ? `${s.rowing_avg_watts}W` : '—'}</td>
                <td className="py-2.5 pr-4 mono-stat text-right text-zinc-400">{s.rowing_stroke_rate_spm ?? '—'}</td>
                <td className="py-2.5 pr-5 mono-stat text-right text-zinc-400">{s.avg_hr ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

    </div>
  )
}
