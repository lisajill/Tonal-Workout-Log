import { Fragment, useState } from 'react'
import cardioLog from '../data/zone2_log.json'
import rawSessions from '../data/sessions.json'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ComposedChart, Area, Legend,
} from 'recharts'
import { AXIS, GRID, ChartTip } from './chartTheme.jsx'

const WEEKLY_Z2_TARGET = 150
const CAT_CARDIO = '#34d399' // emerald-400 — cardio category color (design.md)
const ZONE_COLORS = {
  zone1: '#3f3f46',
  zone2: CAT_CARDIO,
  zone3: '#f59e0b',
  zone4: '#ef4444',
}
const ZONE_LABELS = {
  zone1: 'Warm Up',
  zone2: 'Fat Burn',
  zone3: 'Cardio',
  zone4: 'Peak',
}
const ZONE_FMT = Object.fromEntries(['zone1', 'zone2', 'zone3', 'zone4'].map(z => [z, v => `${Math.round(v)} min`]))

function getWeekStart(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay() // 0=Sun
  const sun = new Date(y, m - 1, d - day)
  return `${sun.getFullYear()}-${String(sun.getMonth()+1).padStart(2,'0')}-${String(sun.getDate()).padStart(2,'0')}`
}

function shortDate(d) {
  const [, m, day] = d.split('-')
  return `${parseInt(m)}/${parseInt(day)}`
}

function weekLabel(weekStart) {
  const [y, m, d] = weekStart.split('-').map(Number)
  const sun = new Date(y, m - 1, d)
  const sat = new Date(y, m - 1, d + 6)
  const fmt = dt => `${dt.toLocaleString('default', { month: 'short' })} ${dt.getDate()}`
  return `${fmt(sun)} – ${fmt(sat)}`
}

function activityIcon(activity) {
  const a = activity.toLowerCase()
  if (a.includes('walk')) return '🚶'
  if (a.includes('row')) return '🚣'
  if (a.includes('run')) return '🏃'
  if (a.includes('bike') || a.includes('cycl')) return '🚴'
  return '💪'
}

const tonalVolumeByDate = rawSessions
  .filter(s => !s.merged_into && s.total_volume != null)
  .reduce((acc, s) => { acc[s.date] = (acc[s.date] ?? 0) + s.total_volume; return acc }, {})

