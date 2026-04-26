import zone2Log from '../data/zone2_log.json'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, LabelList, Cell,
} from 'recharts'

const WEEKLY_TARGET = 150
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

export default function Zone2Tracker() {
  // Group by week
  const weekMap = {}
  for (const entry of zone2Log) {
    const week = getMonday(entry.date)
    if (!weekMap[week]) weekMap[week] = { week, zone2_min: 0, sessions: 0, activities: {} }
    weekMap[week].zone2_min += entry.zone2_min
    weekMap[week].sessions += 1
    weekMap[week].activities[entry.activity] = (weekMap[week].activities[entry.activity] ?? 0) + 1
  }

  const weeks = Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week))

  // Current week
  const thisWeek = getMonday(new Date().toISOString().slice(0, 10))
  const currentWeekData = weekMap[thisWeek] ?? { zone2_min: 0, sessions: 0 }
  const pct = Math.min(100, Math.round((currentWeekData.zone2_min / WEEKLY_TARGET) * 100))

  // All sessions sorted desc
  const allSessions = [...zone2Log].sort((a, b) => b.date.localeCompare(a.date))

  const isEmpty = zone2Log.length === 0

  return (
    <div className="space-y-5">

      {/* Current week ring */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card sm:col-span-1 flex flex-col items-center justify-center gap-2 py-6">
          <p className="label">This Week</p>
          <p className={`text-4xl font-bold tabular-nums ${currentWeekData.zone2_min >= WEEKLY_TARGET ? 'text-emerald-400' : 'text-accent'}`}>
            {currentWeekData.zone2_min}
          </p>
          <p className="text-xs text-zinc-500">of {WEEKLY_TARGET} min target</p>
          <div className="w-full bg-surface-2 rounded-full h-2 mt-1">
            <div
              className={`h-2 rounded-full transition-all ${currentWeekData.zone2_min >= WEEKLY_TARGET ? 'bg-emerald-400' : 'bg-accent'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600">{pct}% of goal</p>
        </div>

        <div className="card sm:col-span-2 flex flex-col gap-3">
          <h3 className="label">Zone 2 = 108–125 bpm during activity</h3>
          <p className="text-xs text-zinc-500">Target: 150 min/week (2.5 hrs). Your walks currently fall in Zone 1 — pick up the pace to get HR above 108 bpm consistently.</p>
          <p className="text-xs text-zinc-500">Hydrow rowing will be a strong Zone 2 source once you're cleared after May 4.</p>
          <div className="mt-auto flex items-center gap-4 text-xs text-zinc-400">
            <span><span className="text-accent font-semibold">{currentWeekData.sessions}</span> sessions this week</span>
            <span><span className="text-emerald-400 font-semibold">{zone2Log.length}</span> total logged</span>
          </div>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="card">
        <div className="mb-4">
          <h2 className="label">Zone 2 Minutes by Week</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Weekly totals vs 150 min target</p>
        </div>
        {isEmpty ? (
          <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">
            No data yet — export your first workout from Zones for Training after a walk.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeks.map(w => ({ ...w, label: shortDate(w.week) }))} margin={{ top: 24, right: 16, bottom: 0, left: 0 }} barCategoryGap="30%">
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} unit=" min" />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v} min`, 'Zone 2']} />
              <ReferenceLine y={WEEKLY_TARGET} stroke="#10b981" strokeDasharray="4 2"
                label={{ value: `target ${WEEKLY_TARGET}m`, fill: '#10b981', fontSize: 11, position: 'insideTopRight' }} />
              <Bar dataKey="zone2_min" radius={[4, 4, 0, 0]}>
                {weeks.map((w, i) => (
                  <Cell key={i} fill={w.zone2_min >= WEEKLY_TARGET ? '#10b981' : '#6366f1'} />
                ))}
                <LabelList dataKey="zone2_min" position="top" style={{ fill: '#a1a1aa', fontSize: 11 }} formatter={v => v > 0 ? `${v}m` : ''} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Session log */}
      <div className="card">
        <h2 className="label mb-4">Session Log</h2>
        {isEmpty ? (
          <p className="text-zinc-600 text-sm">No sessions logged yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-3">
                <th className="label pb-2 pr-6 text-left">Date</th>
                <th className="label pb-2 pr-6 text-left">Activity</th>
                <th className="label pb-2 pr-6 text-right">Duration</th>
                <th className="label pb-2 pr-6 text-right">Zone 2</th>
                <th className="label pb-2 pr-6 text-right">Avg HR</th>
                <th className="label pb-2 text-right">Distance</th>
              </tr>
            </thead>
            <tbody>
              {allSessions.map(s => (
                <tr key={s.uuid} className="border-b border-surface-3/40">
                  <td className="py-2.5 pr-6 text-zinc-400 tabular-nums">{s.date}</td>
                  <td className="py-2.5 pr-6 text-zinc-200">{s.activity}</td>
                  <td className="py-2.5 pr-6 text-zinc-400 tabular-nums text-right">{s.duration_min}m</td>
                  <td className="py-2.5 pr-6 tabular-nums text-right">
                    <span className={s.zone2_min > 0 ? 'text-emerald-400 font-semibold' : 'text-zinc-600'}>
                      {s.zone2_min > 0 ? `${s.zone2_min}m` : '—'}
                    </span>
                  </td>
                  <td className="py-2.5 pr-6 text-zinc-400 tabular-nums text-right">{s.avg_hr ? `${s.avg_hr} bpm` : '—'}</td>
                  <td className="py-2.5 text-zinc-400 tabular-nums text-right">{s.distance_mi ? `${s.distance_mi} mi` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-zinc-600">
        After each walk or row: open Zones for Training → tap the workout → share → export JSON → save to Zone2Sessions. Then run <code className="bg-surface-2 px-1 rounded">npm run import-zone2</code>.
      </p>
    </div>
  )
}
