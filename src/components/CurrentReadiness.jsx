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
  events.sort((a, b) => a.date.localeCompare(b.date))

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

  const activeMuscles = MUSCLES.filter(m => readiness[m] != null)
  const unknownMuscles = MUSCLES.filter(m => readiness[m] == null)

  // Group by body region for display
  const REGIONS = [
    { label: 'Lower Body', muscles: ['glutes', 'hamstrings', 'quads', 'calves', 'adductors', 'hip_flexors'] },
    { label: 'Core', muscles: ['abs', 'obliques', 'back'] },
    { label: 'Upper Body', muscles: ['chest', 'shoulders', 'biceps', 'triceps', 'grip'] },
  ]

  const hasData = activeMuscles.length > 0

  return (
    <div className="space-y-5">
      <div className="card border-accent/20 bg-accent/5">
        <p className="text-xs text-zinc-400 leading-relaxed">
          Estimated current muscle readiness based on Tonal post-session data and off-Tonal activity logs, decayed toward 100% over time.
          Use this before planning your next session to avoid overworking fatigued groups.
        </p>
      </div>

      {!hasData && (
        <div className="card flex items-center justify-center h-32 text-zinc-600 text-sm">
          No readiness data yet — complete a Tonal session first.
        </div>
      )}

      {hasData && REGIONS.map(region => {
        const regionMuscles = region.muscles.filter(m => readiness[m] != null)
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
                  <div key={m} className={`${s.bg} rounded-lg px-3 py-3`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-400">{MUSCLE_LABELS[m]}</span>
                      <span className="text-base leading-none">{s.icon}</span>
                    </div>
                    <div className={`text-2xl font-bold tabular-nums ${s.text}`}>{val}%</div>
                    <div className={`text-[10px] mt-0.5 ${s.text} opacity-80`}>{s.label}</div>
                    {src && <div className="text-[10px] text-zinc-600 mt-1 truncate">{src}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {unknownMuscles.length > 0 && hasData && (
        <div className="card">
          <h2 className="label mb-3">No Data</h2>
          <div className="flex flex-wrap gap-2">
            {unknownMuscles.map(m => (
              <span key={m} className="rounded-lg bg-surface-2 px-3 py-1.5 text-xs text-zinc-600">{MUSCLE_LABELS[m]}</span>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-3">These muscles have no recent session data — assume fully fresh.</p>
        </div>
      )}

      <p className="text-xs text-zinc-600">
        Recovery model: 72 hrs (glutes/hamstrings/quads) · 48 hrs (abs/obliques/back/shoulders) · 36 hrs (calves/biceps/triceps) · 24 hrs (grip).
        Off-Tonal fatigue estimated from activity type defaults; prescribed workouts use exact muscle maps.
      </p>
    </div>
  )
}
