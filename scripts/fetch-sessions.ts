import 'dotenv/config'
import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'
import TonalClient from '@dlwiest/ts-tonal-client'

const SESSIONS_PATH = resolve(import.meta.dirname, '../src/data/sessions.json')

interface SessionEntry {
  date: string
  workout: string
  energy_level: number | null
  phase: string | null
  subjective_rating: number | null
  sweat: string | null
  duration: number | null
  total_volume: number | null
  total_reps: number | null
  time_under_tension: number | null
  total_work_kj: number | null
  calories: number | null
  avg_hr: number | null
  max_hr: number | null
  pre_readiness: Record<string, number | null>
  post_readiness: Record<string, number | null>
  prs: Record<string, { weight: number | null; date: string | null }>
  muscles_high_volume: string[]
  muscles_low_volume: string[]
  bodymap?: string
  shot_day?: boolean
  tonal_activity_id?: string
}

const EMPTY_READINESS = {
  glutes: null, hamstrings: null, quads: null, calves: null,
  abs: null, obliques: null, back: null, chest: null,
  shoulders: null, biceps: null, triceps: null,
}

function toMinutes(seconds: number): number {
  return Math.round((seconds / 60) * 100) / 100
}

function toDateString(isoTimestamp: string): string {
  return isoTimestamp.slice(0, 10)
}

async function main() {
  const username = process.env.TONAL_EMAIL || process.env.TONAL_USERNAME
  const password = process.env.TONAL_PASSWORD

  if (!username || !password) {
    console.error('Missing TONAL_EMAIL / TONAL_PASSWORD in .env')
    process.exit(1)
  }

  console.log('Authenticating with Tonal...')
  const client = await TonalClient.create({ username, password })
  console.log('Authenticated.')

  console.log('Fetching activity summaries...')
  const allActivities = await client.getActivitySummaries()
  const activities = allActivities.filter((a: any) => a.activityType === 'Internal')
  console.log(`Got ${activities.length} Tonal workouts (${allActivities.length} total activities).`)

  const existing: SessionEntry[] = JSON.parse(readFileSync(SESSIONS_PATH, 'utf-8'))

  // Three-level lookup: activity ID > exact date+name > date only
  const byActivityId = new Map<string, SessionEntry>()
  const byDateAndName = new Map<string, SessionEntry>()
  const byDate = new Map<string, SessionEntry>()

  for (const s of existing) {
    if (s.tonal_activity_id) byActivityId.set(s.tonal_activity_id, s)
    byDateAndName.set(`${s.date}::${s.workout}`, s)
    byDate.set(s.date, s)
  }

  const merged: SessionEntry[] = []
  const matchedExistingKeys = new Set<string>()

  for (const activity of activities) {
    const date = toDateString(activity.localTimestamp)
    const apiName = (activity as any).name as string

    const existing_entry =
      byActivityId.get(activity.id) ??
      byDateAndName.get(`${date}::${apiName}`) ??
      byDate.get(date)

    if (existing_entry) {
      matchedExistingKeys.add(existing_entry.tonal_activity_id ?? `${existing_entry.date}::${existing_entry.workout}`)
    }

    const apiFields = {
      workout: existing_entry?.workout ?? apiName, // prefer existing name if we matched
      duration: toMinutes(activity.duration),
      total_volume: activity.totalVolume,
      total_reps: activity.totalReps || null,
      time_under_tension: toMinutes(activity.timeUnderTension),
      total_work_kj: Math.round(activity.totalWork / 1000),
      tonal_activity_id: activity.id,
    }

    if (existing_entry) {
      merged.push({ ...existing_entry, ...apiFields })
    } else {
      merged.push({
        date,
        workout: apiName,
        energy_level: null,
        phase: null,
        subjective_rating: null,
        sweat: null,
        calories: null,
        avg_hr: null,
        max_hr: null,
        pre_readiness: { ...EMPTY_READINESS },
        post_readiness: { ...EMPTY_READINESS },
        prs: {},
        muscles_high_volume: [],
        muscles_low_volume: [],
        ...apiFields,
      })
    }
  }

  // Preserve any existing sessions that had no API match (manually-entered only)
  for (const s of existing) {
    const key = s.tonal_activity_id ?? `${s.date}::${s.workout}`
    if (!matchedExistingKeys.has(key)) {
      merged.push(s)
    }
  }

  merged.sort((a, b) => a.date.localeCompare(b.date))

  writeFileSync(SESSIONS_PATH, JSON.stringify(merged, null, 2))
  console.log(`Wrote ${merged.length} sessions to src/data/sessions.json`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
