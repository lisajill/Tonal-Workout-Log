import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const HIP_THRUST = 'd44826e1-f6b3-4bed-9d6f-8456d9cde3ec'
const BENCH      = '8edc0211-4594-4e5e-8e1b-b05dfc1d67c7'
const PULLDOWN   = '0c498470-12f9-4b8b-83e8-940e70f7b967'

function set(blockNumber: number, movementId: string, repetition: number, repetitionTotal: number, opts: {
  reps?: number, duration?: number, flex?: boolean, warmUp?: boolean, blockStart?: boolean
}) {
  return {
    blockStart:       opts.blockStart ?? repetition === 1,
    movementId,
    ...(opts.reps     ? { prescribedReps: opts.reps }         : {}),
    ...(opts.duration ? { prescribedDuration: opts.duration } : {}),
    dropSet: false, burnout: false, spotter: false, eccentric: false, chains: false,
    flex:             opts.flex   ?? false,
    warmUp:           opts.warmUp ?? false,
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
  set(1, HIP_THRUST, 1, 1, { reps: 5, warmUp: true }),

  // Block 2 — Bench Press warmup
  set(2, BENCH, 1, 1, { reps: 5, warmUp: true }),

  // Block 3 — Pulldown warmup
  set(3, PULLDOWN, 1, 1, { reps: 5, warmUp: true }),

  // Block 4 — Tri-set: Hip Thrust → Bench Press → Pulldown, 3 rounds
  set(4, HIP_THRUST, 1, 3, { reps: 5, flex: true, blockStart: true }),
  set(4, BENCH,      1, 3, { reps: 5, flex: true, blockStart: false }),
  set(4, PULLDOWN,   1, 3, { reps: 5, flex: true, blockStart: false }),

  set(4, HIP_THRUST, 2, 3, { reps: 5, flex: true, blockStart: false }),
  set(4, BENCH,      2, 3, { reps: 5, flex: true, blockStart: false }),
  set(4, PULLDOWN,   2, 3, { reps: 5, flex: true, blockStart: false }),

  set(4, HIP_THRUST, 3, 3, { reps: 5, flex: true, blockStart: false }),
  set(4, BENCH,      3, 3, { reps: 5, flex: true, blockStart: false }),
  set(4, PULLDOWN,   3, 3, { reps: 5, flex: true, blockStart: false }),
]

async function main() {
  const client = await TonalClient.create({
    username: process.env.TONAL_EMAIL,
    password: process.env.TONAL_PASSWORD,
  })
  const result = await client.createWorkout({ title: 'First Hands Back', sets })
  console.log('Created:', JSON.stringify(result, null, 2))
}

main()
