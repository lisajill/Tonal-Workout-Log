import { readFileSync, writeFileSync } from 'fs'

const path = 'src/data/sessions.json'
const sessions = JSON.parse(readFileSync(path, 'utf8'))
const idx = sessions.findIndex((s: any) => s.tonal_activity_id === 'f8f0584d-a0db-4323-90e0-e3209c8af708')
if (idx === -1) throw new Error('Session not found')

const s = sessions[idx]

// Manual fields
s.phase = 'active'
s.energy_level = 5
s.subjective_rating = 5
s.sweat = 'dry'
s.calories = 116
s.avg_hr = 111
s.max_hr = 142
s.functional_strength = 216
s.movement_quality = 82
s.movement_quality_delta = null
s.strength_overall = 484
s.strength_upper = 465
s.strength_core = 454
s.strength_lower = 534
s.shot_day = false
s.notes = 'Hands tingling throughout; reduced pulldown weight progressively (43→38→34 lbs) and hammer curl dropped to 30 lbs on set 3 due to hand/arm fatigue. Energy 5/5 despite fatigued glutes and hamstrings going in.'

// Readiness
s.pre_readiness = { glutes: 54, hamstrings: 66, quads: 72, calves: 100, abs: 100, obliques: 100, back: 80, chest: 100, shoulders: 100, biceps: 100, triceps: 100 }
s.post_readiness = { glutes: 6, hamstrings: 39, quads: 72, calves: 100, abs: 93, obliques: 98, back: 61, chest: 100, shoulders: 100, biceps: 80, triceps: 100 }

// PRs map
s.prs = {
  barbell_hip_thrust: { weight: 105, date: '2026-05-08' },
  standing_hip_abduction: { weight: 20, date: '2026-05-08' },
  standing_single_leg_hamstring_curl: { weight: 29, date: '2026-05-08' },
  half_kneeling_single_arm_pulldown_contralateral: { weight: 43, date: '2026-05-08' },
  hammer_curl: { weight: 35, date: '2026-05-08' },
}

s.muscles_high_volume = ['glutes', 'hamstrings']
s.muscles_low_volume = ['back', 'biceps']

// Fix Hip Thrust weights (API per-cable → app display total)
const hipThrust = s.movements.find((m: any) => m.name === 'Barbell Hip Thrust')
if (hipThrust) {
  hipThrust.sets[0].weight_lbs = 95
  hipThrust.sets[1].weight_lbs = 95
  hipThrust.sets[2].weight_lbs = 105
  // Set 3 PRs
  hipThrust.sets[2].prs = ['strength', 'power']
}

// Hip Abduction PRs (6 sets = 3 pairs; sets 0-1 = user set 1, sets 4-5 = user set 3)
const hipAbd = s.movements.find((m: any) => m.name === 'Standing Hip Abduction')
if (hipAbd) {
  hipAbd.sets[0].prs = ['power']
  hipAbd.sets[1].prs = ['power']
  hipAbd.sets[4].prs = ['power']
  hipAbd.sets[5].prs = ['power']
}

// SL Hamstring Curl PRs (6 sets = 3 pairs)
const hamCurl = s.movements.find((m: any) => m.name === 'Standing Single Leg Hamstring Curl')
if (hamCurl) {
  hamCurl.sets[0].prs = ['strength', 'power']
  hamCurl.sets[1].prs = ['strength', 'power']
  hamCurl.sets[4].prs = ['strength']
  hamCurl.sets[5].prs = ['strength']
}

// SA Pulldown PRs (6 sets = 3 pairs; set 1 = indices 0-1)
const pulldown = s.movements.find((m: any) => m.name === 'Half Kneeling Single Arm Pulldown (Contralateral)')
if (pulldown) {
  pulldown.sets[0].prs = ['strength']
  pulldown.sets[1].prs = ['strength']
}

// Hammer Curl PRs
const hammerCurl = s.movements.find((m: any) => m.name === 'Hammer Curl')
if (hammerCurl) {
  hammerCurl.sets[0].prs = ['strength']
  hammerCurl.sets[1].prs = ['strength']
}

writeFileSync(path, JSON.stringify(sessions, null, 2))
console.log('Updated session at index', idx)
console.log('Hip Thrust sets:', JSON.stringify(hipThrust?.sets, null, 2))
