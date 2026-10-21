import 'dotenv/config'
import fs from 'fs'
import path from 'path'

const ZONE2_DIR    = process.env.ZONE2_SOURCE_DIR ?? path.join(process.env.HOME!, 'Documents/Claude/Zone2Sessions')
const CARDIO_FILE  = path.join(process.cwd(), 'src/data/zone2_log.json')
const ACTIVITY_FILE = path.join(process.cwd(), 'src/data/activities.json')
const SESSIONS_FILE = path.join(process.cwd(), 'src/data/sessions.json')

// Activities excluded from activities.json — either cardio-only or tracked separately (Tonal uses sessions.json)
const SKIP_ACTIVITIES = new Set(['Walking', 'Outdoor Walk', 'Indoor Walk', 'Running', 'Outdoor Run', 'Indoor Run', 'Cycling', 'Outdoor Cycling', 'Tonal', 'Tonal - Lift', 'Tonal - Pilates', 'Tonal - Recovery', 'Traditional Strength Training'])

// Classify a Tonal-sourced session into Lift/Pilates/Recovery by matching its workout
// title in sessions.json (by date + nearest timestamp) — more reliable than the raw
// HealthKit activity name, which Tonal doesn't consistently vary by workout type.
const sessionsForMatch: { date: string; time: number; workout: string }[] = (() => {
  try {
    const raw: any[] = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'))
    return raw
      .filter(s => s.tonal_activity_id && !s.merged_into && s.timestamp)
      .map(s => ({ date: s.date, time: new Date(s.timestamp).getTime(), workout: s.workout ?? '' }))
  } catch { return [] }
})()

function classifyTonalActivity(date: string, timestamp: string | null): string {
  const candidates = sessionsForMatch.filter(s => s.date === date)
  let workout = ''
  if (candidates.length > 0) {
    const entryTime = new Date(timestamp ?? date).getTime()
    const nearest = candidates.reduce((best, s) =>
      Math.abs(s.time - entryTime) < Math.abs(best.time - entryTime) ? s : best)
    workout = nearest.workout
  }
  const w = workout.toLowerCase()
  if (w.includes('pilates')) return 'Tonal - Pilates'
  if (w.includes('recovery') || w.includes('mobility')) return 'Tonal - Recovery'
  return 'Tonal - Lift'
}

// Default muscle effort maps by HealthKit activity name (effort 1–5 per muscle)
// Built lazily — new types added here when first seen in real exports
const MUSCLE_DEFAULTS: Record<string, Record<string, number>> = {
  'Tonal':                          { glutes: 3, hamstrings: 3, quads: 3, abs: 2, back: 2 },
  'Tonal - Lift':                   { glutes: 3, hamstrings: 3, quads: 3, abs: 2, back: 2 },
  'Tonal - Pilates':                { abs: 4, obliques: 4, hip_flexors: 3, back: 2, glutes: 2 },
  'Tonal - Recovery':               { abs: 2, back: 1, hip_flexors: 1 },
  'Traditional Strength Training':  { glutes: 3, hamstrings: 3, quads: 3, abs: 2, back: 2 },
  'Functional Strength Training':   { abs: 4, obliques: 3, hip_flexors: 3, glutes: 2, back: 2 },
  'Pilates':                        { abs: 4, obliques: 4, hip_flexors: 3, back: 2, glutes: 2 },
  'Yoga':                           { back: 2, hip_flexors: 2, abs: 2, shoulders: 1 },
  'Equestrian Sports':              { adductors: 5, hip_flexors: 4, glutes: 3, abs: 3, grip: 3, back: 2 },
  'Dance':                          { quads: 3, glutes: 3, abs: 3, calves: 2, hip_flexors: 3 },
  'Tai Chi':                        { abs: 2, hip_flexors: 2, back: 1, quads: 1 },
  'Hiking':                         { quads: 3, glutes: 3, hamstrings: 2, calves: 3 },
  'Swimming':                       { shoulders: 4, back: 3, abs: 3, triceps: 2 },
  'Rowing':                         { back: 4, abs: 3, hamstrings: 3, glutes: 3, shoulders: 2 },
}

interface CardioEntry {
  uuid: string
  date: string
  activity: string
  duration_min: number
  zone1_min: number
  zone2_min: number
  zone3_min: number
  zone4_min: number
  avg_hr: number | null
  distance_mi: number | null
}

