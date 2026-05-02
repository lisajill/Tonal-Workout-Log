import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const HIP_THRUST   = 'd44826e1-f6b3-4bed-9d6f-8456d9cde3ec'
const HIP_ABDUCT   = '9bb67ac6-735c-4830-b2af-d3c0945892b3'
const LEG_EXT      = '61ff8f2b-f821-4078-a36f-67e540c8b694'
const REST         = '00000000-0000-0000-0000-000000000005'

function set(blockNumber: number, movementId: string, repetition: number, repetitionTotal: number, opts: {
  reps?: number, duration?: number, flex?: boolean, warmUp?: boolean, blockStart?: boolean
}) {
  return {
    blockStart:        opts.blockStart ?? repetition === 1,
    movementId,
    ...(opts.reps     ? { prescribedReps: opts.reps }         : {}),
    ...(opts.duration ? { prescribedDuration: opts.duration } : {}),
    dropSet: false, burnout: false, spotter: false, eccentric: false, chains: false,
    flex:            opts.flex    ?? false,
    warmUp:          opts.warmUp  ?? false,
    weightPercentage: opts.duration ? 0 : 100,
    repetition,
    repetitionTotal,
    blockNumber,
    setGroup: 1,
    round: repetition,
    description: '',
  }
}

const sets = [
  // Block 1 — Hip Thrust warmup
  set(1, HIP_THRUST, 1, 1, { reps: 5, warmUp: true, flex: false }),

  // Block 2 — Hip Thrust 3×4
  set(2, HIP_THRUST, 1, 3, { reps: 4, flex: true }),
  set(2, HIP_THRUST, 2, 3, { reps: 4, flex: true }),
  set(2, HIP_THRUST, 3, 3, { reps: 4, flex: true }),

  // Block 3 — Rest 90s
  set(3, REST, 1, 1, { duration: 90 }),

  // Block 4 — Hip Abduction 2×4
  set(4, HIP_ABDUCT, 1, 2, { reps: 4, flex: true }),
  set(4, HIP_ABDUCT, 2, 2, { reps: 4, flex: true }),

  // Block 5 — Rest 60s
  set(5, REST, 1, 1, { duration: 60 }),

  // Block 6 — Leg Extension 2×4
  set(6, LEG_EXT, 1, 2, { reps: 4, flex: true }),
  set(6, LEG_EXT, 2, 2, { reps: 4, flex: true }),
]

async function main() {
  const client = await TonalClient.create({
    username: process.env.TONAL_EMAIL,
    password: process.env.TONAL_PASSWORD,
  })
  const result = await client.createWorkout({
    title: 'Express Lower Body',
    sets,
  })
  console.log('Created:', JSON.stringify(result, null, 2))
}

main()
