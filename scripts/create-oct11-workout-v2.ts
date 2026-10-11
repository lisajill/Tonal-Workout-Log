import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const GLUTE_BRIDGE        = 'b686f885-427c-4e64-9aa3-4b485c82678e'
const BARBELL_RDL         = 'ef5f1802-a99e-4e56-b473-32bbf353fb73'
const RESISTED_STEP_UP    = '4b4e3a95-d62a-40b5-873c-1287432c1824'
const SA_ROW               = '6143f6f7-a9ad-4c8b-a63e-c44f59526014' // Standing Single-Arm Row
const LATERAL_BRIDGE_ROW  = 'd509c836-0e78-48d5-8daf-3900add72be4'
const REST                 = '00000000-0000-0000-0000-000000000005'

function block(movementId: string, reps: number, blockNumber: number, count: number) {
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

function rest(blockNumber: number, seconds: number) {
  return [{
    blockStart: true,
    movementId: REST,
    prescribedDuration: seconds,
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
  // Block 1: Glute Bridge warmup
  { blockStart: true, movementId: GLUTE_BRIDGE, prescribedReps: 8, dropSet: false, repetition: 1, repetitionTotal: 1, blockNumber: 1, burnout: false, spotter: false, eccentric: false, chains: false, flex: false, warmUp: true, weightPercentage: 100, setGroup: 1, round: 1, description: '' },

  // Block 2: Glute Bridge working sets
  ...block(GLUTE_BRIDGE, 5, 2, 3),

  // Block 3: Barbell RDL working sets (same bar attachment, no rig change)
  ...block(BARBELL_RDL, 5, 3, 3),

  // Block 4: Rest 2 min (bar -> handles)
  ...rest(4, 120),

  // Block 5: Resisted Step Up working sets
  ...block(RESISTED_STEP_UP, 4, 5, 3),

  // Block 6: Standing Single-Arm Row working sets
  ...block(SA_ROW, 5, 6, 3),

  // Block 7: Lateral Bridge with Row working sets
  ...block(LATERAL_BRIDGE_ROW, 5, 7, 3),
]

async function main() {
  const client = await TonalClient.create({
    username: process.env.TONAL_EMAIL!,
    password: process.env.TONAL_PASSWORD!,
  })

  // Delete the broken superset version first
  await client.deleteWorkout('5945da70-9c00-49c8-9621-14b8daa69a56')
  console.log('Deleted old workout')

  const result = await client.createWorkout({ title: 'Glute Bridge, RDL & Step Up', sets })
  console.log('Created:', result.id)
  for (const s of result.sets) {
    console.log(`block:${s.blockNumber} rep:${s.repetition}/${s.repetitionTotal} id:${s.movementId} reps:${s.prescribedReps} dur:${s.prescribedDuration}`)
  }
}

main()
