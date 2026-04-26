import cardioLog from '../data/zone2_log.json'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LabelList, Cell,
  LineChart, Line, Legend,
} from 'recharts'

const WEEKLY_Z2_TARGET = 150
const ZONE_COLORS = {
  zone1: '#3f3f46',
  zone2: '#6366f1',
  zone3: '#f59e0b',
  zone4: '#ef4444',
}
const ZONE_LABELS = {
  zone1: 'Warm Up',
  zone2: 'Fat Burn',
  zone3: 'Cardio',
  zone4: 'Peak',
}
const TOOLTIP_STYLE = {
  contentStyle: { background: '#18181b', border: '1px solid #303036', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#a1a1aa', marginBottom: 4 },
  itemStyle: { color: '#e4e4e7' },
  cursor: false,
}
const AXIS_TICK = { fill: '#71717a', fontSize: 11 }
const GRID = { strokeDasharray: '3 3', stroke: '#303036' }

function getMonday(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().slice(0, 10)
}

function shortDate(d) {
  const [, m, day] = d.split('-')
  return `${parseInt(m)}/${parseInt(day)}`
}

function activityIcon(activity) {
  const a = activity.toLowerCase()
  if (a.includes('walk')) return '🚶'
  if (a.includes('row')) return '🚣'
  if (a.includes('run')) return '🏃'
  if (a.includes('bike') || a.includes('cycl')) return '🚴'
  return '💪'
}

export default function CardioTracker() {
  const isEmpty = cardioLog.length === 0

  // Weekly aggregates
  const weekMap = {}
  for (const s of cardioLog) {
    const week = getMonday(s.date)
    if (!weekMap[week]) weekMap[week] = { week, zone1: 0, zone2: 0, zone3: 0, zone4: 0, total: 0, sessions: 0 }
    weekMap[week].zone1 += s.zone1_min ?? 0
    weekMap[week].zone2 += s.zone2_min ?? 0
    weekMap[week].zone3 += s.zone3_min ?? 0
    weekMap[week].zone4 += s.zone4_min ?? 0
    weekMap[week].total += s.duration_min ?? 0
    weekMap[week].sessions += 1
  }
  const weeks = Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week))

  // Current week
  const thisWeek = getMonday(new Date().toISOString().slice(0, 10))
  const currentWeek = weekMap[thisWeek] ?? { zone2: 0, total: 0, sessions: 0 }
  const z2pct = Math.min(100, Math.round((currentWeek.zone2 / WEEKLY_Z2_TARGET) * 100))

  // All sessions sorted desc
  const allSessions = [...cardioLog].sort((a, b) => b.date.localeCompare(a.date))

  // Activity breakdown (all time)
  const activityMap = {}
  for (const s of cardioLog) {
    activityMap[s.activity] = (activityMap[s.activity] ?? 0) + (s.zone2_min ?? 0)
  }

  // HR trend (sessions with avg_hr)
  const hrData = allSessions.filter(s => s.avg_hr).reverse().map(s => ({
    label: shortDate(s.date),
    avg_hr: s.avg_hr,
    date: s.date,
  }))

  return (
    <div className="space-y-5">

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card flex flex-col gap-1">
          <span className="label">This Week Z2</span>
          <span className={`text-3xl font-bold tabular-nums ${currentWeek.zone2 >= WEEKLY_Z2_TARGET ? 'text-emerald-400' : 'text-accent'}`}>
            {Math.round(currentWeek.zone2)}m
          </span>
          <span className="text-xs text-zinc-500">of {WEEKLY_Z2_TARGET} min target</span>
          <div className="w-full bg-surface-2 rounded-full h-1.5 mt-1">
            <div
              className={`h-1.5 rounded-full transition-all ${currentWeek.zone2 >= WEEKLY_Z2_TARGET ? 'bg-emerald-400' : 'bg-accent'}`}
              style={{ width: `${z2pct}%` }}
            />
          </div>
          <span className="text-xs text-zinc-600">{z2pct}%</span>
        </div>

        <div className="card flex flex-col gap-1">
          <span className="label">This Week Total</span>
          <span className="text-3xl font-bold tabular-nums text-zinc-200">
            {Math.round(currentWeek.total)}m
          </span>
          <span className="text-xs text-zinc-500">{currentWeek.sessions} session{currentWeek.sessions !== 1 ? 's' : ''}</span>
        </div>

        <div className="card flex flex-col gap-1">
          <span className="label">All-Time Z2</span>
          <span className="text-3xl font-bold tabular-nums text-accent">
            {Math.round(cardioLog.reduce((s, e) => s + (e.zone2_min ?? 0), 0))}m
          </span>
          <span className="text-xs text-zinc-500">{cardioLog.length} sessions</span>
        </div>

        <div className="card flex flex-col gap-1">
          <span className="label">All-Time Distance</span>
          <span className="text-3xl font-bold tabular-nums text-zinc-200">
            {cardioLog.reduce((s, e) => s + (e.distance_mi ?? 0), 0).toFixed(1)}
          </span>
          <span className="text-xs text-zinc-500">miles</span>
        </div>
      </div>

      {/* Weekly stacked zone chart */}
      <div className="card">
        <div className="mb-4">
          <h2 className="label">Weekly Zone Distribution</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Minutes per zone by week — indigo bar = Zone 2 (Fat Burn, target 150 min)</p>
        </div>
        {isEmpty ? (
          <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeks.map(w => ({ ...w, label: shortDate(w.week) }))} margin={{ top: 16, right: 16, bottom: 0, left: 0 }} barCategoryGap="30%">
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} unit="m" />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(v, name) => [`${Math.round(v)} min`, ZONE_LABELS[name] ?? name]}
              />
              <Legend formatter={name => ZONE_LABELS[name] ?? name} wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
              <ReferenceLine y={WEEKLY_Z2_TARGET} stroke="#6366f1" strokeDasharray="4 2"
                label={{ value: `Z2 target ${WEEKLY_Z2_TARGET}m`, fill: '#6366f1', fontSize: 10, position: 'insideTopRight' }} />
              <Bar dataKey="zone1" stackId="a" fill={ZONE_COLORS.zone1} />
              <Bar dataKey="zone2" stackId="a" fill={ZONE_COLORS.zone2} />
              <Bar dataKey="zone3" stackId="a" fill={ZONE_COLORS.zone3} />
              <Bar dataKey="zone4" stackId="a" fill={ZONE_COLORS.zone4} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* HR trend */}
      {hrData.length > 1 && (
        <div className="card">
          <div className="mb-4">
            <h2 className="label">Avg Heart Rate Trend</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Same effort at lower HR = improving aerobic fitness</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={hrData} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} unit=" bpm" domain={['auto', 'auto']} />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={v => [`${v} bpm`, 'Avg HR']}
                labelFormatter={label => {
                  const row = hrData.find(r => r.label === label)
                  return row ? row.date : label
                }}
              />
              <ReferenceLine y={108} stroke="#6366f1" strokeDasharray="3 2"
                label={{ value: 'Z2 floor 108', fill: '#6366f1', fontSize: 10, position: 'insideTopRight' }} />
              <Line type="monotone" dataKey="avg_hr" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 5 }}>
                <LabelList dataKey="avg_hr" position="top" style={{ fill: '#a1a1aa', fontSize: 10 }} formatter={v => `${v}`} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Session log */}
      <div className="card">
        <h2 className="label mb-4">Session Log</h2>
        {isEmpty ? (
          <p className="text-zinc-600 text-sm">No sessions logged yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-3">
                <th className="label pb-2 pr-4 text-left">Date</th>
                <th className="label pb-2 pr-4 text-left">Activity</th>
                <th className="label pb-2 pr-4 text-right">Duration</th>
                <th className="label pb-2 pr-4 text-right" style={{ color: ZONE_COLORS.zone2 }}>Z2</th>
                <th className="label pb-2 pr-4 text-right" style={{ color: ZONE_COLORS.zone3 }}>Z3</th>
                <th className="label pb-2 pr-4 text-right" style={{ color: ZONE_COLORS.zone4 }}>Z4</th>
                <th className="label pb-2 pr-4 text-right">Avg HR</th>
                <th className="label pb-2 text-right">Miles</th>
              </tr>
            </thead>
            <tbody>
              {allSessions.map(s => (
                <tr key={s.uuid} className="border-b border-surface-3/40">
                  <td className="py-2.5 pr-4 text-zinc-400 tabular-nums">{s.date}</td>
                  <td className="py-2.5 pr-4 text-zinc-200">{activityIcon(s.activity)} {s.activity}</td>
                  <td className="py-2.5 pr-4 text-zinc-400 tabular-nums text-right">{s.duration_min}m</td>
                  <td className="py-2.5 pr-4 tabular-nums text-right">
                    <span className={s.zone2_min > 0 ? 'font-semibold' : 'text-zinc-600'} style={s.zone2_min > 0 ? { color: ZONE_COLORS.zone2 } : {}}>
                      {s.zone2_min > 0 ? `${s.zone2_min}m` : '—'}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 tabular-nums text-right text-zinc-500">
                    {s.zone3_min > 0 ? `${s.zone3_min}m` : '—'}
                  </td>
                  <td className="py-2.5 pr-4 tabular-nums text-right text-zinc-500">
                    {s.zone4_min > 0 ? `${s.zone4_min}m` : '—'}
                  </td>
                  <td className="py-2.5 pr-4 text-zinc-400 tabular-nums text-right">{s.avg_hr ? `${s.avg_hr}` : '—'}</td>
                  <td className="py-2.5 text-zinc-400 tabular-nums text-right">{s.distance_mi ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-zinc-600">
        Tracking began <span className="text-zinc-500">Apr 19, 2026</span> via Zones for Training. Walking automation exports automatically; Tonal sessions exported manually. Then run <code className="bg-surface-2 px-1 rounded">npm run import-zone2</code> to sync.
      </p>
    </div>
  )
}
