import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, LabelList,
} from 'recharts'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#18181b', border: '1px solid #303036', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#a1a1aa', marginBottom: 4 },
  itemStyle: { color: '#e4e4e7' },
}

const AXIS_TICK = { fill: '#71717a', fontSize: 11 }
const GRID = { strokeDasharray: '3 3', stroke: '#303036' }
const LABEL_STYLE = { fill: '#a1a1aa', fontSize: 11 }

function shortDate(d) {
  const [, m, day] = d.split('-')
  return `${parseInt(m)}/${parseInt(day)}`
}

// Custom label rendered at each line chart data point
function DotLabel({ x, y, value, formatter, offset = -14 }) {
  if (value == null) return null
  return (
    <text x={x} y={y + offset} textAnchor="middle" {...LABEL_STYLE}>
      {formatter ? formatter(value) : value}
    </text>
  )
}

export default function Charts({ sessions }) {
  const data = sessions.map(s => ({
    date: shortDate(s.date),
    volume: s.total_volume,
    avg_hr: s.avg_hr,
    max_hr: s.max_hr,
    rating: s.subjective_rating,
    duration: s.duration,
    tut: s.time_under_tension,
  }))

  const avgRating = (sessions.reduce((s, r) => s + r.subjective_rating, 0) / sessions.length).toFixed(1)

  return (
    <div className="space-y-5">
      <ChartCard title="Volume Over Time" subtitle="Total lbs lifted per session">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="date" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} tickFormatter={v => `${(v / 1000).toFixed(1)}k`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v.toLocaleString()} lbs`, 'Volume']} />
            <Bar dataKey="volume" fill="#6366f1" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="volume"
                position="top"
                style={LABEL_STYLE}
                formatter={v => `${(v / 1000).toFixed(1)}k`}
              />
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
            <Line type="monotone" dataKey="avg_hr" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }}>
              <LabelList dataKey="avg_hr" position="top" style={LABEL_STYLE} formatter={v => `${v}`} />
            </Line>
            <Line type="monotone" dataKey="max_hr" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="4 2">
              <LabelList dataKey="max_hr" position="top" style={LABEL_STYLE} formatter={v => `${v}`} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Session Rating" subtitle="Subjective feel out of 5">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="date" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
            <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v} / 5`, 'Rating']} />
            <ReferenceLine
              y={parseFloat(avgRating)}
              stroke="#52525b"
              strokeDasharray="4 2"
              label={{ value: `avg ${avgRating}`, fill: '#71717a', fontSize: 11, position: 'insideTopRight' }}
            />
            <Line type="monotone" dataKey="rating" stroke="#22d3ee" strokeWidth={2} dot={{ r: 4 }}>
              <LabelList dataKey="rating" position="top" style={LABEL_STYLE} formatter={v => `${v}`} />
            </Line>
          </LineChart>
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
            <Bar dataKey="duration" fill="#22d3ee" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="duration" position="top" style={LABEL_STYLE} formatter={v => `${v}m`} />
            </Bar>
            <Bar dataKey="tut" fill="#0891b2" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="tut" position="top" style={LABEL_STYLE} formatter={v => `${v}m`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
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
