// Shared recharts styling — mono axes, hairline grid, dark tooltip.
// Used by CardioTracker, RowingTracker, StrengthScores (Charts.jsx has its own
// session-aware tooltip with workout metadata).

export const AXIS_TICK = { fill: '#71717a', fontSize: 10, fontFamily: '"JetBrains Mono", monospace' }
export const GRID = { stroke: '#232327', vertical: false }
export const AXIS = { tick: AXIS_TICK, axisLine: false, tickLine: false }

// Least-squares linear fit over y-values indexed 0..n-1 (nulls skipped in the fit,
// but a null stays null in the output so gaps don't get a phantom trend point).
// Returns { fit: (number|null)[], slope } — slope is per-index change.
export function linregFit(ys) {
  const pts = ys.map((y, i) => [i, y]).filter(([, y]) => y != null && !Number.isNaN(y))
  const n = pts.length
  if (n < 2) return { fit: ys.map(() => null), slope: 0 }
  let sx = 0, sy = 0, sxx = 0, sxy = 0
  for (const [x, y] of pts) { sx += x; sy += y; sxx += x * x; sxy += x * y }
  const denom = n * sxx - sx * sx
  if (denom === 0) return { fit: ys.map(() => null), slope: 0 }
  const slope = (n * sxy - sx * sy) / denom
  const intercept = (sy - slope * sx) / n
  return { fit: ys.map((y, i) => (y == null ? null : intercept + slope * i)), slope }
}

// Trendline fit over a TRAILING window of the most recent `window` points, so
// the line tracks the current trajectory instead of staying anchored to old
// data as sessions accumulate. Count-based (not date-based) since sessions can
// be sporadic. Returns a fit array aligned to the full series (null before the
// window) plus the windowed slope.
export function trailingFit(ys, { window = 6, minPoints = 3 } = {}) {
  const n = ys.length
  if (n < 2) return { fit: ys.map(() => null), slope: 0 }
  const start = Math.max(0, n - Math.max(window, minPoints))
  const { fit: winFit, slope } = linregFit(ys.slice(start))
  return { fit: ys.map((_, i) => (i >= start ? winFit[i - start] : null)), slope, start }
}

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
