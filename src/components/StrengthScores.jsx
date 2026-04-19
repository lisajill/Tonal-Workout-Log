import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LabelList,
} from 'recharts'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#18181b', border: '1px solid #303036', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#a1a1aa', marginBottom: 4 },
  itemStyle: { color: '#e4e4e7' },
  cursor: false,
}
const AXIS_TICK = { fill: '#71717a', fontSize: 11 }
const GRID = { strokeDasharray: '3 3', stroke: '#303036' }
const LABEL_STYLE = { fill: '#a1a1aa', fontSize: 10 }

const COLORS = {
  overall: '#6366f1',
  upper:   '#22d3ee',
  lower:   '#a78bfa',
  core:    '#f43f5e',
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
]

function shortDate(d) {
  const [, m, day] = d.split('-')
  return `${parseInt(m)}/${parseInt(day)}`
}

const chartData = HISTORY.map(r => ({ ...r, label: shortDate(r.date) }))

const current = HISTORY[HISTORY.length - 1]

const REGIONS = [
  { key: 'overall', label: 'Overall' },
  { key: 'upper',   label: 'Upper'   },
  { key: 'core',    label: 'Core'    },
  { key: 'lower',   label: 'Lower'   },
]

export default function StrengthScores() {
  const first = HISTORY[0]

  return (
    <div className="space-y-5">
      {/* Current score cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {REGIONS.map(({ key, label }) => {
          const delta = current[key] - first[key]
          return (
            <div key={key} className="card flex flex-col gap-1">
              <span className="label">{label}</span>
              <span className="text-3xl font-bold" style={{ color: COLORS[key] }}>
                {current[key]}
              </span>
              <span className={`text-xs font-medium ${delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                {delta > 0 ? `+${delta}` : delta} since start
              </span>
            </div>
          )
        })}
      </div>

      {/* History chart */}
      <div className="card">
        <div className="mb-4">
          <h2 className="label">Strength Score History</h2>
          <p className="text-zinc-500 text-xs mt-0.5">All-time progression across body regions</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 24, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="label" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} domain={['auto', 'auto']} />
            <Tooltip
              {...TOOLTIP_STYLE}
              labelFormatter={label => {
                const row = chartData.find(r => r.label === label)
                return row ? row.date : label
              }}
              formatter={(v, name) => [v, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Legend
              formatter={v => v.charAt(0).toUpperCase() + v.slice(1)}
              wrapperStyle={{ fontSize: 11, color: '#71717a' }}
            />
            {REGIONS.map(({ key }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[key]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 5 }}
              >
                <LabelList dataKey={key} position="top" style={LABEL_STYLE} />
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Historical table */}
      <div className="card">
        <div className="mb-4">
          <h2 className="label">Score Log</h2>
          <p className="text-zinc-500 text-xs mt-0.5">Every recorded snapshot</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-surface-3">
              <th className="pb-2 text-zinc-500 font-medium">Date</th>
              {REGIONS.map(({ key, label }) => (
                <th key={key} className="pb-2 font-medium text-right" style={{ color: COLORS[key] }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...HISTORY].reverse().map((row, i) => (
              <tr key={i} className="border-b border-surface-3 last:border-0">
                <td className="py-2 text-zinc-400">{row.date}</td>
                {REGIONS.map(({ key }) => (
                  <td key={key} className="py-2 text-right text-zinc-200">{row[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
