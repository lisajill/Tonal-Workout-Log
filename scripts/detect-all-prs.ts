import 'dotenv/config'
import { readFileSync, writeFileSync } from 'fs'
import TonalClient from '@dlwiest/ts-tonal-client'

interface SessionEntry {
  date: string
  workout: string
  tonal_activity_id?: string
  timestamp?: string
  merged_into?: string
}

async function main() {
  const client = await TonalClient.create({ username: process.env.TONAL_EMAIL!, password: process.env.TONAL_PASSWORD! })
  const http = (client as any).httpClient
  const userInfo = await (client as any).userService.getUserInfo()
  const uid = userInfo.id ?? userInfo.userId ?? userInfo.sub

  console.log('Fetching movement catalog...')
  const movementCatalog: any[] = await http.request('/movements')
  const movementNames: Record<string, string> = {}
  for (const m of movementCatalog) movementNames[m.id] = m.name

  const sessions: SessionEntry[] = JSON.parse(readFileSync('src/data/sessions.json', 'utf-8'))

  const realSessions = sessions
    .filter(s => s.tonal_activity_id && !s.tonal_activity_id.startsWith('manual') && !s.merged_into)
    .sort((a, b) => (a.timestamp ?? a.date).localeCompare(b.timestamp ?? b.date))

  console.log(`Scanning ${realSessions.length} sessions for oneRepMax PRs...\n`)

  const bestByMovement: Record<string, { value: number, date: string }> = {}
  // date|movement -> best set that day (only the single best set per movement per day is reportable)
  const dayBest: Record<string, { date: string, workout: string, movement: string, setIndex: number, oneRepMax: number, weight: number, reps: number }> = {}

  for (const s of realSessions) {
    try {
      const activity = await http.request(`/users/${uid}/workout-activities/${s.tonal_activity_id}`)
      const setsByMovement: Record<string, any[]> = {}
      for (const set of activity.workoutSetActivity ?? []) {
        if (set.movementId === '00000000-0000-0000-0000-000000000005') continue // skip Rest
        if (set.warmUp) continue
        if (set.oneRepMax == null) continue
        if (!set.baseWeight || !set.repCount) continue // skip bodyweight/isometric/0-rep — oneRepMax is a meaningless floor value for these
        const name = movementNames[set.movementId] ?? set.movementId
        if (!setsByMovement[name]) setsByMovement[name] = []
        setsByMovement[name].push(set)
      }
      for (const [name, sets] of Object.entries(setsByMovement)) {
        const seenBefore = name in bestByMovement
        for (let i = 0; i < sets.length; i++) {
          const set = sets[i]
          const orm = set.oneRepMax
          const prior = bestByMovement[name]
          // first-ever sighting of a movement is a baseline, not a PR
          if (seenBefore && (!prior || orm > prior.value)) {
            const dayKey = `${s.date}|${name}`
            const existing = dayBest[dayKey]
            if (!existing || orm > existing.oneRepMax) {
              dayBest[dayKey] = {
                date: s.date, workout: s.workout, movement: name, setIndex: i + 1,
                oneRepMax: Math.round(orm * 10) / 10, weight: Math.round((set.baseWeight ?? 0) * 10) / 10, reps: set.repCount,
              }
            }
          }
          if (!prior || orm > prior.value) bestByMovement[name] = { value: orm, date: s.date }
        }
      }
    } catch (e: any) {
      console.log(`  (skipped ${s.date} ${s.workout}: ${e.message})`)
    }
  }

  const detectedPRs = Object.values(dayBest).sort((a, b) => a.date.localeCompare(b.date))

  console.log(`\nFound ${detectedPRs.length} genuine PR days (new all-time est. 1RM per movement, baseline sightings excluded):\n`)
  for (const pr of detectedPRs) {
    console.log(`${pr.date} | ${pr.movement.padEnd(35)} | set ${pr.setIndex} | ${pr.weight}lb x${pr.reps} | est 1RM ${pr.oneRepMax}`)
  }

  const outPath = '/private/tmp/claude-501/-Users-lisa-Documents-AI-Tonal-Workout-Log/fc81b92c-b516-4462-b5ba-be12f1cc8c3d/scratchpad/detected_prs.json'
  writeFileSync(outPath, JSON.stringify(detectedPRs, null, 2))
  console.log(`\nWrote ${outPath}`)
}

main()
