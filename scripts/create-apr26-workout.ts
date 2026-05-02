import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const client = await TonalClient.create({
  username: process.env.TONAL_EMAIL!,
  password: process.env.TONAL_PASSWORD!,
})

const HIP_THRUST      = 'd44826e1-f6b3-4bed-9d6f-8456d9cde3ec'
const PRONE_BENCH_HC  = 'bb513dfe-19c8-4490-bfc8-d8e71b81b52a'
const PRONE_BENCH_SL  = '752e2f27-11d5-4758-801d-f030ac5eac7c'
const LEG_EXT         = '61ff8f2b-f821-4078-a36f-67e540c8b694'
const REST            = '00000000-0000-0000-0000-000000000005'

const base = { dropSet: false, burnout: false, spotter: false, eccentric: false, chains: false, weightPercentage: 100, setGroup: 1, description: '' }

const sets = [
  // Block 1 — Hip Thrust warmup only
  { ...base, blockStart: true,  movementId: HIP_THRUST,     prescribedReps: 8, repetition: 1, repetitionTotal: 1, blockNumber: 1, flex: false, warmUp: true,  round: 1 },

  // Block 2 — Rest 2 min
  { ...base, blockStart: true,  movementId: REST, prescribedDuration: 120, repetition: 1, repetitionTotal: 1, blockNumber: 2, flex: false, warmUp: false, weightPercentage: 0, round: 1 },

  // Block 3 — Prone Bench Hamstring Curl (1 warmup + 3 working)
  { ...base, blockStart: true,  movementId: PRONE_BENCH_HC, prescribedReps: 8, repetition: 1, repetitionTotal: 4, blockNumber: 3, flex: false, warmUp: true,  round: 1 },
  { ...base, blockStart: false, movementId: PRONE_BENCH_HC, prescribedReps: 5, repetition: 2, repetitionTotal: 4, blockNumber: 3, flex: true,  warmUp: false, round: 2 },
  { ...base, blockStart: false, movementId: PRONE_BENCH_HC, prescribedReps: 5, repetition: 3, repetitionTotal: 4, blockNumber: 3, flex: true,  warmUp: false, round: 3 },
  { ...base, blockStart: false, movementId: PRONE_BENCH_HC, prescribedReps: 5, repetition: 4, repetitionTotal: 4, blockNumber: 3, flex: true,  warmUp: false, round: 4 },

  // Block 4 — Rest 90s
  { ...base, blockStart: true,  movementId: REST, prescribedDuration: 90, repetition: 1, repetitionTotal: 1, blockNumber: 4, flex: false, warmUp: false, weightPercentage: 0, round: 1 },

  // Block 5 — Prone Bench SL Hamstring Curl (3 working)
  { ...base, blockStart: true,  movementId: PRONE_BENCH_SL, prescribedReps: 5, repetition: 1, repetitionTotal: 3, blockNumber: 5, flex: true,  warmUp: false, round: 1 },
  { ...base, blockStart: false, movementId: PRONE_BENCH_SL, prescribedReps: 5, repetition: 2, repetitionTotal: 3, blockNumber: 5, flex: true,  warmUp: false, round: 2 },
  { ...base, blockStart: false, movementId: PRONE_BENCH_SL, prescribedReps: 5, repetition: 3, repetitionTotal: 3, blockNumber: 5, flex: true,  warmUp: false, round: 3 },

  // Block 6 — Rest 90s
  { ...base, blockStart: true,  movementId: REST, prescribedDuration: 90, repetition: 1, repetitionTotal: 1, blockNumber: 6, flex: false, warmUp: false, weightPercentage: 0, round: 1 },

  // Block 7 — Standing Leg Extension (1 warmup + 3 working)
  { ...base, blockStart: true,  movementId: LEG_EXT, prescribedReps: 6, repetition: 1, repetitionTotal: 4, blockNumber: 7, flex: false, warmUp: true,  round: 1 },
  { ...base, blockStart: false, movementId: LEG_EXT, prescribedReps: 6, repetition: 2, repetitionTotal: 4, blockNumber: 7, flex: true,  warmUp: false, round: 2 },
  { ...base, blockStart: false, movementId: LEG_EXT, prescribedReps: 6, repetition: 3, repetitionTotal: 4, blockNumber: 7, flex: true,  warmUp: false, round: 3 },
  { ...base, blockStart: false, movementId: LEG_EXT, prescribedReps: 6, repetition: 4, repetitionTotal: 4, blockNumber: 7, flex: true,  warmUp: false, round: 4 },
]

const workout = await client.createWorkout({
  title: 'Hamstring + Quad Strength',
  sets,
})

console.log('Workout ID:', workout.id)
console.log('Created:', workout.name)
