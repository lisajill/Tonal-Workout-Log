import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const GLUTE_BRIDGE   = 'b686f885-427c-4e64-9aa3-4b485c82678e'
const SA_PULLDOWN    = '1c432cc6-60ff-46eb-9d1d-72cd1c08174d' // Half Kneeling SA Pulldown (Contralateral)
const STANDING_CHOP  = '596e7a05-1086-4045-84fb-2b8a2edc88dd'
const REST           = '00000000-0000-0000-0000-000000000005'

const sets = [
  // Block 1: Glute Bridge warmup
  { blockStart: true,  movementId: GLUTE_BRIDGE,  prescribedReps: 8, dropSet: false, repetition: 1, repetitionTotal: 1, blockNumber: 1, burnout: false, spotter: false, eccentric: false, chains: false, flex: false, warmUp: true,  weightPercentage: 100, setGroup: 1, round: 1, description: '' },

  // Block 2: Glute Bridge working sets
  { blockStart: true,  movementId: GLUTE_BRIDGE,  prescribedReps: 5, dropSet: false, repetition: 1, repetitionTotal: 3, blockNumber: 2, burnout: false, spotter: false, eccentric: false, chains: false, flex: true,  warmUp: false, weightPercentage: 100, setGroup: 1, round: 1, description: '' },
  { blockStart: false, movementId: GLUTE_BRIDGE,  prescribedReps: 5, dropSet: false, repetition: 2, repetitionTotal: 3, blockNumber: 2, burnout: false, spotter: false, eccentric: false, chains: false, flex: true,  warmUp: false, weightPercentage: 100, setGroup: 1, round: 2, description: '' },
  { blockStart: false, movementId: GLUTE_BRIDGE,  prescribedReps: 5, dropSet: false, repetition: 3, repetitionTotal: 3, blockNumber: 2, burnout: false, spotter: false, eccentric: false, chains: false, flex: true,  warmUp: false, weightPercentage: 100, setGroup: 1, round: 3, description: '' },

  // Block 3: Rest 2 min (after compound)
  { blockStart: true,  movementId: REST, prescribedDuration: 120, dropSet: false, repetition: 1, repetitionTotal: 1, blockNumber: 3, burnout: false, spotter: false, eccentric: false, chains: false, flex: false, warmUp: false, weightPercentage: 0, setGroup: 1, round: 1, description: '' },

  // Block 4: SA Pulldown (Contralateral) + Standing Chop — superset (one block)
  { blockStart: true,  movementId: SA_PULLDOWN,   prescribedReps: 5, dropSet: false, repetition: 1, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true,  warmUp: false, weightPercentage: 100, setGroup: 1, round: 1, description: '' },
  { blockStart: false, movementId: STANDING_CHOP, prescribedReps: 5, dropSet: false, repetition: 1, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true,  warmUp: false, weightPercentage: 100, setGroup: 1, round: 1, description: '' },
  { blockStart: false, movementId: SA_PULLDOWN,   prescribedReps: 5, dropSet: false, repetition: 2, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true,  warmUp: false, weightPercentage: 100, setGroup: 1, round: 2, description: '' },
  { blockStart: false, movementId: STANDING_CHOP, prescribedReps: 5, dropSet: false, repetition: 2, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true,  warmUp: false, weightPercentage: 100, setGroup: 1, round: 2, description: '' },
  { blockStart: false, movementId: SA_PULLDOWN,   prescribedReps: 5, dropSet: false, repetition: 3, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true,  warmUp: false, weightPercentage: 100, setGroup: 1, round: 3, description: '' },
  { blockStart: false, movementId: STANDING_CHOP, prescribedReps: 5, dropSet: false, repetition: 3, repetitionTotal: 3, blockNumber: 4, burnout: false, spotter: false, eccentric: false, chains: false, flex: true,  warmUp: false, weightPercentage: 100, setGroup: 1, round: 3, description: '' },
]

async function main() {
  const client = await TonalClient.create({
    username: process.env.TONAL_EMAIL,
    password: process.env.TONAL_PASSWORD,
  })
  const result = await client.createWorkout({ title: 'Glute & Core', sets })
  console.log('Created:', JSON.stringify(result, null, 2))
}

main()
