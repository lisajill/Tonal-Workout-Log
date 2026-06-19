import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const client = await TonalClient.create({
  username: process.env.TONAL_EMAIL!,
  password: process.env.TONAL_PASSWORD!,
})

const REST         = '00000000-0000-0000-0000-000000000005'
const ANKLE_GEN    = '00000000-0000-0000-0000-000000000006' // Standing Hip Flexion
const GLUTE_BRIDGE = 'b686f885-427c-4e64-9aa3-4b485c82678e'
const DONKEY_KICK  = '029ea28e-328b-422e-a410-f1a8fc39c324'
const DIAG_KICK    = '7b635e41-d9d1-475b-b4a6-e2779fce5fb1'
const BICYCLE      = '447fde5d-16c6-4b22-8c2a-394a1a828b86' // off-machine, timed

const base = {
  dropSet: false, burnout: false, spotter: false,
  eccentric: false, chains: false, setGroup: 1, description: '',
}

function warmupSet(movementId: string, blockNumber: number, reps = 5) {
  return [{
    ...base, blockStart: true, movementId, prescribedReps: reps,
    repetition: 1, repetitionTotal: 1, blockNumber,
    flex: false, warmUp: true, weightPercentage: 100, round: 1,
  }]
}

function workingBlock(movementId: string, blockNumber: number, reps: number, sets = 3) {
  return Array.from({ length: sets }, (_, i) => ({
    ...base, blockStart: i === 0, movementId, prescribedReps: reps,
    repetition: i + 1, repetitionTotal: sets, blockNumber,
    flex: true, warmUp: false, weightPercentage: 100, round: i + 1,
  }))
}

function timedBlock(movementId: string, blockNumber: number, secs: number, sets = 3) {
  return Array.from({ length: sets }, (_, i) => ({
    ...base, blockStart: i === 0, movementId, prescribedDuration: secs,
    repetition: i + 1, repetitionTotal: sets, blockNumber,
    flex: false, warmUp: false, weightPercentage: 100, round: i + 1,
  }))
}

function restBlock(blockNumber: number, secs: number, filler = '') {
  return [{
    ...base, description: filler, blockStart: true, movementId: REST,
    prescribedDuration: secs, repetition: 1, repetitionTotal: 1, blockNumber,
    flex: false, warmUp: false, weightPercentage: 0, round: 1,
  }]
}

const workout = {
  title: 'GF — Bridge, Hip Flexors + Diagonal',
  description:
    'Roller + mat for bridge, then ankle strap for all standing blocks — no attachment swap. ' +
    'Bridge: let Smart Flex lead (glutes at 24%), do not push past SF. ' +
    'Hip Flexion (Ankle Strap Generic): cable low, stand side-on, drive knee forward. ' +
    'Do LEFT then RIGHT each set — no side-switch prompt on generic move. ' +
    'Standing Bicycle: off-machine bodyweight, 30s per set.',
  sets: [
    ...warmupSet(GLUTE_BRIDGE, 1),
    ...workingBlock(GLUTE_BRIDGE, 2, 5),
    ...restBlock(3, 120, 'Filler: heel drops x20 or marching in place'),
    ...workingBlock(ANKLE_GEN, 4, 5),        // Standing Hip Flexion
    ...restBlock(5, 90),
    ...workingBlock(DONKEY_KICK, 6, 5),
    ...restBlock(7, 90),
    ...workingBlock(DIAG_KICK, 8, 5),
    ...restBlock(9, 90),
    ...timedBlock(BICYCLE, 10, 30),           // Standing Bicycle — off-machine, bodyweight
    ...restBlock(11, 90, 'FINISHER: Lateral Band Walk — mini band, knees slightly bent, 15 steps each direction x3'),
  ],
}

const result = await (client as any).workoutService.createWorkout(workout)
console.log('Created:', result.title, '| ID:', result.id)
