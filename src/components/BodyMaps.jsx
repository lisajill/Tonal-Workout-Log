const MUSCLES = ['glutes', 'hamstrings', 'quads', 'calves', 'abs', 'obliques', 'back', 'chest', 'shoulders', 'biceps', 'triceps']

function readinessEmoji(val) {
  if (val == null) return null
  if (val <= 25)  return { icon: '💀', color: 'text-red-400' }
  if (val <= 50)  return { icon: '🥵', color: 'text-orange-400' }
  if (val <= 75)  return { icon: '🌤', color: 'text-yellow-400' }
  if (val <= 90)  return { icon: '🌿', color: 'text-green-400' }
  return          { icon: '✨', color: 'text-emerald-400' }
}

const SWEAT_COLOR = {
  dry:       'text-zinc-500',
  untracked: 'text-zinc-600',
  light:     'text-sky-400',
  moderate:  'text-blue-400',
  heavy:     'text-indigo-400',
}

export default function BodyMaps({ sessions }) {
  const sorted = sessions
    .map((s, i) => ({ s, i }))
    .sort((a, b) => (b.s.timestamp ?? b.s.date).localeCompare(a.s.timestamp ?? a.s.date) || b.i - a.i)
    .map(({ s }) => s)

  return (
    <div className="space-y-4">
      <h1 className="font-display italic text-3xl" style={{ color: '#a3e635' }}>Body Maps</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {sorted.map((s, i) => {
          const postMuscles = MUSCLES
            .map(m => ({ m, val: s.post_readiness?.[m] }))
            .filter(({ val }) => val != null)
            .sort((a, b) => a.val - b.val)

          const cooked  = postMuscles.filter(({ val }) => val <= 25)
          const notable = postMuscles.filter(({ val }) => val > 25 && val <= 75)

          return (
            <div key={s.date} className="card flex flex-col gap-3">
              {/* Header */}
              <div>
                <p className="label">{s.date}</p>
                <p className="mt-1 text-sm font-medium text-zinc-100 leading-snug">{s.workout}</p>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-500">
                  <span>{s.duration}m</span>
                  <span>·</span>
                  <span>{s.total_volume?.toLocaleString()} lbs</span>
                  <span>·</span>
                  <span className={SWEAT_COLOR[s.sweat]}>{s.sweat === 'untracked' ? '—' : s.sweat}</span>
                </div>
              </div>

              {/* Body map */}
              {s.bodymap ? (
                <div className="flex justify-center">
                <div className="overflow-hidden rounded-lg bg-surface-2" style={{ aspectRatio: '1206/1510', width: '75%' }}>
                  <img
                    src={s.bodymap}
                    alt={`Body map ${s.date}`}
                    className="h-full w-full object-contain object-top"
                  />
                </div>
                </div>
              ) : (
                <div className="flex justify-center">
                <div className="flex items-center justify-center rounded-lg bg-surface-2 text-zinc-600 text-xs" style={{ aspectRatio: '1206/1510', width: '75%' }}>
                  No image
                </div>
                </div>
              )}

              {/* Post readiness callouts */}
              {postMuscles.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="label">Post-session</p>
                  {cooked.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cooked.map(({ m, val }) => <Chip key={m} m={m} val={val} />)}
                    </div>
                  )}
                  {notable.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {notable.map(({ m, val }) => <Chip key={m} m={m} val={val} />)}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-600">No post-session data</p>
              )}

              {/* Rating */}
              <div className="mt-auto pt-1 border-t border-surface-3 flex items-center justify-between text-xs text-zinc-500">
                <span>Rating</span>
                <span className="font-semibold text-zinc-200">{s.subjective_rating} / 5</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
        {[
          { icon: '💀', range: '0–25%',   label: 'Cooked',     color: 'text-red-400' },
          { icon: '🥵', range: '26–50%',  label: 'Fatigued',   color: 'text-orange-400' },
          { icon: '🌤', range: '51–75%',  label: 'Recovering', color: 'text-yellow-400' },
          { icon: '🌿', range: '76–90%',  label: 'Ready',      color: 'text-green-400' },
          { icon: '✨', range: '91–100%', label: 'Fresh',      color: 'text-emerald-400' },
        ].map(({ icon, range, label, color }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs">
            <span>{icon}</span>
            <span className="text-zinc-600">{range}</span>
            <span className={color}>{label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

const TIER_LABEL = {
  cooked: 'Cooked', fatigued: 'Fatigued', recovering: 'Recovering', ready: 'Ready', fresh: 'Fresh',
}

function tier(val) {
  if (val <= 25)  return 'cooked'
  if (val <= 50)  return 'fatigued'
  if (val <= 75)  return 'recovering'
  if (val <= 90)  return 'ready'
  return 'fresh'
}

function Chip({ m, val }) {
  const e = readinessEmoji(val)
  const t = tier(val)
  const label = `${val}% — ${TIER_LABEL[t]}`

  return (
    <span className="relative group/chip">
      <span className={`flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs cursor-default ${e.color}`}>
        {e.icon} <span className="capitalize">{m.replace(/_/g, ' ')}</span> <span className="text-zinc-600">{val}%</span>
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 whitespace-nowrap rounded-md bg-surface-3 border border-surface-3 px-2 py-1 text-xs text-zinc-200 shadow-lg opacity-0 group-hover/chip:opacity-100 transition-opacity">
        <span className="capitalize">{m.replace(/_/g, ' ')}</span> · {label}
      </span>
    </span>
  )
}
