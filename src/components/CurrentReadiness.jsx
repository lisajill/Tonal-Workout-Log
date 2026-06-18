import sessions from '../data/sessions.json'
import activities from '../data/activities.json'

const MUSCLES = [
  'glutes', 'hamstrings', 'quads', 'calves',
  'abs', 'obliques', 'hip_flexors', 'adductors',
  'back', 'chest', 'shoulders', 'biceps', 'triceps', 'grip',
]

const MUSCLE_LABELS = {
  glutes: 'Glutes', hamstrings: 'Hamstrings', quads: 'Quads', calves: 'Calves',
  abs: 'Abs', obliques: 'Obliques', hip_flexors: 'Hip Flexors', adductors: 'Adductors',
  back: 'Back', chest: 'Chest', shoulders: 'Shoulders', biceps: 'Biceps',
  triceps: 'Triceps', grip: 'Grip',
}

// Hours to recover from full fatigue back to 100%
const RECOVERY_HOURS = {
  glutes: 72, hamstrings: 72, quads: 72, adductors: 60,
  abs: 48, obliques: 48, hip_flexors: 48, back: 48,
  calves: 36, shoulders: 48, chest: 48, biceps: 36, triceps: 36, grip: 24,
}

function hoursAgo(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return (Date.now() - d.getTime()) / 3_600_000
}

// Decay a readiness value toward 100 over time
function decayToFresh(readiness, hours, muscle) {
  const recoveryHrs = RECOVERY_HOURS[muscle] ?? 48
  const progress = Math.min(1, hours / recoveryHrs)
  return Math.round(readiness + (100 - readiness) * progress)
}

// Convert effort (1–5) + duration to a fatigue hit (readiness reduction)
function effortToFatigue(effort, durationMin) {
  const durationFactor = Math.min(1.5, durationMin / 45)
  return Math.round(effort * 15 * durationFactor)
}

function computeReadiness() {
  const readiness = {}
  const sources = {}

  const events = []

  for (const s of sessions) {
    if (s.post_readiness && Object.values(s.post_readiness).some(v => v != null)) {
      events.push({ date: s.date, type: 'tonal', data: { readiness: s.post_readiness, workout: s.workout } })
    }
  }
  for (const a of activities) {
    if (a.muscles && Object.keys(a.muscles).length > 0) {
      events.push({ date: a.date, type: 'activity', data: { muscles: a.muscles, duration_min: a.duration_min, activity: a.activity } })
    }
  }
  events.sort((a, b) => (a.timestamp ?? a.date).localeCompare(b.timestamp ?? b.date))

  for (const event of events) {
    const hrs = hoursAgo(event.date)
    if (hrs < 0) continue

    if (event.type === 'tonal') {
      for (const [muscle, val] of Object.entries(event.data.readiness)) {
        if (val == null) continue
        const decayed = decayToFresh(val, hrs, muscle)
        if (readiness[muscle] == null || decayed < readiness[muscle]) {
          readiness[muscle] = decayed
          sources[muscle] = [`Tonal: ${event.data.workout}`]
        }
      }
    } else {
      for (const [muscle, effort] of Object.entries(event.data.muscles)) {
        const fatigue = effortToFatigue(effort, event.data.duration_min)
        const val = Math.max(5, 100 - fatigue)
        const decayed = decayToFresh(val, hrs, muscle)
        if (readiness[muscle] == null || decayed < readiness[muscle]) {
          readiness[muscle] = decayed
          sources[muscle] = [`Off-Tonal: ${event.data.activity}`]
        }
      }
    }
  }

  return { readiness, sources }
}

function status(val) {
  if (val == null) return { icon: '—',  label: 'No data',    bg: 'bg-surface-2',        text: 'text-zinc-600' }
  if (val <= 25)   return { icon: '💀', label: 'Cooked',     bg: 'bg-red-950/60',       text: 'text-red-300' }
  if (val <= 50)   return { icon: '🥵', label: 'Fatigued',   bg: 'bg-orange-950/60',    text: 'text-orange-300' }
  if (val <= 75)   return { icon: '🌤', label: 'Recovering', bg: 'bg-yellow-950/60',    text: 'text-yellow-300' }
  if (val <= 90)   return { icon: '🌿', label: 'Ready',      bg: 'bg-green-950/60',     text: 'text-green-300' }
  return           { icon: '✨', label: 'Fresh',      bg: 'bg-emerald-950/60',   text: 'text-emerald-300' }
}

