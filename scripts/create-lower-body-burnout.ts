import 'dotenv/config'
import TonalClient from '@dlwiest/ts-tonal-client'

const client = await TonalClient.create({
  username: process.env.TONAL_EMAIL!,
  password: process.env.TONAL_PASSWORD!,
})

const REST          = '00000000-0000-0000-0000-000000000005'
const GOBLET_SQUAT  = 'b74bbdaf-8a92-497e-ab9e-88e8e1c161b0'
const DEADLIFT_NG   = 'a9756142-cce9-4720-ba97-2a84a1cf865b'
const SUITCASE_DL   = '0cbe3d68-2026-41fe-a2fc-a598f7dc0b2c'
const SEATED_ROW    = '517eadf3-84a0-4800-96f3-072f4a53c7f8'
const FARMER_MARCH  = 'b11f89b0-5470-44a2-b70a-5391e972eb71'

const base = {
  dropSet: false, burnout: false, spotter: false,
  eccentric: false, chains: false, setGroup: 1, description: '',
}

function workingBlock(movementId: string, blockNumber: number, reps: number, sets = 3) {
  return Array.from({ length: sets }, (_, i) => ({
    ...base,
    blockStart: i === 0,
    movementId,
    prescribedReps: reps,
    repetition: i + 1,
    repetitionTotal: sets,
    blockNumber,
    flex: true,
    warmUp: false,
    weightPercentage: 100,
    round: i + 1,
  }))
}

function restBlock(blockNumber: number, secs: number) {
  return [{
    ...base,
    blockStart: true,
    movementId: REST,
    prescribedDuration: secs,
    repetition: 1,
    repetitionTotal: 1,
    blockNumber,
    flex: false,
    warmUp: false,
    weightPercentage: 0,
    round: 1,
  }]
}

const sets = [
  // Block 1: Goblet Squat to Bench — warmup
  { ...base, blockStart: true, movementId: GOBLET_SQUAT, prescribedReps: 5,
    repetition: 1, repetitionTotal: 1, blockNumber: 1,
    flex: false, warmUp: true, weightPercentage: 100, round: 1 },

  // Block 2: Goblet Squat to Bench — working 3×5
  ...workingBlock(GOBLET_SQUAT, 2, 5),

  // Block 3: Rest 2 min
  ...restBlock(3, 120),

  // Block 4: Neutral Grip Deadlift 3×5
  ...workingBlock(DEADLIFT_NG, 4, 5),

  // Block 5: Rest 90s
  ...restBlock(5, 90),

  // Block 6: Suitcase Deadlift 3×5
  ...workingBlock(SUITCASE_DL, 6, 5),

  // Block 7: Rest 90s
  ...restBlock(7, 90),

  // Block 8: Seated Row 3×5
  ...workingBlock(SEATED_ROW, 8, 5),

  // Block 9: Rest 90s
  ...restBlock(9, 90),

  // Block 10: Farmer March 2×30s (Free Lift, timed)
  ...Array.from({ length: 2 }, (_, i) => ({
    ...base,
    blockStart: i === 0,
    movementId: FARMER_MARCH,
    prescribedDuration: 30,
    repetition: i + 1,
    repetitionTotal: 2,
    blockNumber: 10,
    flex: false,
    warmUp: false,
    weightPercentage: 100,
    round: i + 1,
  })),
]

const workout = await (client as any).createWorkout({ title: 'Lower Body Burnout', sets })
console.log('Created workout ID:', workout.id)
console.log(JSON.stringify(workout, null, 2))
