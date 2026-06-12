import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

async function main() {
  const client = await TonalClient.create({ username: process.env.TONAL_EMAIL!, password: process.env.TONAL_PASSWORD! })
  const http = (client as any).httpClient
  const userInfo = await (client as any).userService.getUserInfo()
  const uid = userInfo.id

  const allMovements = await http.request('/movements')
  const movMap: Record<string, string> = {}
  for (const m of allMovements) movMap[m.id] = m.name

  const ids = [
    { id: '15c98432-6eef-421d-82ca-aa449994fa35', label: 'Week 2 Day 1' },
    { id: 'a5096dcc-e12f-4bb7-8887-dd0bece5acc5', label: 'Free Lift May 28' },
  ]

  for (const { id, label } of ids) {
    const data = await http.request(`/users/${uid}/workout-activities/${id}`)
    const sets = data.workoutSetActivity ?? []

    const blocks: Record<string, any> = {}
    for (const s of sets) {
      const name = movMap[s.movementId] ?? s.movementId
      if (!blocks[name]) blocks[name] = { warmup: [], working: [] }
      const weightKg = s.baseWeight ?? 0
      const weightLbs = Math.round(weightKg * 2.20462 * 10) / 10
      const entry: any = { reps: s.repetitionTotal, weight_lbs: weightLbs }
      if (s.prescribedDuration > 0) entry.duration_sec = s.prescribedDuration
      if (s.warmUp) blocks[name].warmup.push(entry)
      else blocks[name].working.push(entry)
    }

    console.log(`\n=== ${label} ===`)
    for (const [name, b] of Object.entries(blocks)) {
      console.log(`${name}: warmup=${b.warmup.length} sets, working=${b.working.length} sets`)
      if (b.warmup.length) console.log(`  Warmup: ${b.warmup.map((s: any) => `${s.reps}r@${s.weight_lbs}lbs`).join(', ')}`)
      b.working.forEach((s: any, i: number) => console.log(`  Set ${i+1}: ${s.reps} reps @ ${s.weight_lbs} lbs${s.duration_sec ? ` (${s.duration_sec}s)` : ''}`))
    }
  }
}

main().catch(console.error)