export default function CurrentReadiness() {
  const { readiness, sources } = computeReadiness()

  const activeMuscles = MUSCLES.filter(m => readiness[m] != null && readiness[m] < 100)

  // Group by body region for display
  const REGIONS = [
    { label: 'Lower Body', muscles: ['glutes', 'hamstrings', 'quads', 'calves', 'adductors', 'hip_flexors'] },
    { label: 'Core', muscles: ['abs', 'obliques', 'back'] },
    { label: 'Upper Body', muscles: ['chest', 'shoulders', 'biceps', 'triceps', 'grip'] },
  ]

  const hasData = activeMuscles.length > 0

  return (
    <div className="space-y-5">
      <h1 className="font-semibold text-3xl" style={{ color: '#fb923c' }}>Current State</h1>
      <div className="card border-accent/20 bg-accent/5">
        <p className="text-xs text-zinc-400 leading-relaxed">
          Estimated current muscle readiness based on Tonal post-session data and off-Tonal activity logs, decayed toward 100% over time.
          Use this before planning your next session to avoid overworking fatigued groups.
        </p>
      </div>

      {!hasData && (
        <div className="card flex flex-col items-center justify-center gap-1 h-32">
          {Object.values(readiness).some(v => v != null) ? (
            <>
              <p className="text-emerald-400 text-sm font-medium">✨ All muscle groups fully recovered</p>
              <p className="text-zinc-600 text-xs">Everything has decayed back to 100% — clear to train anything.</p>
            </>
          ) : (
            <p className="text-zinc-600 text-sm">No readiness data yet — complete a Tonal session first.</p>
          )}
        </div>
      )}

      {hasData && REGIONS.map(region => {
        const regionMuscles = region.muscles.filter(m => readiness[m] != null && readiness[m] < 100)
        if (regionMuscles.length === 0) return null
        return (
          <div key={region.label} className="card">
            <h2 className="label mb-4">{region.label}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {regionMuscles.map(m => {
                const val = readiness[m]
                const s = status(val)
                const src = sources[m]?.join(', ')
                return (
                  <div key={m} className={`${s.bg} rounded-lg px-3 py-3 relative group/card`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-400">{MUSCLE_LABELS[m]}</span>
                      <span className="text-base leading-none cursor-default">{s.icon}</span>
                    </div>
                    <div className={`text-2xl font-bold tabular-nums ${s.text}`}>{val}%</div>
                    <div className={`text-[10px] mt-0.5 ${s.text} opacity-80`}>{s.label}</div>
                    {src && <div className="text-[10px] text-zinc-600 mt-1 truncate">{src}</div>}
                    {/* Hover tooltip */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-44 rounded-lg bg-surface-3 border border-surface-3 px-3 py-2 text-xs text-zinc-300 shadow-xl opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <p className="font-semibold mb-1">{MUSCLE_LABELS[m]} — {val}%</p>
                      <p className={`${s.text} mb-1`}>{s.icon} {s.label}</p>
                      {src && <p className="text-zinc-500">{src}</p>}
                      <p className="text-zinc-600 mt-1">Recovers in {RECOVERY_HOURS[m] ?? 48}h</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}


      {hasData && (
        <div className="flex flex-wrap gap-3 px-1">
          {[
            { icon: '💀', label: 'Cooked',     text: 'text-red-300',     range: '0–25%' },
            { icon: '🥵', label: 'Fatigued',   text: 'text-orange-300',  range: '26–50%' },
            { icon: '🌤', label: 'Recovering', text: 'text-yellow-300',  range: '51–75%' },
            { icon: '🌿', label: 'Ready',      text: 'text-green-300',   range: '76–90%' },
            { icon: '✨', label: 'Fresh',      text: 'text-emerald-300', range: '91–100%' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs">
              <span>{l.icon}</span>
              <span className={`font-medium ${l.text}`}>{l.label}</span>
              <span className="text-zinc-600">{l.range}</span>
            </div>
          ))}
          <span className="text-xs text-zinc-600 ml-auto">Muscles at 100% hidden</span>
        </div>
      )}

      <p className="text-xs text-zinc-600">
        Recovery model: 72 hrs (glutes/hamstrings/quads) · 48 hrs (abs/obliques/back/shoulders) · 36 hrs (calves/biceps/triceps) · 24 hrs (grip).
        Off-Tonal fatigue estimated from activity type defaults; prescribed workouts use exact muscle maps.
      </p>
    </div>
  )
}
