import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const GLUTE_BRIDGE        = 'b686f885-427c-4e64-9aa3-4b485c82678e'
const BARBELL_RDL         = 'ef5f1802-a99e-4e56-b473-32bbf353fb73'
const RESISTED_STEP_UP    = '4b4e3a95-d62a-40b5-873c-1287432c1824'
const SA_ROW               = '6143f6f7-a9ad-4c8b-a63e-c44f59526014' // Standing Single-Arm Row
const LATERAL_BRIDGE_ROW  = 'd509c836-0e78-48d5-8daf-3900add72be4'
const REST                 = '00000000-0000-0000-0000-000000000005'

const sets = [
  // Block 1: Glute Bridge warmup
  { blockStart: true,  movementId: GLUTE_BRIDGE, prescribedReps: 8, dropSet: false, repetition: 1, repetitionTotal: 1, blockNumber: 1, burnout: false, spotter: false, eccentric: false, chains: false, flex: false, warmUp: true,  weightPercentage: 100, setGroup: 1, round: 1, description: '' },

  // Block 2: Glute Bridge + Barbell RDL — circuit, same bar attachment
  { blockStart: true,  movementId: GLUTE_BRIDGE, prescribedReps: 5, dropSet: false, repetition: 1, repetitionTotal: 3, blockNumber: 2, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 1, description: '' },
  { blockStart: false, movementId: BARBELL_RDL,  prescribedReps: 5, dropSet: false, repetition: 1, repetitionTotal: 3, blockNumber: 2, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 1, description: '' },
  { blockStart: false, movementId: GLUTE_BRIDGE, prescribedReps: 5, dropSet: false, repetition: 2, repetitionTotal: 3, blockNumber: 2, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 2, description: '' },
  { blockStart: false, movementId: BARBELL_RDL,  prescribedReps: 5, dropSet: false, repetition: 2, repetitionTotal: 3, blockNumber: 2, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 2, description: '' },
  { blockStart: false, movementId: GLUTE_BRIDGE, prescribedReps: 5, dropSet: false, repetition: 3, repetitionTotal: 3, blockNumber: 2, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 3, description: '' },
  { blockStart: false, movementId: BARBELL_RDL,  prescribedReps: 5, dropSet: false, repetition: 3, repetitionTotal: 3, blockNumber: 2, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 3, description: '' },

  // Block 3: Rest 2 min (bar -> handles attachment swap)
  { blockStart: true, movementId: REST, prescribedDuration: 120, dropSet: false, repetition: 1, repetitionTotal: 1, blockNumber: 3, burnout: false, spotter: false, eccentric: false, chains: false, flex: false, warmUp: false, weightPercentage: 0, setGroup: 1, round: 1, description: '' },

  // Block 4: Resisted Step Up + Standing Single-Arm Row + Lateral Bridge with Row — 3-way circuit, same handle attachment
  { blockStart: true,  movementId: RESISTED_STEP_UP,   prescribedReps: 4, dropSet: false, repetition: 1, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 1, description: '' },
  { blockStart: false, movementId: SA_ROW,              prescribedReps: 5, dropSet: false, repetition: 1, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 1, description: '' },
  { blockStart: false, movementId: LATERAL_BRIDGE_ROW,  prescribedReps: 5, dropSet: false, repetition: 1, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 1, description: '' },
  { blockStart: false, movementId: RESISTED_STEP_UP,   prescribedReps: 4, dropSet: false, repetition: 2, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 2, description: '' },
  { blockStart: false, movementId: SA_ROW,              prescribedReps: 5, dropSet: false, repetition: 2, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 2, description: '' },
  { blockStart: false, movementId: LATERAL_BRIDGE_ROW,  prescribedReps: 5, dropSet: false, repetition: 2, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 2, description: '' },
  { blockStart: false, movementId: RESISTED_STEP_UP,   prescribedReps: 4, dropSet: false, repetition: 3, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 3, description: '' },
  { blockStart: false, movementId: SA_ROW,              prescribedReps: 5, dropSet: false, repetition: 3, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 3, description: '' },
  { blockStart: false, movementId: LATERAL_BRIDGE_ROW,  prescribedReps: 5, dropSet: false, repetition: 3, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true, warmUp: false, weightPercentage: 100, setGroup: 1, round: 3, description: '' },
]

async function main() {
  const client = await TonalClient.create({
    username: process.env.TONAL_EMAIL!,
    password: process.env.TONAL_PASSWORD!,
  })
  const result = await client.createWorkout({ title: 'Glute Bridge, RDL & Step Up Circuit', sets })
  console.log('Created:', JSON.stringify(result, null, 2))
}

main()
