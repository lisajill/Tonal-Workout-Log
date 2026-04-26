import 'dotenv/config'
import fs from 'fs'
import path from 'path'

const ZONE2_DIR = path.join(process.env.HOME!, 'Documents/Claude/Zone2Sessions')
const OUT_FILE  = path.join(process.cwd(), 'src/data/zone2_log.json')

interface ZonesEntry {
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

const seen = new Set<string>()
const entries: ZonesEntry[] = []

// Merge existing log to preserve any manually-added entries
if (fs.existsSync(OUT_FILE)) {
  const existing: ZonesEntry[] = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'))
  for (const e of existing) {
    if (!seen.has(e.uuid)) {
      seen.add(e.uuid)
      entries.push(e)
    }
  }
}

const files = fs.readdirSync(ZONE2_DIR).filter(f => !f.startsWith('.'))

for (const file of files) {
  const raw = fs.readFileSync(path.join(ZONE2_DIR, file), 'utf8')
  let data: any
  try { data = JSON.parse(raw) } catch { continue }

  if (!data.uuid || seen.has(data.uuid)) continue
  seen.add(data.uuid)

  const date = data.startDate?.slice(0, 10) ?? 'unknown'
  const toMin = (sec: number) => Math.round((sec / 60) * 10) / 10

  entries.push({
    uuid:         data.uuid,
    date,
    activity:     data.source === 'Tonal' ? 'Tonal' : (data.activity?.name ?? data.name ?? 'Unknown'),
    duration_min: toMin(data.duration?.value ?? 0),
    zone1_min:    toMin(data.zones?.zone1?.time?.value ?? 0),
    zone2_min:    toMin(data.zones?.zone2?.time?.value ?? 0),
    zone3_min:    toMin(data.zones?.zone3?.time?.value ?? 0),
    zone4_min:    toMin(data.zones?.zone4?.time?.value ?? 0),
    avg_hr:       data.averageHeartRate?.value ?? null,
    distance_mi:  data.distance?.value ?? null,
  })
}

entries.sort((a, b) => a.date.localeCompare(b.date))
fs.writeFileSync(OUT_FILE, JSON.stringify(entries, null, 2))
console.log(`Wrote ${entries.length} entries to zone2_log.json`)
entries.forEach(e => console.log(`  ${e.date} ${e.activity} — Z2: ${e.zone2_min}min, HR: ${e.avg_hr ?? '—'}bpm`))
