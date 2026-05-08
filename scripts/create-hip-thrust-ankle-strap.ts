import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const HIP_THRUST       = 'd44826e1-f6b3-4bed-9d6f-8456d9cde3ec'
const HIP_ABDUCTION    = '9bb67ac6-735c-4830-b2af-d3c0945892b3'
const SL_HAM_CURL      = '27b7f142-837d-4ecf-93dd-7c13269106df'
const SA_PULLDOWN      = '1c432cc6-60ff-46eb-9d1d-72cd1c08174d'
const HAMMER_CURL      = '2cb2b3f2-ff44-49f6-9938-915295db1e82'
const REST             = '00000000-0000-0000-0000-000000000005'

function workingBlock(movementId: string, blockNumber: number, reps: number, count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    blockStart: i === 0,
    movementId,
    prescribedReps: reps,
    dropSet: false,
    repetition: i + 1,
    repetitionTotal: count,
    blockNumber,
    burnout: false,
    spotter: false,
    eccentric: false,
    chains: false,
    flex: true,
    warmUp: false,
    weightPercentage: 100,
    setGroup: 1,
    round: i + 1,
    description: '',
  }))
}

function restBlock(blockNumber: number, durationSec: number) {
  return [{
    blockStart: true,
    movementId: REST,
    prescribedDuration: durationSec,
    dropSet: false,
    repetition: 1,
    repetitionTotal: 1,
    blockNumber,
    burnout: false,
    spotter: false,
    eccentric: false,
    chains: false,
    flex: false,
    warmUp: false,
    weightPercentage: 0,
    setGroup: 1,
    round: 1,
    description: '',
  }]
}

const sets = [
  // Block 1: Hip Thrust warmup
  {
    blockStart: true,
    movementId: HIP_THRUST,
    prescribedReps: 5,
    dropSet: false,
    repetition: 1,
    repetitionTotal: 1,
    blockNumber: 1,
    burnout: false,
    spotter: false,
    eccentric: false,
    chains: false,
    flex: false,
    warmUp: true,
    weightPercentage: 100,
    setGroup: 1,
    round: 1,
    description: '',
  },
  // Block 2: Hip Thrust working sets
  ...workingBlock(HIP_THRUST, 2, 4),
  // Block 3: Rest 2 min
  ...restBlock(3, 120),
  // Block 4: Standing Hip Abduction
  ...workingBlock(HIP_ABDUCTION, 4, 4),
  // Block 5: Rest 90s
  ...restBlock(5, 90),
  // Block 6: Standing Single Leg Hamstring Curl
  ...workingBlock(SL_HAM_CURL, 6, 4),
  // Block 7: Rest 90s
  ...restBlock(7, 90),
  // Block 8: SA Pulldown Contralateral
  ...workingBlock(SA_PULLDOWN, 8, 4),
  // Block 9: Rest 90s
  ...restBlock(9, 90),
  // Block 10: Hammer Curl
  ...workingBlock(HAMMER_CURL, 10, 4),
]

const client = await TonalClient.create({
  username: process.env.TONAL_EMAIL!,
  password: process.env.TONAL_PASSWORD!,
})

const workout = await client.createWorkout({
  title: 'Hip Thrust — Ankle Strap & Grip',
  sets,
})

console.log('Created:', workout.id, workout.name)
