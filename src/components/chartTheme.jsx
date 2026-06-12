// Shared recharts styling — mono axes, hairline grid, dark tooltip.
// Used by CardioTracker, RowingTracker, StrengthScores (Charts.jsx has its own
// session-aware tooltip with workout metadata).

export const AXIS_TICK = { fill: '#71717a', fontSize: 10, fontFamily: '"JetBrains Mono", monospace' }
export const GRID = { stroke: '#232327', vertical: false }
export const AXIS = { tick: AXIS_TICK, axisLine: false, tickLine: false }

// Generic dark tooltip. `names` maps dataKey → display name,
// `formats` maps dataKey → value formatter.
export function ChartTip({ active, payload, label, names = {}, formats = {} }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-surface-3 bg-surface-1/95 px-3 py-2 shadow-lg backdrop-blur">
      <p className="mono-stat text-[11px] font-semibold text-zinc-200">{label}</p>
      <div className="mt-1 space-y-0.5">
        {payload.filter(p => p.value != null).map(p => (
          <p key={p.dataKey} className="flex items-center gap-1.5 text-[11px]">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color ?? p.fill }} />
            <span className="text-zinc-500">{names[p.dataKey] ?? p.name ?? p.dataKey}</span>
            <span className="mono-stat ml-auto pl-3 font-semibold text-zinc-100">
              {(formats[p.dataKey] ?? (v => v))(p.value)}
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}
