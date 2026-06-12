import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const CHEST_PRESS   = 'ce9f5bf6-df1f-430b-a69e-89b455664b53'
const TRI_EXTENSION = '8571813d-b302-4cbe-a3b5-cc805a046b7d'
const FACE_PULL     = '2e706f78-af9a-41cb-aaaf-20df3212b690'
const CHOP          = '596e7a05-1086-4045-84fb-2b8a2edc88dd'
const REST          = '00000000-0000-0000-0000-000000000005'

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
  // Block 1: Chest Press warmup
  {
    blockStart: true,
    movementId: CHEST_PRESS,
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
  // Block 2: Chest Press working sets
  ...workingBlock(CHEST_PRESS, 2, 4),
  // Block 3: Rest 2 min
  ...restBlock(3, 120),
  // Block 4: Triceps Extension
  ...workingBlock(TRI_EXTENSION, 4, 4),
  // Block 5: Rest 90s
  ...restBlock(5, 90),
  // Block 6: Standing Face Pull
  ...workingBlock(FACE_PULL, 6, 4),
  // Block 7: Rest 90s
  ...restBlock(7, 90),
  // Block 8: Standing Chop
  ...workingBlock(CHOP, 8, 4),
]

const client = await TonalClient.create({
  username: process.env.TONAL_EMAIL!,
  password: process.env.TONAL_PASSWORD!,
})

const workout = await client.createWorkout({
  title: 'Standing Push & Pull',
  sets,
})

console.log('Created:', workout.id, workout.name ?? workout.title)
