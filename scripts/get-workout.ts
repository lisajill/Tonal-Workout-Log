import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

async function main() {
  const client = await TonalClient.create({ username: process.env.TONAL_EMAIL!, password: process.env.TONAL_PASSWORD! })
  const http = (client as any).httpClient
  const workout = await http.request('/user-workouts/4245626c-98e4-455e-a938-4db49bd2d539')
  for (const s of workout.sets ?? []) {
    console.log(`block:${s.blockNumber} rep:${s.repetition}/${s.repetitionTotal} id:${s.movementId} reps:${s.prescribedReps} dur:${s.prescribedDuration} desc:"${s.description}"`)
  }
}
main()