interface ActivityEntry {
  uuid: string
  date: string
  activity: string
  duration_min: number
  avg_hr: number | null
  muscles: Record<string, number> | null  // null = unknown type, needs mapping
  notes: string | null
}

function loadExisting<T extends { uuid: string }>(file: string): { entries: T[], seen: Set<string> } {
  const seen = new Set<string>()
  const entries: T[] = []
  if (fs.existsSync(file)) {
    const existing: T[] = JSON.parse(fs.readFileSync(file, 'utf8'))
    for (const e of existing) {
      if (!seen.has(e.uuid)) { seen.add(e.uuid); entries.push(e) }
    }
  }
  return { entries, seen }
}

const { entries: cardioEntries, seen: cardioSeen } = loadExisting<CardioEntry>(CARDIO_FILE)
const { entries: activityEntries, seen: activitySeen } = loadExisting<ActivityEntry>(ACTIVITY_FILE)

const allSeen = new Set<string>()
cardioSeen.forEach(u => allSeen.add(u))
activitySeen.forEach(u => allSeen.add(u))
const newActivities: string[] = []

const files = fs.readdirSync(ZONE2_DIR).filter(f => !f.startsWith('.'))

for (const file of files) {
  const raw = fs.readFileSync(path.join(ZONE2_DIR, file), 'utf8')
  let data: any
  try { data = JSON.parse(raw) } catch { continue }
  if (!data.uuid || allSeen.has(data.uuid)) continue
  allSeen.add(data.uuid)

  const date = data.startDate?.slice(0, 10) ?? 'unknown'
  const toMin = (sec: number) => Math.round((sec / 60) * 10) / 10
  const rawActivity = data.source === 'Tonal' ? classifyTonalActivity(date, data.startDate ?? null) : (data.activity?.name ?? data.name ?? 'Unknown')
  const activity = rawActivity === 'Indoor Walk' ? 'Treadmill'
    : rawActivity === 'Hydrow' ? 'Rowing'
    : rawActivity

  // Always add to cardio log (zone/HR data useful for everyone)
  cardioEntries.push({
    uuid:         data.uuid,
    date,
    timestamp:    data.startDate ?? null,
    activity,
    duration_min: toMin(data.duration?.value ?? 0),
    zone1_min:    toMin(data.zones?.zone1?.time?.value ?? 0),
    zone2_min:    toMin(data.zones?.zone2?.time?.value ?? 0),
    zone3_min:    toMin(data.zones?.zone3?.time?.value ?? 0),
    zone4_min:    toMin(data.zones?.zone4?.time?.value ?? 0),
    avg_hr:       data.averageHeartRate?.value ?? null,
    distance_mi:  data.distance?.value ?? null,
  })

  // Add to activity log if not cardio-only
  if (!SKIP_ACTIVITIES.has(activity)) {
    const muscles = MUSCLE_DEFAULTS[activity] ?? null
    if (!muscles) newActivities.push(activity)
    activityEntries.push({
      uuid:         data.uuid,
      date,
      activity,
      duration_min: toMin(data.duration?.value ?? 0),
      avg_hr:       data.averageHeartRate?.value ?? null,
      muscles,
      notes:        null,
    })
  }
}

cardioEntries.sort((a, b) => ((a as any).timestamp ?? a.date).localeCompare((b as any).timestamp ?? b.date))
activityEntries.sort((a, b) => ((a as any).timestamp ?? a.date).localeCompare((b as any).timestamp ?? b.date))

fs.writeFileSync(CARDIO_FILE, JSON.stringify(cardioEntries, null, 2))
fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(activityEntries, null, 2))

console.log(`Wrote ${cardioEntries.length} entries to zone2_log.json`)
console.log(`Wrote ${activityEntries.length} entries to activities.json`)
cardioEntries.forEach(e => console.log(`  ${e.date} ${e.activity} — Z2: ${e.zone2_min}min, HR: ${e.avg_hr ?? '—'}bpm`))

if (newActivities.length > 0) {
  console.log(`\n⚠️  Unknown activity types (no muscle map) — add to MUSCLE_DEFAULTS in import-zone2.ts:`)
  Array.from(new Set(newActivities)).forEach(a => console.log(`  "${a}"`))
}
