import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, LabelList,
} from 'recharts'
import cardioLog from '../data/zone2_log.json'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#18181b', border: '1px solid #303036', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#a1a1aa', marginBottom: 4 },
  itemStyle: { color: '#e4e4e7' },
  cursor: false,
}

const AXIS_TICK = { fill: '#71717a', fontSize: 11 }
const GRID = { strokeDasharray: '3 3', stroke: '#303036' }
const LABEL_STYLE = { fill: '#a1a1aa', fontSize: 11 }

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

export default function Charts({ sessions }) {
  const rowingData = [...cardioLog]
    .filter(s => s.activity === 'Rowing' && s.rowing_avg_split)
    .sort((a, b) => (a.timestamp ?? a.date).localeCompare(b.timestamp ?? b.date))
    .map(s => ({
      label: shortDate(s.date),
      date: s.date,
      split_sec: parseSplitSecs(s.rowing_avg_split),
      watts: s.rowing_avg_watts ?? null,
      distance: s.rowing_distance_m ?? null,
      spm: s.rowing_stroke_rate_spm ?? null,
    }))
  const dateSeen = {}
  const data = sessions.map(s => {
    const base = shortDate(s.date)
    dateSeen[base] = (dateSeen[base] ?? 0) + 1
    const label = dateSeen[base] > 1 ? `${base}+` : base
    return {
    date: label,
    shot_day: s.shot_day ?? false,
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
  }})

  const avgRating = (sessions.reduce((s, r) => s + r.subjective_rating, 0) / sessions.length).toFixed(1)
  const seenShot = new Set()
  const shotDates = data.filter(d => {
    if (!d.shot_day) return false
    const base = d.date.replace('+', '')
    if (seenShot.has(base)) return false
    seenShot.add(base)
    return true
  }).map(d => d.date)

  return (
    <div className="space-y-5">
      {/* Shot day legend if any */}
      {shotDates.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-400">
          <span>💉</span>
          <span>GLP-1 shot day marked on all charts — {shotDates.join(', ')}</span>
        </div>
      )}

      <ChartCard title="Volume Over Time" subtitle="Total lbs lifted per session">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 0 }} barCategoryGap="30%">
            <CartesianGrid {...GRID} />
            <XAxis dataKey="date" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} tickFormatter={v => `${(v / 1000).toFixed(1)}k`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v.toLocaleString()} lbs`, 'Volume']} />
            {shotDates.map(d => <ReferenceLine key={d} x={d} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '💉', position: 'insideTopLeft', fontSize: 11 }} />)}
            <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]} activeBar={{ fill: '#6366f1', opacity: 0.8 }}>
              <LabelList dataKey="volume" position="top" style={LABEL_STYLE} formatter={v => `${(v / 1000).toFixed(1)}k`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Volume per Minute" subtitle="Lbs lifted per minute on the machine — training density">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 0 }} barCategoryGap="30%">
            <CartesianGrid {...GRID} />
            <XAxis dataKey="date" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} unit=" lbs/m" />
            <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v} lbs/min`, 'Density']} />
            {shotDates.map(d => <ReferenceLine key={d} x={d} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '💉', position: 'insideTopLeft', fontSize: 11 }} />)}
            <Bar dataKey="vol_per_min" fill="#a78bfa" radius={[4, 4, 0, 0]} activeBar={{ fill: '#a78bfa', opacity: 0.8 }}>
              <LabelList dataKey="vol_per_min" position="top" style={LABEL_STYLE} formatter={v => `${v}`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Heart Rate" subtitle="Avg and max HR per session (bpm)">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="date" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} domain={['auto', 'auto']} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [`${v} bpm`, name === 'avg_hr' ? 'Avg HR' : 'Max HR']} />
            <Legend formatter={v => v === 'avg_hr' ? 'Avg HR' : 'Max HR'} wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
            {shotDates.map(d => <ReferenceLine key={d} x={d} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '💉', position: 'insideTopLeft', fontSize: 11 }} />)}
            <Line type="monotone" dataKey="avg_hr" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }}>
              <LabelList dataKey="avg_hr" position="top" style={LABEL_STYLE} formatter={v => `${v}`} />
            </Line>
            <Line type="monotone" dataKey="max_hr" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="4 2">
              <LabelList dataKey="max_hr" position="top" style={LABEL_STYLE} formatter={v => `${v}`} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Calories &amp; Work" subtitle="Energy expenditure per session">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 0 }} barCategoryGap="25%" barGap={4}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="date" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [name === 'calories' ? `${v} kcal` : `${v} kJ`, name === 'calories' ? 'Calories' : 'Total Work']} />
            <Legend formatter={v => v === 'calories' ? 'Calories (kcal)' : 'Total Work (kJ)'} wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
            {shotDates.map(d => <ReferenceLine key={d} x={d} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '💉', position: 'insideTopLeft', fontSize: 11 }} />)}
            <Bar dataKey="calories" fill="#f43f5e" radius={[4, 4, 0, 0]} activeBar={{ fill: '#f43f5e', opacity: 0.8 }}>
              <LabelList dataKey="calories" position="top" style={LABEL_STYLE} formatter={v => `${v}`} />
            </Bar>
            <Bar dataKey="kj" fill="#fb923c" radius={[4, 4, 0, 0]} activeBar={{ fill: '#fb923c', opacity: 0.8 }}>
              <LabelList dataKey="kj" position="top" style={LABEL_STYLE} formatter={v => `${v}kJ`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Session Rating" subtitle="Subjective feel out of 5">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="date" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
            <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v} / 5`, 'Rating']} />
            <ReferenceLine y={parseFloat(avgRating)} stroke="#52525b" strokeDasharray="4 2"
              label={{ value: `avg ${avgRating}`, fill: '#71717a', fontSize: 11, position: 'insideTopRight' }} />
            {shotDates.map(d => <ReferenceLine key={d} x={d} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '💉', position: 'insideTopLeft', fontSize: 11 }} />)}
            <Line type="monotone" dataKey="rating" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }}>
              <LabelList dataKey="rating" position="top" style={LABEL_STYLE} formatter={v => `${v}`} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Total Reps" subtitle="Repetitions completed per session">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 0 }} barCategoryGap="30%">
            <CartesianGrid {...GRID} />
            <XAxis dataKey="date" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} />
            <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v.toLocaleString()} reps`, 'Total Reps']} />
            {shotDates.map(d => <ReferenceLine key={d} x={d} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '💉', position: 'insideTopLeft', fontSize: 11 }} />)}
            <Bar dataKey="reps" fill="#34d399" radius={[4, 4, 0, 0]} activeBar={{ fill: '#34d399', opacity: 0.8 }}>
              <LabelList dataKey="reps" position="top" style={LABEL_STYLE} formatter={v => v?.toLocaleString()} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Duration vs Time Under Tension" subtitle="Total session time vs actual working time (min)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 0 }} barCategoryGap="25%" barGap={4}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="date" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} unit=" min" />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [`${v} min`, name === 'duration' ? 'Total Duration' : 'Time Under Tension']} />
            <Legend formatter={v => v === 'duration' ? 'Total Duration' : 'Time Under Tension'} wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
            {shotDates.map(d => <ReferenceLine key={d} x={d} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: '💉', position: 'insideTopLeft', fontSize: 11 }} />)}
            <Bar dataKey="duration" fill="#22d3ee" radius={[4, 4, 0, 0]} activeBar={{ fill: '#22d3ee', opacity: 0.8 }}>
              <LabelList dataKey="duration" position="top" style={LABEL_STYLE} formatter={v => `${v}m`} />
            </Bar>
            <Bar dataKey="tut" fill="#0891b2" radius={[4, 4, 0, 0]} activeBar={{ fill: '#0891b2', opacity: 0.8 }}>
              <LabelList dataKey="tut" position="top" style={LABEL_STYLE} formatter={v => `${v}m`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      {/* Rowing charts */}
      {rowingData.length > 0 && (
        <>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Rowing</span>
            <div className="flex-1 h-px bg-surface-3" />
          </div>

          <ChartCard title="Split /500m" subtitle="Avg split per rowing session — lower is faster">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={rowingData} margin={{ top: 24, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="label" tick={AXIS_TICK} />
                <YAxis tick={AXIS_TICK} reversed tickFormatter={v => fmtSplit(v)} domain={['auto', 'auto']} />
                <Tooltip {...TOOLTIP_STYLE}
                  formatter={v => [fmtSplit(v), 'Avg Split']}
                  labelFormatter={label => rowingData.find(r => r.label === label)?.date ?? label}
                />
                <Line type="monotone" dataKey="split_sec" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }}>
                  <LabelList dataKey="split_sec" position="top" style={LABEL_STYLE} formatter={v => fmtSplit(v)} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Avg Peak Power" subtitle="Watts per rowing session — higher is more powerful">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={rowingData} margin={{ top: 24, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="label" tick={AXIS_TICK} />
                <YAxis tick={AXIS_TICK} unit="W" domain={['auto', 'auto']} />
                <Tooltip {...TOOLTIP_STYLE}
                  formatter={v => [`${v} W`, 'Avg Peak Power']}
                  labelFormatter={label => rowingData.find(r => r.label === label)?.date ?? label}
                />
                <Line type="monotone" dataKey="watts" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }}>
                  <LabelList dataKey="watts" position="top" style={LABEL_STYLE} formatter={v => `${v}W`} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Rowing Distance" subtitle="Meters per session">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={rowingData} margin={{ top: 24, right: 16, bottom: 0, left: 0 }} barCategoryGap="30%">
                <CartesianGrid {...GRID} />
                <XAxis dataKey="label" tick={AXIS_TICK} />
                <YAxis tick={AXIS_TICK} unit="m" domain={['auto', 'auto']} />
                <Tooltip {...TOOLTIP_STYLE}
                  formatter={v => [`${v}m`, 'Distance']}
                  labelFormatter={label => rowingData.find(r => r.label === label)?.date ?? label}
                />
                <Bar dataKey="distance" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="distance" position="top" style={LABEL_STYLE} formatter={v => `${v}m`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}

    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="label">{title}</h2>
        {subtitle && <p className="text-zinc-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
