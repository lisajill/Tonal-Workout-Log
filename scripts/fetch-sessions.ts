import 'dotenv/config'
import { writeFileSync, readFileSync } from 'fs'
import { resolve } from 'path'
import TonalClient from '@dlwiest/ts-tonal-client'

const SESSIONS_PATH = resolve(import.meta.dirname, '../src/data/sessions.json')
const LIFETIME_PATH = resolve(import.meta.dirname, '../src/data/lifetime-stats.json')

interface MovementSet {
  reps: number
  weight_lbs: number
  duration_sec?: number
  prs?: string[]
}

interface SessionMovement {
  name: string
  warmup_sets: number
  warmup_prs?: string[]
  sets: MovementSet[]
}

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
  movements?: SessionMovement[]
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

  // Raw API helper — ts-tonal-client exposes httpClient for direct endpoint calls
  const http = (client as any).httpClient
  const userInfo = await (client as any).userService.getUserInfo()
  const userId = userInfo.id ?? userInfo.userId ?? userInfo.sub

  // Cache movement name map — fetched once, used for all sessions
  console.log('Fetching movement catalog...')
  const allMovements: any[] = await http.request('/movements')
  const nameMap = new Map<string, string>(allMovements.map((m: any) => [m.id, m.name]))
  console.log(`Got ${allMovements.length} movements.`)

  async function fetchActivityDetail(activityId: string): Promise<SessionMovement[] | null> {
    try {
      const data = await http.request(`/users/${userId}/workout-activities/${activityId}`)
      const byMovement = new Map<string, { name: string; warmupSets: MovementSet[]; workingSets: MovementSet[] }>()
      for (const s of (data.workoutSetActivity ?? [])) {
        const mid = s.movementId
        if (!mid) continue
        if (!byMovement.has(mid)) {
          byMovement.set(mid, { name: nameMap.get(mid) ?? mid.slice(0, 8), warmupSets: [], workingSets: [] })
        }
        const entry = byMovement.get(mid)!
        const set: MovementSet = { reps: s.repCount ?? 0, weight_lbs: s.baseWeight ?? 0 }
        if (s.prescribedDuration) set.duration_sec = s.prescribedDuration
        if (s.warmUp) entry.warmupSets.push(set)
        else entry.workingSets.push(set)
      }
      const result: SessionMovement[] = []
      for (const [, m] of byMovement) {
        if (m.workingSets.length === 0) continue  // skip rest/warmup-only
        result.push({ name: m.name, warmup_sets: m.warmupSets.length, sets: m.workingSets })
      }
      return result.length > 0 ? result : null
    } catch {
      return null
    }
  }

  console.log('Fetching lifetime stats...')
  const stats = await client.getUserStatistics()
  const lifetimeStats = {
    totalWorkouts: stats.workouts.total,
    totalVolumeLbs: stats.volume.total,
    totalDurationMinutes: Math.round(stats.workouts.totalDuration / 60),
    totalTimeUnderTensionMinutes: Math.round(stats.workouts.totalTimeUnderTension / 60),
    maxVolumeInWorkout: stats.volume.maxVolumeInWorkout,
    maxVolumeInWeek: stats.volume.maxVolumeInAWeek,
    avgVolumePerWorkout: stats.volume.avgVolumePerWorkout,
    avgVolumePerWeek: stats.volume.avgVolumePerWeek,
    avgWorkoutDurationMinutes: Math.round(stats.workouts.avgWorkoutDuration / 60),
    maxWorkoutsPerWeek: stats.workouts.maxWorkoutsPerWeek,
    avgWorkoutsPerWeek: stats.workouts.avgWorkoutsPerWeek,
    totalMovements: stats.movements.total,
    totalCustomWorkouts: stats.workouts.totalCustomWorkouts,
    totalFreeliftWorkouts: stats.workouts.totalFreeliftWorkouts,
  }
  writeFileSync(LIFETIME_PATH, JSON.stringify(lifetimeStats, null, 2))
  console.log(`Wrote lifetime stats (${stats.workouts.total} workouts, ${stats.volume.total.toLocaleString()} lbs).`)

  console.log('Fetching activity summaries...')
  const allActivities = await client.getActivitySummaries()
  const activities = allActivities.filter((a: any) => a.activityType === 'Internal')
  console.log(`Got ${activities.length} Tonal workouts (${allActivities.length} total activities).`)

  // Functional Strength / Movement Quality — these are WEEKLY cumulative scores
  // (goalId metrics from the Goal Progress screen), not per-session. We attach the
  // current week's running total to every session touched in this run, matching
  // how it's always been hand-entered (whatever the screen shows "as of now").
  console.log('Fetching FS/MQ scores...')
  const FS_METRIC_ID = 'e46f85cf-a9bc-42b4-836e-52c6621e7481'
  const MQ_METRIC_ID = '5b8646fd-1df0-4b19-8c5b-72f8ad816955'
  let currentFS: number | null = null
  let currentMQ: number | null = null
  let mqDelta: number | null = null
  try {
    const metricScores = await client.getMetricScores()
    const fsScores = (metricScores[FS_METRIC_ID] ?? []).sort((a, b) => b.weekNumber - a.weekNumber)
    const mqScores = (metricScores[MQ_METRIC_ID] ?? []).sort((a, b) => b.weekNumber - a.weekNumber)
    if (fsScores[0]) currentFS = Math.round(fsScores[0].score)
    if (mqScores[0]) currentMQ = Math.round(mqScores[0].score)
    if (mqScores[0] && mqScores[1]) mqDelta = Math.round(mqScores[0].score - mqScores[1].score)
    console.log(`FS: ${currentFS} | MQ: ${currentMQ} (delta ${mqDelta})`)
  } catch (e: any) {
    console.log('FS/MQ fetch failed (non-fatal):', e.message)
  }

  const existing: SessionEntry[] = JSON.parse(readFileSync(SESSIONS_PATH, 'utf-8'))

  // Three-level lookup: activity ID > exact date+name > date only
  const byActivityId = new Map<string, SessionEntry>()
  const byDateAndName = new Map<string, SessionEntry>()
  const byDate = new Map<string, SessionEntry>()

  for (const s of existing) {
    if (s.tonal_activity_id) byActivityId.set(s.tonal_activity_id, s)
    byDateAndName.set(`${s.date}::${s.workout}`, s)
    // Date-only fallback is only safe for entries with NO tonal_activity_id at all —
    // i.e. genuinely legacy rows never tied to a real API activity. Any entry that
    // already has an ID (manual-* or a real Tonal UUID) is already fully resolved to
    // its own specific session and must never be a date-only match target for a
    // *different* activity — multiple real sessions on the same day are now routine
    // (2+ Tonal workouts/day), and this fallback previously let a second same-day
    // activity silently overwrite the first one's identity and numbers.
    if (!s.tonal_activity_id) byDate.set(s.date, s)
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
      timestamp: activity.localTimestamp,
      ...(currentFS !== null ? { functional_strength: currentFS } : {}),
      ...(currentMQ !== null ? { movement_quality: currentMQ } : {}),
      ...(mqDelta !== null ? { movement_quality_delta: mqDelta } : {}),
      duration: toMinutes(activity.duration),
      total_volume: activity.totalVolume,
      total_reps: activity.totalReps || null,
      time_under_tension: toMinutes(activity.timeUnderTension),
      total_work_kj: Math.round(activity.totalWork / 1000),
      tonal_activity_id: activity.id,
    }

    const needsMovements = !existing_entry?.movements
    const movements = needsMovements ? await fetchActivityDetail(activity.id) : existing_entry!.movements

    if (existing_entry) {
      merged.push({ ...existing_entry, ...apiFields, ...(movements ? { movements } : {}) })
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
        ...(movements ? { movements } : {}),
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
