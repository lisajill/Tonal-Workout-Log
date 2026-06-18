import {
  ComposedChart, Area, Scatter, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts'
import cardioLog from '../data/zone2_log.json'

// Category coding (design.md): strength metrics in the violet family, rowing in sky
const CAT_STRENGTH = '#a78bfa'
const CAT_ROWING   = '#38bdf8'
const CAT_PR       = '#f472b6'
const SHOT         = '#f59e0b'

const AXIS_TICK = { fill: '#71717a', fontSize: 10, fontFamily: '"JetBrains Mono", monospace' }
const GRID = { stroke: '#232327', vertical: false }

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function shortDate(d) {
  const [, m, day] = d.split('-')
  return `${parseInt(m)}/${parseInt(day)}`
}

function weekdayIdx(d) {
  const [y, m, dd] = d.split('-').map(Number)
  return new Date(y, m - 1, dd).getDay()
}

// Shot days: explicit flag wins; otherwise Thursdays (current weekly protocol)
function isShotDay(s) {
  if (s.shot_day === true) return true
  if (s.shot_day === false) return false
  return weekdayIdx(s.date) === 4
}

function hasPR(s) {
  return Object.values(s.prs ?? {}).some(p => p.weight != null)
    || s.movements?.some(m => m.sets.some(t => t.prs?.length) || m.warmup_prs?.length)
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

const FMT = {
  volume:      v => `${v.toLocaleString()} lbs`,
  ma3:         v => `${Math.round(v).toLocaleString()} lbs (3-session avg)`,
  prVol:       () => 'PR session',
  vol_per_min: v => `${v} lbs/min`,
  avg_hr:      v => `${v} bpm`,
  max_hr:      v => `${v} bpm`,
  rating:      v => `${v} / 5`,
  reps:        v => `${v.toLocaleString()} reps`,
  calories:    v => `${v} kcal`,
  kj:          v => `${v} kJ`,
  duration:    v => `${v} min`,
  tut:         v => `${v} min`,
  avgVolume:   v => `${Math.round(v).toLocaleString()} lbs avg`,
  split_sec:   v => `${fmtSplit(v)} /500m`,
  watts:       v => `${v} W`,
  distance:    v => `${v} m`,
}

const NAMES = {
  volume: 'Volume', ma3: 'Trend', prVol: 'PR', vol_per_min: 'Density',
  avg_hr: 'Avg HR', max_hr: 'Max HR', rating: 'Rating', reps: 'Reps',
  calories: 'Calories', kj: 'Work', duration: 'Duration', tut: 'TUT',
  avgVolume: 'Avg volume', split_sec: 'Split', watts: 'Watts', distance: 'Distance',
}

function Tip({ active, payload, label, meta }) {
  if (!active || !payload?.length) return null
  const m = meta?.[label]
  return (
    <div className="rounded-lg border border-surface-3 bg-surface-1/95 px-3 py-2 shadow-lg backdrop-blur">
      <p className="mono-stat text-[11px] font-semibold text-zinc-200">
        {m?.date ?? label}{m?.shot ? ' · 💉 shot day' : ''}
      </p>
      {m?.workout && <p className="text-[11px] text-zinc-500 max-w-[200px] truncate">{m.workout}</p>}
      <div className="mt-1 space-y-0.5">
        {payload.filter(p => p.value != null).map(p => (
          <p key={p.dataKey} className="flex items-center gap-1.5 text-[11px]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color ?? p.fill }} />
            <span className="text-zinc-500">{NAMES[p.dataKey] ?? p.name}</span>
            <span className="mono-stat ml-auto pl-3 font-semibold text-zinc-100">
              {(FMT[p.dataKey] ?? (v => v))(p.value)}
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}

export default function Charts({ sessions: rawSessions }) {
  const sessions = [...rawSessions].sort((a, b) => (a.timestamp ?? a.date).localeCompare(b.timestamp ?? b.date))

  const rowingData = [...cardioLog]
    .filter(s => s.activity === 'Rowing' && s.rowing_avg_split)
    .sort((a, b) => (a.timestamp ?? a.date).localeCompare(b.timestamp ?? b.date))
    .map(s => ({
      label: shortDate(s.date),
      date: s.date,
      split_sec: parseSplitSecs(s.rowing_avg_split),
      watts: s.rowing_avg_watts ?? null,
      distance: s.rowing_distance_m ?? null,
    }))

  const dateSeen = {}
  const data = sessions.map(s => {
    const base = shortDate(s.date)
    dateSeen[base] = (dateSeen[base] ?? 0) + 1
    const label = dateSeen[base] > 1 ? `${base}+` : base
    return {
      label,
      shot: isShotDay(s),
      pr: hasPR(s),
      date: s.date,
      workout: s.workout,
      volume: s.total_volume,
      vol_per_min: s.total_volume && s.duration ? Math.round(s.total_volume / s.duration) : null,
      reps: s.total_reps,
      avg_hr: s.avg_hr,
      max_hr: s.max_hr,
      rating: s.subjective_rating,
      duration: s.duration,
      tut: s.time_under_tension,
      calories: s.calories,
      kj: s.total_work_kj,
    }
  })

  // 3-session moving average + PR overlay for the hero chart
  data.forEach((d, i) => {
    const win = data.slice(Math.max(0, i - 2), i + 1).map(x => x.volume).filter(v => v != null)
    d.ma3 = win.length ? Math.round(win.reduce((a, b) => a + b, 0) / win.length) : null
    d.prVol = d.pr ? d.volume : null
  })

  const meta = Object.fromEntries(data.map(d => [d.label, d]))
  const shotLabels = data.filter(d => d.shot).map(d => d.label)

  // ── Insights ──────────────────────────────────────────────────────
  const vols = data.map(d => d.volume).filter(v => v != null)
  const last4 = vols.slice(-4), prev4 = vols.slice(-8, -4)
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length
  const volTrend = prev4.length === 4 ? Math.round(((avg(last4) - avg(prev4)) / avg(prev4)) * 100) : null
  const best = data.reduce((b, d) => (d.volume ?? 0) > (b.volume ?? 0) ? d : b, data[0])
  const bestDensity = data.reduce((b, d) => (d.vol_per_min ?? 0) > (b.vol_per_min ?? 0) ? d : b, data[0])
  const prCount = data.filter(d => d.pr).length
  const avgRating = (sessions.reduce((s, r) => s + (r.subjective_rating ?? 0), 0) / sessions.filter(s => s.subjective_rating != null).length).toFixed(1)

  // ── Shot day effect ───────────────────────────────────────────────
  const shotSessions = data.filter(d => d.shot)
  const otherSessions = data.filter(d => !d.shot)
  const cmp = (arr, key) => {
    const vals = arr.map(d => d[key]).filter(v => v != null)
    return vals.length ? avg(vals) : null
  }
  const shotStats  = { rating: cmp(shotSessions, 'rating'),  volume: cmp(shotSessions, 'volume'),  n: shotSessions.length }
  const otherStats = { rating: cmp(otherSessions, 'rating'), volume: cmp(otherSessions, 'volume'), n: otherSessions.length }
  const ratingHolds = shotStats.rating != null && otherStats.rating != null && shotStats.rating >= otherStats.rating - 0.25

  // ── Weekday profile ───────────────────────────────────────────────
  const weekdayData = WEEKDAYS.map((name, i) => {
    const days = data.filter(d => weekdayIdx(d.date) === i)
    return {
      label: i === 4 ? `${name} 💉` : name,
      avgVolume: days.length ? avg(days.map(d => d.volume ?? 0)) : 0,
      n: days.length,
      isShot: i === 4,
    }
  })
  // need at least 2 sessions on a weekday before calling it "your biggest day"
  const established = weekdayData.filter(d => d.n >= 2)
  const bestWeekday = (established.length ? established : weekdayData)
    .reduce((b, d) => d.avgVolume > b.avgVolume ? d : b, established[0] ?? weekdayData[0])

  return (
    <div className="space-y-5">
      <h1 className="font-semibold text-3xl text-zinc-100">Charts</h1>

      {/* Insight chips */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="stat-card" style={{ borderLeftColor: volTrend == null || volTrend >= 0 ? '#34d399' : '#f87171' }}>
          <p className="label">Volume Trend</p>
          <p className={`mono-stat mt-1 text-2xl font-bold ${volTrend == null ? 'text-zinc-100' : volTrend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {volTrend == null ? '—' : `${volTrend >= 0 ? '↑' : '↓'} ${Math.abs(volTrend)}%`}
          </p>
          <p className="text-[11px] text-zinc-500">last 4 sessions vs prior 4</p>
        </div>
        <div className="stat-card" style={{ borderLeftColor: CAT_STRENGTH }}>
          <p className="label">Biggest Session</p>
          <p className="mono-stat mt-1 text-2xl font-bold text-zinc-100">{best.volume?.toLocaleString()}</p>
          <p className="text-[11px] text-zinc-500">lbs · {best.date}</p>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#818cf8' }}>
          <p className="label">Peak Density</p>
          <p className="mono-stat mt-1 text-2xl font-bold text-zinc-100">{bestDensity.vol_per_min}</p>
          <p className="text-[11px] text-zinc-500">lbs/min · {bestDensity.date}</p>
        </div>
        <div className="stat-card" style={{ borderLeftColor: CAT_PR }}>
          <p className="label">PR Sessions</p>
          <p className="mono-stat mt-1 text-2xl font-bold" style={{ color: CAT_PR }}>{prCount} <span className="text-sm text-zinc-500 font-medium">/ {data.length}</span></p>
          <p className="text-[11px] text-zinc-500">avg rating {avgRating} / 5</p>
        </div>
      </div>

      {/* Hero — volume + trend + PR markers + shot days */}
      <ChartCard
        title="Training Volume"
        subtitle="Per session, with 3-session trend line"
        legend={[
          ['area', CAT_STRENGTH, 'Volume'],
          ['line', '#e4e4e7', 'Trend'],
          ['dot', CAT_PR, 'PR session'],
          ['dash', SHOT, '💉 Shot day'],
        ]}
      >
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="gradVol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CAT_STRENGTH} stopOpacity={0.55} />
                <stop offset="100%" stopColor={CAT_STRENGTH} stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<Tip meta={meta} />} cursor={{ stroke: '#3f3f46' }} />
            {shotLabels.map(l => (
              <ReferenceLine key={l} x={l} stroke={SHOT} strokeOpacity={0.35} strokeDasharray="3 3" />
            ))}
            <Area isAnimationActive={false} type="monotone" dataKey="volume" stroke={CAT_STRENGTH} strokeWidth={2} fill="url(#gradVol)" activeDot={{ r: 4 }} />
            <Line isAnimationActive={false} type="monotone" dataKey="ma3" stroke="#e4e4e7" strokeWidth={1.5} strokeDasharray="5 3" dot={false} activeDot={false} />
            {/* null prVol (non-PR session) must render nothing — NaN cy pins circles to the SVG top */}
            <Scatter isAnimationActive={false} dataKey="prVol" fill={CAT_PR} shape={p => (
              p.payload?.prVol == null ? <g /> : <circle cx={p.cx} cy={p.cy} r={4.5} fill={CAT_PR} stroke="#0f0f11" strokeWidth={1.5} />
            )} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Weekday profile */}
        <ChartCard
          title="Weekday Profile"
          subtitle={`Avg volume by day — ${bestWeekday.label.replace(' 💉', '')}s are your biggest day`}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekdayData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barCategoryGap="25%">
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<Tip meta={Object.fromEntries(weekdayData.map(d => [d.label, { date: `${d.label} · ${d.n} session${d.n !== 1 ? 's' : ''}` }]))} />} cursor={{ fill: '#242428', opacity: 0.5 }} />
              <Bar isAnimationActive={false} dataKey="avgVolume" radius={[6, 6, 0, 0]} maxBarSize={42}>
                {weekdayData.map((d, i) => (
                  <Cell key={i} fill={d.isShot ? SHOT : CAT_STRENGTH} fillOpacity={d.n === 0 ? 0.15 : 0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Shot day effect */}
        <div className="card">
          <div className="section-header">
            <div>
              <h2 className="label">Shot Day Effect</h2>
              <p className="text-xs text-zinc-500 mt-1">GLP-1 injection days (💉 Thursdays) vs everything else</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CompareCol title="💉 Shot days" n={shotStats.n} rating={shotStats.rating} volume={shotStats.volume} color={SHOT}
              maxVolume={Math.max(shotStats.volume ?? 0, otherStats.volume ?? 0)} />
            <CompareCol title="Other days" n={otherStats.n} rating={otherStats.rating} volume={otherStats.volume} color={CAT_STRENGTH}
              maxVolume={Math.max(shotStats.volume ?? 0, otherStats.volume ?? 0)} />
          </div>
          {ratingHolds && (
            <p className="mt-4 rounded-lg bg-amber-950/30 border border-amber-900/40 px-3 py-2 text-xs text-amber-200/90">
              Your session ratings hold up on shot days ({shotStats.rating?.toFixed(1)} vs {otherStats.rating?.toFixed(1)}) —
              the injection isn't an excuse, and you've proven it {shotStats.n} times.
            </p>
          )}
        </div>

        {/* Density */}
        <ChartCard title="Training Density" subtitle="Lbs lifted per minute on the machine">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barCategoryGap="30%">
              <defs>
                <linearGradient id="gradDen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.35} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip meta={meta} />} cursor={{ fill: '#242428', opacity: 0.5 }} />
              <Bar isAnimationActive={false} dataKey="vol_per_min" fill="url(#gradDen)" radius={[5, 5, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Rating */}
        <ChartCard title="Session Rating" subtitle={`Subjective feel — all-time average ${avgRating}`}>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="gradRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CAT_PR} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={CAT_PR} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[2, 5]} ticks={[2, 3, 4, 5]} />
              <Tooltip content={<Tip meta={meta} />} cursor={{ stroke: '#3f3f46' }} />
              <ReferenceLine y={parseFloat(avgRating)} stroke="#52525b" strokeDasharray="4 2" />
              <Area isAnimationActive={false} type="monotone" dataKey="rating" stroke={CAT_PR} strokeWidth={2} fill="url(#gradRate)" connectNulls activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Heart rate with Z2 band */}
        <ChartCard title="Heart Rate" subtitle="Avg + max per session — emerald band = Zone 2 (108–125)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={['dataMin - 8', 'dataMax + 8']} />
              <Tooltip content={<Tip meta={meta} />} cursor={{ stroke: '#3f3f46' }} />
              <ReferenceArea y1={108} y2={125} fill="#34d399" fillOpacity={0.07} stroke="#34d399" strokeOpacity={0.2} strokeDasharray="3 3" />
              <Line isAnimationActive={false} type="monotone" dataKey="avg_hr" stroke="#34d399" strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls />
              <Line isAnimationActive={false} type="monotone" dataKey="max_hr" stroke="#f87171" strokeWidth={1.5} strokeDasharray="4 2" dot={false} activeDot={{ r: 4 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Reps */}
        <ChartCard title="Total Reps" subtitle="Repetitions completed per session">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barCategoryGap="30%">
              <defs>
                <linearGradient id="gradReps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#c4b5fd" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip meta={meta} />} cursor={{ fill: '#242428', opacity: 0.5 }} />
              <Bar isAnimationActive={false} dataKey="reps" fill="url(#gradReps)" radius={[5, 5, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Calories & work */}
        <ChartCard title="Calories & Work" subtitle="Energy expenditure per session">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barCategoryGap="25%" barGap={2}>
              <defs>
                <linearGradient id="gradCal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#f87171" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="gradKj" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb923c" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#fb923c" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip meta={meta} />} cursor={{ fill: '#242428', opacity: 0.5 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#71717a' }} formatter={v => NAMES[v] ?? v} iconType="circle" iconSize={7} />
              <Bar isAnimationActive={false} dataKey="calories" fill="url(#gradCal)" radius={[5, 5, 0, 0]} maxBarSize={20} />
              <Bar isAnimationActive={false} dataKey="kj" fill="url(#gradKj)" radius={[5, 5, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Duration vs TUT */}
        <ChartCard title="Duration vs Time Under Tension" subtitle="Session length vs actual working time">
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="gradDur" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradTut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0891b2" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip meta={meta} />} cursor={{ stroke: '#3f3f46' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#71717a' }} formatter={v => NAMES[v] ?? v} iconType="circle" iconSize={7} />
              <Area isAnimationActive={false} type="monotone" dataKey="duration" stroke="#22d3ee" strokeWidth={2} fill="url(#gradDur)" activeDot={{ r: 4 }} />
              <Area isAnimationActive={false} type="monotone" dataKey="tut" stroke="#0891b2" strokeWidth={2} fill="url(#gradTut)" activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Rowing charts */}
      {rowingData.length > 0 && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <span className="font-semibold text-xl" style={{ color: CAT_ROWING }}>Rowing</span>
            <div className="flex-1 h-px bg-surface-3" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Split /500m" subtitle="Lower is faster — axis flipped so up = improving">
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={rowingData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gradSplit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CAT_ROWING} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={CAT_ROWING} stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} reversed tickFormatter={v => fmtSplit(v)} domain={['auto', 'auto']} />
                  <Tooltip content={<Tip meta={Object.fromEntries(rowingData.map(d => [d.label, d]))} />} cursor={{ stroke: '#3f3f46' }} />
                  <Area isAnimationActive={false} type="monotone" dataKey="split_sec" stroke={CAT_ROWING} strokeWidth={2} fill="url(#gradSplit)" activeDot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Avg Peak Power" subtitle="Watts per rowing session">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={rowingData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} unit="W" domain={['auto', 'auto']} />
                  <Tooltip content={<Tip meta={Object.fromEntries(rowingData.map(d => [d.label, d]))} />} cursor={{ stroke: '#3f3f46' }} />
                  <Line isAnimationActive={false} type="monotone" dataKey="watts" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4.5 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Rowing Distance" subtitle="Meters per session">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={rowingData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barCategoryGap="35%">
                <defs>
                  <linearGradient id="gradDist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CAT_ROWING} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={CAT_ROWING} stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} unit="m" domain={['auto', 'auto']} />
                <Tooltip content={<Tip meta={Object.fromEntries(rowingData.map(d => [d.label, d]))} />} cursor={{ fill: '#242428', opacity: 0.5 }} />
                <Bar isAnimationActive={false} dataKey="distance" fill="url(#gradDist)" radius={[5, 5, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}

    </div>
  )
}

function CompareCol({ title, n, rating, volume, color, maxVolume }) {
  return (
    <div className="rounded-lg bg-surface-2/60 px-4 py-3">
      <p className="label !text-[10px] mb-2" style={{ color }}>{title}</p>
      <p className="mono-stat text-[11px] text-zinc-600 mb-3">{n} sessions</p>
      <div className="space-y-3">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="label !text-[9px]">Avg rating</span>
            <span className="mono-stat text-base font-bold text-zinc-100">{rating != null ? rating.toFixed(1) : '—'}</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-surface-3">
            <div className="h-1.5 rounded-full" style={{ width: `${((rating ?? 0) / 5) * 100}%`, backgroundColor: color }} />
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <span className="label !text-[9px]">Avg volume</span>
            <span className="mono-stat text-base font-bold text-zinc-100">{volume != null ? Math.round(volume).toLocaleString() : '—'}</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-surface-3">
            <div className="h-1.5 rounded-full" style={{ width: `${maxVolume ? ((volume ?? 0) / maxVolume) * 100 : 0}%`, backgroundColor: color }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, legend, children }) {
  return (
    <div className="card">
      <div className="section-header">
        <div>
          <h2 className="label">{title}</h2>
          {subtitle && <p className="text-zinc-500 text-xs mt-1">{subtitle}</p>}
        </div>
        {legend && (
          <div className="hidden sm:flex items-center gap-3">
            {legend.map(([kind, color, name]) => (
              <span key={name} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                {kind === 'dot' && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
                {kind === 'area' && <span className="h-2 w-3 rounded-sm" style={{ backgroundColor: color, opacity: 0.6 }} />}
                {kind === 'line' && <span className="h-0.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />}
                {kind === 'dash' && <span className="h-2.5 w-0 border-l border-dashed" style={{ borderColor: color }} />}
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