export default function CardioTracker() {
  const isEmpty = cardioLog.length === 0

  // Weekly aggregates
  const weekMap = {}
  for (const s of cardioLog) {
    const week = getWeekStart(s.date)
    if (!weekMap[week]) weekMap[week] = { week, zone1: 0, zone2: 0, zone3: 0, zone4: 0, total: 0, sessions: 0 }
    weekMap[week].zone1 += s.zone1_min ?? 0
    weekMap[week].zone2 += s.zone2_min ?? 0
    weekMap[week].zone3 += s.zone3_min ?? 0
    weekMap[week].zone4 += s.zone4_min ?? 0
    weekMap[week].total += s.duration_min ?? 0
    weekMap[week].sessions += 1
  }
  const weeks = Object.values(weekMap).sort((a, b) => a.week.localeCompare(b.week))

  // Current calendar week (Sun–Sat) for the summary cards
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  const currentWeekStart = getWeekStart(todayStr)
  const thisWeekSessions = cardioLog.filter(s => s.date >= currentWeekStart)
  const currentWeek = {
    zone2:    thisWeekSessions.reduce((a, s) => a + (s.zone2_min ?? 0), 0),
    total:    thisWeekSessions.reduce((a, s) => a + (s.duration_min ?? 0), 0),
    sessions: thisWeekSessions.length,
  }
  const z2pct = Math.min(100, Math.round((currentWeek.zone2 / WEEKLY_Z2_TARGET) * 100))

  // All sessions sorted desc (most recent first) by timestamp ?? date
  const allSessions = [...cardioLog].sort((a, b) => (b.timestamp ?? b.date).localeCompare(a.timestamp ?? a.date))

  // Group sessions by calendar week (Sun–Sat), newest week first; sessions within each week also newest first
  const weeklyGroups = []
  const weekSessionMap = {}
  for (const s of allSessions) {
    const wk = getWeekStart(s.date)
    if (!weekSessionMap[wk]) {
      weekSessionMap[wk] = { weekStart: wk, sessions: [], totalMin: 0, z2Min: 0 }
      weeklyGroups.push(weekSessionMap[wk])
    }
    weekSessionMap[wk].sessions.push(s)
    weekSessionMap[wk].totalMin += s.duration_min ?? 0
    weekSessionMap[wk].z2Min += s.zone2_min ?? 0
  }

  const [openWeeks, setOpenWeeks] = useState(new Set())
  const toggleWeek = wk => setOpenWeeks(prev => {
    const next = new Set(prev)
    next.has(wk) ? next.delete(wk) : next.add(wk)
    return next
  })

  // HR trend (sessions with avg_hr) — chronological, oldest → newest
  const hrData = allSessions.filter(s => s.avg_hr).reverse().map(s => ({
    label: shortDate(s.date),
    avg_hr: s.avg_hr,
    date: s.date,
  }))

  return (
    <div className="space-y-5">

      <h1 className="font-display italic text-3xl text-cat-cardio">Cardio</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card flex items-center gap-4" style={{ borderLeftColor: CAT_CARDIO }}>
          {/* Weekly Z2 progress ring (design.md) */}
          <Z2Ring pct={z2pct} />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="label">This Week Z2</span>
            <span className={`mono-stat text-2xl font-bold ${currentWeek.zone2 >= WEEKLY_Z2_TARGET ? 'text-emerald-400' : 'text-zinc-100'}`}>
              {Math.round(currentWeek.zone2)}m
            </span>
            <span className="text-xs text-zinc-500">of {WEEKLY_Z2_TARGET} min target</span>
          </div>
        </div>

        <div className="stat-card flex flex-col gap-1" style={{ borderLeftColor: CAT_CARDIO }}>
          <span className="label">This Week Total</span>
          <span className="mono-stat text-3xl font-bold text-zinc-100">
            {Math.round(currentWeek.total)}m
          </span>
          <span className="text-xs text-zinc-500">all zones · {currentWeek.sessions} session{currentWeek.sessions !== 1 ? 's' : ''}</span>
        </div>

        <div className="stat-card flex flex-col gap-1" style={{ borderLeftColor: CAT_CARDIO }}>
          <span className="label">All-Time Z2</span>
          <span className="mono-stat text-3xl font-bold" style={{ color: CAT_CARDIO }}>
            {Math.round(cardioLog.reduce((s, e) => s + (e.zone2_min ?? 0), 0))}m
          </span>
          <span className="text-xs text-zinc-500">fat burn only · {cardioLog.length} sessions</span>
        </div>

        <div className="stat-card flex flex-col gap-1" style={{ borderLeftColor: CAT_CARDIO }}>
          <span className="label">All-Time Distance</span>
          <span className="mono-stat text-3xl font-bold text-zinc-100">
            {cardioLog.reduce((s, e) => s + (e.distance_mi ?? 0), 0).toFixed(1)}
          </span>
          <span className="text-xs text-zinc-500">miles</span>
        </div>
      </div>

      {/* Weekly stacked zone chart */}
      <div className="card">
        <div className="section-header">
          <div>
            <h2 className="label">Weekly Zone Distribution</h2>
            <p className="text-xs text-zinc-500 mt-1">Minutes per zone by week — emerald bar = Zone 2 (Fat Burn, target 150 min)</p>
          </div>
        </div>
        {isEmpty ? (
          <div className="flex items-center justify-center h-32 text-zinc-600 text-sm">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeks.map(w => ({ ...w, label: shortDate(w.week) }))} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barCategoryGap="30%">
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" {...AXIS} />
              <YAxis {...AXIS} unit="m" />
              <Tooltip content={<ChartTip names={ZONE_LABELS} formats={ZONE_FMT} />} cursor={{ fill: '#242428', opacity: 0.5 }} />
              <Legend formatter={name => ZONE_LABELS[name] ?? name} wrapperStyle={{ fontSize: 11, color: '#71717a' }} iconType="circle" iconSize={7} />
              <ReferenceLine y={WEEKLY_Z2_TARGET} stroke={CAT_CARDIO} strokeDasharray="4 2"
                label={{ value: `Z2 target ${WEEKLY_Z2_TARGET}m`, fill: CAT_CARDIO, fontSize: 10, position: 'insideTopRight' }} />
              <Bar isAnimationActive={false} dataKey="zone1" stackId="a" fill={ZONE_COLORS.zone1} maxBarSize={42} />
              <Bar isAnimationActive={false} dataKey="zone2" stackId="a" fill={ZONE_COLORS.zone2} maxBarSize={42} />
              <Bar isAnimationActive={false} dataKey="zone3" stackId="a" fill={ZONE_COLORS.zone3} maxBarSize={42} />
              <Bar isAnimationActive={false} dataKey="zone4" stackId="a" fill={ZONE_COLORS.zone4} radius={[4, 4, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* HR trend */}
      {hrData.length > 1 && (
        <div className="card">
          <div className="section-header">
            <div>
              <h2 className="label">Avg Heart Rate Trend</h2>
              <p className="text-xs text-zinc-500 mt-1">Same effort at lower HR = improving aerobic fitness</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={hrData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="gradCardioHr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" {...AXIS} interval="preserveStartEnd" minTickGap={28} />
              <YAxis {...AXIS} unit=" bpm" domain={['auto', 'auto']} />
              <Tooltip content={<ChartTip names={{ avg_hr: 'Avg HR' }} formats={{ avg_hr: v => `${v} bpm` }} />} cursor={{ stroke: '#3f3f46' }} />
              <ReferenceLine y={108} stroke={CAT_CARDIO} strokeDasharray="3 2"
                label={{ value: 'Z2 floor 108', fill: CAT_CARDIO, fontSize: 10, position: 'insideTopRight' }} />
              <Area isAnimationActive={false} type="monotone" dataKey="avg_hr" stroke="#f59e0b" strokeWidth={2} fill="url(#gradCardioHr)" dot={false} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Session log */}
      <div className="card !p-0 overflow-hidden">
        <div className="section-header !mb-0 border-b-0 px-5 pt-5 pb-3">
          <h2 className="label">Session Log</h2>
          <p className="text-xs text-zinc-600">grouped by week · Sun–Sat</p>
        </div>
        {isEmpty ? (
          <p className="text-zinc-600 text-sm px-5 pb-5">No sessions logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="bg-surface-2">
                <th className="label py-2.5 pl-5 pr-4 text-left">Date</th>
                <th className="label py-2.5 pr-4 text-left">Activity</th>
                <th className="label py-2.5 pr-4 text-right">Duration</th>
                <th className="label py-2.5 pr-4 text-right" style={{ color: ZONE_COLORS.zone2 }}>Z2</th>
                <th className="label py-2.5 pr-4 text-right" style={{ color: ZONE_COLORS.zone3 }}>Z3</th>
                <th className="label py-2.5 pr-4 text-right" style={{ color: ZONE_COLORS.zone4 }}>Z4</th>
                <th className="label py-2.5 pr-4 text-right">Avg HR</th>
                <th className="label py-2.5 pr-5 text-right">Dist / Vol</th>
              </tr>
            </thead>
            <tbody>
              {weeklyGroups.map((group, idx) => {
                const isCurrent = idx === 0
                const isOpen = isCurrent || openWeeks.has(group.weekStart)
                return (
                  <Fragment key={group.weekStart}>
                    <tr
                      className={`border-b border-surface-3 bg-cat-cardio/10 ${!isCurrent ? 'cursor-pointer hover:bg-cat-cardio/15 transition-colors' : ''}`}
                      onClick={!isCurrent ? () => toggleWeek(group.weekStart) : undefined}
                    >
                      <td colSpan={8} className="py-2 px-5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs" style={{ color: CAT_CARDIO }}>
                            {isCurrent ? 'This week' : weekLabel(group.weekStart)}
                          </span>
                          <div className="flex items-center gap-3 text-zinc-500 text-xs mono-stat">
                            <span>{Math.round(group.totalMin)}m total</span>
                            <span style={{ color: ZONE_COLORS.zone2 }}>{Math.round(group.z2Min)}m Z2</span>
                            <span>{group.sessions.length} session{group.sessions.length !== 1 ? 's' : ''}</span>
                            {!isCurrent && <span className="text-zinc-600">{isOpen ? '▲' : '▼'}</span>}
                          </div>
                        </div>
                      </td>
                    </tr>
                    {isOpen && group.sessions.map((s, si) => (
                      <tr key={s.uuid} className={`border-b border-surface-3/40 ${si % 2 === 1 ? 'bg-surface-0/40' : ''}`}>
                        <td className="py-2.5 pl-5 pr-4 text-zinc-400 mono-stat text-xs">{s.date}</td>
                        <td className="py-2.5 pr-4 text-zinc-200">
                          {activityIcon(s.activity)} {s.activity}
                          {s.notes && <span className="ml-1.5 text-[11px] text-amber-400/80">· {s.notes}</span>}
                        </td>
                        <td className="py-2.5 pr-4 text-zinc-400 mono-stat text-right">{s.duration_min}m</td>
                        <td className="py-2.5 pr-4 mono-stat text-right">
                          <span className={s.zone2_min > 0 ? 'font-semibold' : 'text-zinc-600'} style={s.zone2_min > 0 ? { color: ZONE_COLORS.zone2 } : {}}>
                            {s.zone2_min > 0 ? `${s.zone2_min}m` : '—'}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 mono-stat text-right text-zinc-500">
                          {s.zone3_min > 0 ? `${s.zone3_min}m` : '—'}
                        </td>
                        <td className="py-2.5 pr-4 mono-stat text-right text-zinc-500">
                          {s.zone4_min > 0 ? `${s.zone4_min}m` : '—'}
                        </td>
                        <td className="py-2.5 pr-4 text-zinc-400 mono-stat text-right">{s.avg_hr ? `${s.avg_hr}` : '—'}</td>
                        <td className="py-2.5 pr-5 text-zinc-400 mono-stat text-right">
                          {s.activity === 'Tonal'
                            ? (tonalVolumeByDate[s.date] ? `${tonalVolumeByDate[s.date].toLocaleString()} lbs` : '—')
                            : s.distance_mi != null ? `${s.distance_mi}mi`
                            : s.rowing_distance_m != null ? `${s.rowing_distance_m}m`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-600">
        Tracking began <span className="text-zinc-500">Apr 19, 2026</span> via Zones for Training. Walking automation exports automatically; Tonal sessions exported manually. Then run <code className="bg-surface-2 px-1 rounded">npm run import-zone2</code> to sync.
      </p>
    </div>
  )
}

function Z2Ring({ pct }) {
  const r = 20
  const c = 2 * Math.PI * r
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#303036" strokeWidth="5" />
        <circle
          cx="24" cy="24" r={r} fill="none"
          stroke={CAT_CARDIO} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="mono-stat absolute inset-0 flex items-center justify-center text-[11px] font-bold text-zinc-100">
        {pct}%
      </span>
    </div>
  )
}
