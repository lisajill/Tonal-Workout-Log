import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

async function main() {
  const client = await TonalClient.create({ username: process.env.TONAL_EMAIL!, password: process.env.TONAL_PASSWORD! })
  const http = (client as any).httpClient
  const workout = await http.request('/user-workouts/5945da70-9c00-49c8-9621-14b8daa69a56')
  for (const s of workout.sets ?? []) {
    console.log(`block:${s.blockNumber} blockStart:${s.blockStart} rep:${s.repetition}/${s.repetitionTotal} sortOrder:${s.sortOrder} id:${s.movementId} reps:${s.prescribedReps} dur:${s.prescribedDuration}`)
  }
}
main()
