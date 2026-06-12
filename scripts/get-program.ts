import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

async function main() {
  const client = await TonalClient.create({ username: process.env.TONAL_EMAIL!, password: process.env.TONAL_PASSWORD! })
  const http = (client as any).httpClient

  const programId = '225c3846-b4f3-44e5-8302-630d3afcc17e'
  const program = await http.request(`/programs/${programId}`)
  
  const workouts = program.programWorkouts ?? program.workouts ?? []
  workouts.forEach((w: any, i: number) => {
    const name = w.name ?? w.workout?.name ?? `Workout ${i+1}`
    const blocks = w.blocks ?? w.workout?.blocks ?? []
    const movements: string[] = []
    blocks.forEach((b: any) => {
      (b.sets ?? []).forEach((s: any) => {
        const mn = s.movementName ?? s.movement?.name ?? s.movementId
        if (mn) movements.push(mn)
      })
    })
    const unique = [...new Set(movements)]
    console.log(`${i+1}. ${name}`)
    if (unique.length) console.log(`   ${unique.join(', ')}`)
  })
}

main().catch(console.error)
