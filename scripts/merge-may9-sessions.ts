import fs from 'fs'

const SESSIONS_PATH = 'src/data/sessions.json'
const MAIN_ID = 'd44eb4e1-ac92-4a69-a400-cd55702ad725'
const FREE_ID = '8f68b8c3-5015-4b99-b90b-dd660a4c60be'

const sessions = JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf8'))

const main = sessions.find((s: any) => s.tonal_activity_id === MAIN_ID)
const free = sessions.find((s: any) => s.tonal_activity_id === FREE_ID)

if (!main || !free) throw new Error('Could not find both sessions')

// Mark Free Lift as merged
free.merged_into = MAIN_ID

// Combined stats
main.duration = 29.77
main.total_volume = 3203
main.total_reps = 115
main.time_under_tension = 9.82
main.total_work_kj = 10
main.calories = 92
main.avg_hr = 95
main.max_hr = 124

// Manual fields
main.energy_level = 5
main.subjective_rating = 5
main.sweat = 'dry'
main.shot_day = false
main.functional_strength = 345
main.movement_quality = 110
main.strength_overall = 493
main.strength_upper = 487
main.strength_core = 456
main.strength_lower = 535

// Pre-readiness (May 8 post-readiness as best approximation)
main.pre_readiness = {
  glutes: 6,
  hamstrings: 39,
  quads: 72,
  calves: 100,
  abs: 93,
  obliques: 98,
  back: 61,
  chest: 100,
  shoulders: 100,
  biceps: 80,
  triceps: 100,
}

// Post-readiness (from MCP get_readiness after workout)
main.post_readiness = {
  glutes: 9,
  hamstrings: 40,
  quads: 96,
  calves: 100,
  abs: 87,
  obliques: 92,
  back: 66,
  chest: 82,
  shoulders: 80,
  biceps: 88,
  triceps: 59,
}

// PRs
main.prs = {
  standing_chest_press: { weight: 17, date: '2026-05-09' },
  triceps_extension: { weight: 39, date: '2026-05-09' },
  standing_face_pull: { weight: 49, date: '2026-05-09' },
  standing_chop: { weight: 28, date: '2026-05-09' },
  alternating_biceps_curl: { weight: 15, date: '2026-05-09' },
}

// Per-set PR flags — Standing Chest Press (warmup + 3 working sets)
const chestPress = main.movements.find((m: any) => m.name === 'Standing Chest Press')
chestPress.sets[0].prs = ['strength']
chestPress.sets[1].prs = ['power']

// Triceps Extension
const triExt = main.movements.find((m: any) => m.name === 'Triceps Extension')
triExt.sets[0].prs = ['strength']

// Standing Face Pull
const facePull = main.movements.find((m: any) => m.name === 'Standing Face Pull')
facePull.sets[0].prs = ['strength', 'power']

// Standing Chop — 6 sets (3 rounds × 2 sides); user called rounds 1/2/3
const chop = main.movements.find((m: any) => m.name === 'Standing Chop')
chop.sets[0].prs = ['power']             // round 1 first side
chop.sets[2].prs = ['strength', 'power'] // round 2 first side (28 lbs = strength PR)
chop.sets[4].prs = ['power']             // round 3 first side

// Append Free Lift movements
const freeMoves = free.movements.map((m: any) => {
  if (m.name === 'Alternating Biceps Curl') {
    m.sets[0].prs = ['strength', 'power']
  }
  return m
})
main.movements = [...main.movements, ...freeMoves]

main.notes = 'Standing-only due to hair dye (no bending/lying). First time on standing push movements. Hands tingling throughout but manageable with press movements. Then free lift: Alternating Biceps Curl (strength+power PR at 15 lbs, dropped to 10), Triceps Kickbacks 3×5@8, Pull Through progressive 30→35→40 lbs. Strong energy throughout.'

fs.writeFileSync(SESSIONS_PATH, JSON.stringify(sessions, null, 2))
console.log('Merged. Main session updated, Free Lift marked merged_into.')
console.log('Duration:', main.duration, '| Volume:', main.total_volume, '| kJ:', main.total_work_kj)
