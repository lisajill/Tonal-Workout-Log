// Current rotation overview — rendered above the program cards
const ROTATION = {
  title: 'Current Rotation — Grip-Free Heavy',
  since: '2026-06-12',
  context: 'Hands uncleared (bilateral carpal tunnel + ulnar neuropathy, sensory-only, Jun 11 2026). Ankle straps + hip-resting barbell only. Low reps, very high load, full muscle burnout per session.',
  week: [
    { day: 'Sun', workout: 'Grip-Free 1 — Hip Power', intensity: 'HEAVY thrust — PR hunt' },
    { day: 'Tue', workout: 'Grip-Free 2 — Hamstring Burnout', intensity: 'HEAVY bridge — PR hunt' },
    { day: 'Thu', workout: 'Grip-Free 3 — Unilateral Stability', intensity: 'Moderate thrust (~90%)' },
    { day: 'Sat', workout: 'Grip-Free 4 — Quad & Core', intensity: 'Moderate bridge (~90%)' },
    { day: 'Floats', workout: 'Aux — Pilates Upper & Core', intensity: 'Light · 1–2×/week' },
  ],
  rules: [
    'Staged rollout: weeks 1–2 the only goal is GF1–GF2–GF3 completed each week — GF4 + Aux are bonus until the rhythm holds',
    'Deload rule: pre-session glutes or hamstrings < 70% readiness → hold last week’s loads, no pushing',
    '3-min general warmup every session: bodyweight glute bridges ×15, leg swings, cat-cow',
    'Vest on for all standing blocks — axial bone loading + balance demand',
    'Hands: bar rests on hips, hands only steady it. Tingling or numbness = stop',
    '25–30g protein within 2h of every session',
    'Riding days displace a main day — a schooling day is not a rest day',
  ],
}

export const PROGRAMS = [
  {
    id: 'gf1',
    name: 'Grip-Free 1 — Hip Power',
    subtitle: 'Grip-free · HEAVY hip thrust · Glute burnout from 3 angles · Vest on standing work · ~30 min',
    created: '2026-06-12',
    anchor: 'Barbell Hip Thrust — HEAVY day, PR hunt, explosive concentric',
    blocks: [
      {
        name: 'Block 1 — Barbell · Bench',
        type: 'Warmup · Smart Flex OFF',
        exercises: [
          { name: 'Barbell Hip Thrust', sets: '1 warmup', detail: '5 reps · set bench distance first, yoga mat under bench' },
        ],
      },
      {
        name: 'Block 2 — Barbell · Bench',
        type: 'Working sets · Smart Flex ON · 5 reps',
        exercises: [
          { name: 'Barbell Hip Thrust', sets: '3', detail: '5 reps · drive up EXPLOSIVELY · PR territory 62+ lbs' },
        ],
      },
      {
        name: 'Block 3 — Rest',
        type: '2 min',
        exercises: [
          { name: 'Rest', sets: '—', detail: '120s · Filler: vest heel drops ×20 (bone loading)' },
        ],
      },
      {
        name: 'Block 4 — Ankle Straps · Standing · Vest on',
        type: 'Working sets · Smart Flex ON · 5 reps/side',
        exercises: [
          { name: 'Standing Straight Leg Glute Kickback', sets: '3', detail: '5/side · hip extension' },
        ],
      },
      {
        name: 'Block 5 — Rest',
        type: '90 sec',
        exercises: [
          { name: 'Rest', sets: '—', detail: '90s · Filler: clamshells ×15/side' },
        ],
      },
      {
        name: 'Block 6 — Ankle Straps · Standing · Vest on',
        type: 'Working sets · Smart Flex ON · 5 reps/side',
        exercises: [
          { name: 'Standing Hip Abduction', sets: '3', detail: '5/side · lateral seat stability (riding)' },
        ],
      },
      {
        name: 'Block 7 — Rest',
        type: '90 sec',
        exercises: [
          { name: 'Rest', sets: '—', detail: '90s · re-strap and stand sideways for adduction' },
        ],
      },
      {
        name: 'Block 8 — Ankle Strap · Adduction',
        type: 'Working sets · manual weight · 5 reps/side',
        exercises: [
          { name: 'Ankle Strap Move (Hip Adduction)', sets: '3', detail: '5/side · sweep across midline · set weight manually ~10–15 lbs · riding leg contact' },
        ],
      },
    ],
    tiers: [
      { tier: 1, when: 'Low energy / shot day', adjustment: 'Cut Block 8 (Adduction)' },
      { tier: 2, when: 'Moderate', adjustment: 'As written' },
      { tier: 3, when: 'Strong', adjustment: 'Push thrust load — this is the PR-hunt day' },
    ],
    cutOrder: [
      'Block 8 — Hip Adduction',
      'Block 4 — Straight Leg Kickback',
      'Block 6 — Standing Hip Abduction',
      'Block 2 — never cut (anchor)',
    ],
    notes: [
      'Tonal workout ID: e1c60347-b987-4cda-ae77-4809654f4f2e',
      '3-min general warmup before Block 1: BW glute bridges ×15, leg swings, cat-cow',
      'Bar rests on hips — hands only steady it. Tingling/numbness = stop',
      'API weight is per-cable for hip thrust — log app-displayed total',
    ],
  },
  {
    id: 'gf2',
    name: 'Grip-Free 2 — Hamstring Burnout',
    subtitle: 'Grip-free · HEAVY glute bridge · Hams: heavy extension → bilateral → unilateral · ~28 min',
    created: '2026-06-12',
    anchor: 'Barbell Lying Glute Bridge — HEAVY day, PR hunt',
    blocks: [
      {
        name: 'Block 1 — Barbell · Floor',
        type: 'Warmup · Smart Flex OFF',
        exercises: [
          { name: 'Barbell Lying Glute Bridge', sets: '1 warmup', detail: '5 reps · start manually ~75 lbs — Smart Flex overshoots' },
        ],
      },
      {
        name: 'Block 2 — Barbell · Floor',
        type: 'Working sets · Smart Flex ON · 5 reps',
        exercises: [
          { name: 'Barbell Lying Glute Bridge', sets: '3', detail: '5 reps · PR territory 127 lbs' },
        ],
      },
      {
        name: 'Block 3 — Rest',
        type: '2 min',
        exercises: [
          { name: 'Rest', sets: '—', detail: '120s · Filler: dead bugs ×10/side (anti-extension core)' },
        ],
      },
      {
        name: 'Block 4 — Prone Bench · Bilateral',
        type: 'Working sets · Smart Flex ON · 5 reps',
        exercises: [
          { name: 'Prone Bench Hamstring Curl', sets: '3', detail: '5 reps · zero knee involvement (confirmed safe)' },
        ],
      },
      {
        name: 'Block 5 — Rest',
        type: '90 sec',
        exercises: [
          { name: 'Rest', sets: '—', detail: '90s · Filler: vest calf raises ×20' },
        ],
      },
      {
        name: 'Block 6 — Prone Bench · Unilateral',
        type: 'Working sets · Smart Flex ON · 4 reps/side',
        exercises: [
          { name: 'Prone Bench Single Leg Hamstring Curl', sets: '3', detail: '4/side · weak side first' },
        ],
      },
      {
        name: 'Block 7 — Rest',
        type: '60 sec',
        exercises: [
          { name: 'Rest', sets: '—', detail: '60s · loops on feet for The Hundred' },
        ],
      },
      {
        name: 'Block 8 — Pilates Loops · Supine',
        type: 'Timed · 2 × 45s · light weight',
        exercises: [
          { name: 'The Hundred', sets: '2', detail: '45s · loops on feet, hands extended · classic 100 beats' },
        ],
      },
    ],
    tiers: [
      { tier: 1, when: 'Low energy / shot day', adjustment: 'Cut Block 8 (The Hundred)' },
      { tier: 2, when: 'Moderate', adjustment: 'As written' },
      { tier: 3, when: 'Strong', adjustment: 'Push bridge load — this is the PR-hunt day' },
    ],
    cutOrder: [
      'Block 8 — The Hundred',
      'Block 6 — Prone Bench SL Curl',
      'Block 4 — Prone Bench Hamstring Curl',
      'Block 2 — never cut (anchor)',
    ],
    notes: [
      'Tonal workout ID: 46442f85-0519-44d5-b4ec-36ec35939c22',
      '3-min general warmup before Block 1: BW glute bridges ×15, leg swings, cat-cow',
      'One bench setup after the floor compound — clean transition',
      'API weight is per-cable for glute bridge — log app-displayed total',
    ],
  },
  {
    id: 'gf3',
    name: 'Grip-Free 3 — Unilateral Stability',
    subtitle: 'Grip-free · Moderate thrust (~90%) · Right hip chain + balance · Independent seat · ~27 min',
    created: '2026-06-12',
    anchor: 'Barbell Hip Thrust — moderate day: hold ~90% of GF1, decline Smart Flex bumps',
    blocks: [
      {
        name: 'Block 1 — Barbell · Bench',
        type: 'Warmup · Smart Flex OFF',
        exercises: [
          { name: 'Barbell Hip Thrust', sets: '1 warmup', detail: '5 reps' },
        ],
      },
      {
        name: 'Block 2 — Barbell · Bench',
        type: 'Working sets · Smart Flex ON · 5 reps · ~90% load',
        exercises: [
          { name: 'Barbell Hip Thrust', sets: '3', detail: '5 reps · hold ~90% of GF1 load · explosive intent, no PR hunting' },
        ],
      },
      {
        name: 'Block 3 — Rest',
        type: '2 min',
        exercises: [
          { name: 'Rest', sets: '—', detail: '120s · Filler: vest heel drops ×20 (bone loading)' },
        ],
      },
      {
        name: 'Block 4 — Ankle Straps · Standing · Vest on',
        type: 'Working sets · Smart Flex ON · 4 reps/side',
        exercises: [
          { name: 'Standing Single Leg Hamstring Curl', sets: '3', detail: '4/side · RIGHT (weak) side first · standing leg trains balance' },
        ],
      },
      {
        name: 'Block 5 — Rest',
        type: '90 sec',
        exercises: [
          { name: 'Rest', sets: '—', detail: '90s · Filler: single-leg stance 30s/side — eyes closed when easy' },
        ],
      },
      {
        name: 'Block 6 — Ankle Straps · Standing · Vest on',
        type: 'Working sets · Smart Flex ON · 4 reps/side',
        exercises: [
          { name: 'Standing Diagonal Glute Kickback', sets: '3', detail: '4/side · hip extension + lateral — the riding pattern' },
        ],
      },
    ],
    tiers: [
      { tier: 1, when: 'Low energy / shot day', adjustment: 'Cut Block 6 (Diagonal Kickback)' },
      { tier: 2, when: 'Moderate', adjustment: 'As written' },
      { tier: 3, when: 'Strong', adjustment: 'Add eyes-closed balance time — not load' },
    ],
    cutOrder: [
      'Block 6 — Diagonal Glute Kickback',
      'Block 4 — Standing SL Hamstring Curl',
      'Block 2 — never cut (anchor)',
    ],
    notes: [
      'Tonal workout ID: b1b34863-6879-4d48-878a-c93f8322dc3a',
      '3-min general warmup before Block 1: BW glute bridges ×15, leg swings, cat-cow',
      'Every standing rep doubles as single-leg proprioception for seat symmetry',
      'Track right-vs-left in session notes — the gap closing is the goal',
    ],
  },
  {
    id: 'gf4',
    name: 'Grip-Free 4 — Quad & Core',
    subtitle: 'Grip-free · Moderate bridge (~90%) · Quads + rotational core · Knee-brace test day · ~30 min',
    created: '2026-06-12',
    anchor: 'Barbell Lying Glute Bridge — moderate day: hold ~90% of GF2',
    blocks: [
      {
        name: 'Block 1 — Barbell · Floor',
        type: 'Warmup · Smart Flex OFF',
        exercises: [
          { name: 'Barbell Lying Glute Bridge', sets: '1 warmup', detail: '5 reps · start manually ~75 lbs' },
        ],
      },
      {
        name: 'Block 2 — Barbell · Floor',
        type: 'Working sets · Smart Flex ON · 5 reps · ~90% load',
        exercises: [
          { name: 'Barbell Lying Glute Bridge', sets: '3', detail: '5 reps · hold ~90% of GF2 load · decline Smart Flex bumps' },
        ],
      },
      {
        name: 'Block 3 — Rest',
        type: '2 min',
        exercises: [
          { name: 'Rest', sets: '—', detail: '120s · Filler: Assisted Rear Lunge ×5/side, light hand rest · step-ups take this slot once pain-free ×2 with brace' },
        ],
      },
      {
        name: 'Block 4 — Ankle Straps · Standing · Vest on',
        type: 'Working sets · Smart Flex ON · 5 reps/side',
        exercises: [
          { name: 'Standing Leg Extension', sets: '3', detail: '5/side · RIGHT caps ~27 lbs, stop before 80° flexion · test ROM with knee brace, log results' },
        ],
      },
      {
        name: 'Block 5 — Rest',
        type: '90 sec',
        exercises: [
          { name: 'Rest', sets: '—', detail: '90s · Filler: vest calf raises ×20' },
        ],
      },
      {
        name: 'Block 6 — Pilates Loops · Side Lying',
        type: 'Timed · 3 × 35s/side · ~6 controlled reps',
        exercises: [
          { name: 'Side Lying Leg Press', sets: '3', detail: '35s/side · loops on feet · knee-friendly quad press' },
        ],
      },
      {
        name: 'Block 7 — Rest',
        type: '60 sec',
        exercises: [
          { name: 'Rest', sets: '—', detail: '60s · loops set up for Oblique Boat' },
        ],
      },
      {
        name: 'Block 8 — Pilates Loops · Seated',
        type: 'Timed · 3 × 40s/side · ~8 controlled reps',
        exercises: [
          { name: 'Oblique Boat', sets: '3', detail: '40s/side · C-curve rotation · light press-out hold, neutral wrist · dancing core' },
        ],
      },
    ],
    tiers: [
      { tier: 1, when: 'Low energy / shot day', adjustment: 'Cut Block 8 (Oblique Boat)' },
      { tier: 2, when: 'Moderate', adjustment: 'As written' },
      { tier: 3, when: 'Strong', adjustment: 'Add brace-tested ROM/load on leg extension — log it' },
    ],
    cutOrder: [
      'Block 8 — Oblique Boat',
      'Block 6 — Side Lying Leg Press',
      'Block 4 — Standing Leg Extension',
      'Block 2 — never cut (anchor)',
    ],
    notes: [
      'Tonal workout ID: 61fb61a6-3e3d-489a-9004-8b3c6aaf6837',
      '3-min general warmup before Block 1: BW glute bridges ×15, leg swings, cat-cow',
      'Pilates loop movements only accept timed sets via API — durations ≈ 6–8 controlled reps',
      'Knee brace experiment lives here: leg extension ROM first, step-up trial second',
    ],
  },
  {
    id: 'aux_pilates',
    name: 'Aux — Pilates Upper & Core',
    subtitle: 'Auxiliary · Light · Loop-anchored, no sustained grip · Never replaces a main day · ~27 min',
    created: '2026-06-12',
    anchor: 'No anchor — light auxiliary. Tingling or numbness = stop immediately',
    blocks: [
      {
        name: 'Block 1 — Pilates Loops',
        type: 'Timed · 3 × 40s · ~8 controlled reps',
        exercises: [
          { name: 'Pulling Straps T-Pull', sets: '3', detail: '40s · back / rear delts · posture for riding' },
        ],
      },
      {
        name: 'Block 2 — Pilates Loops',
        type: 'Timed · 3 × 40s',
        exercises: [
          { name: 'Serve a Tray', sets: '3', detail: '40s · chest + external rotation' },
        ],
      },
      {
        name: 'Block 3 — Pilates Loops',
        type: 'Timed · 3 × 40s/side',
        exercises: [
          { name: 'Draw a Sword', sets: '3', detail: '40s/side · shoulders, diagonal pattern' },
        ],
      },
      {
        name: 'Block 4 — Pilates Loops',
        type: 'Timed · 3 × 35s/side',
        exercises: [
          { name: 'Resisted Mermaid', sets: '3', detail: '35s/side · obliques, lateral line' },
        ],
      },
      {
        name: 'Block 5 — Pilates Loops',
        type: 'Timed · 3 × 40s',
        exercises: [
          { name: 'Roll Down', sets: '3', detail: '40s · abs, spinal articulation' },
        ],
      },
    ],
    tiers: [
      { tier: 1, when: 'Any doubt about hands', adjustment: 'Skip entirely — zero cost' },
      { tier: 2, when: 'Normal', adjustment: 'As written, light weights' },
      { tier: 3, when: 'Strong', adjustment: 'Nudge weight only if hands fully quiet' },
    ],
    cutOrder: [
      'Any block — order does not matter here',
    ],
    notes: [
      'Tonal workout ID: 8d5baf16-3c3a-40e5-b279-8e309a5875cf',
      'Loops anchor on open/extended hand or forearm — NO sustained grip',
      '60s rests between blocks · no vest · start light everywhere',
      'Runs on off-days or after a main session — never instead of one',
    ],
  },
  {
    id: 'he_floor_bridge',
    name: 'Heavy Express — Floor Bridge + Ankle Straps',
    subtitle: 'Hands-free · Barbell + ankle straps · Peak strength · ~20 min',
    created: '2026-04-25',
    anchor: 'Barbell Lying Glute Bridge — never cut, always has warmup set',
    blocks: [
      {
        name: 'Block 1 — Barbell · Floor',
        type: 'Warmup · Smart Flex OFF',
        exercises: [
          { name: 'Barbell Lying Glute Bridge', sets: '1 warmup', detail: '5 reps · light, let Tonal calibrate' },
        ],
      },
      {
        name: 'Block 2 — Barbell · Floor',
        type: 'Working sets · Smart Flex ON · 5 reps',
        exercises: [
          { name: 'Barbell Lying Glute Bridge', sets: '3', detail: '5 reps · push heavy · Smart Flex ON' },
        ],
      },
      {
        name: 'Block 3 — Rest',
        type: '2 min',
        exercises: [
          { name: 'Rest', sets: '—', detail: '120s' },
        ],
      },
      {
        name: 'Block 4 — Ankle Straps · Standing',
        type: 'Working sets · Smart Flex ON · 4 reps/side',
        exercises: [
          { name: 'Standing Donkey Kick', sets: '3', detail: '4/side · hip extension · Smart Flex ON' },
        ],
      },
      {
        name: 'Block 5 — Rest',
        type: '90 sec',
        exercises: [
          { name: 'Rest', sets: '—', detail: '90s' },
        ],
      },
      {
        name: 'Block 6 — Ankle Straps · Standing',
        type: 'Working sets · Smart Flex ON · 4 reps/side',
        exercises: [
          { name: 'Standing SL Hamstring Curl', sets: '3', detail: '4/side · unilateral knee flexion · Smart Flex ON' },
        ],
      },
      {
        name: 'Block 7 — Rest',
        type: '90 sec',
        exercises: [
          { name: 'Rest', sets: '—', detail: '90s' },
        ],
      },
      {
        name: 'Block 8 — Ankle Straps · Standing',
        type: 'Working sets · Smart Flex ON · 4 reps/side',
        exercises: [
          { name: 'Standing Hip Abduction', sets: '3', detail: '4/side · lateral stability · Smart Flex ON' },
        ],
      },
    ],
    tiers: [
      { tier: 1, when: 'Low energy / shot day', adjustment: 'Cut Block 8 (Hip Abduction)' },
      { tier: 2, when: 'Moderate', adjustment: 'As written' },
      { tier: 3, when: 'Strong', adjustment: 'Add reps or sets to Glute Bridge' },
    ],
    cutOrder: [
      'Block 8 — Standing Hip Abduction',
      'Block 6 — Standing SL Hamstring Curl',
      'Block 4 — Standing Donkey Kick',
      'Block 2 — never cut (anchor)',
    ],
    notes: [
      'Tonal workout ID: 1368223f-b72f-42ba-8f4b-a829314c0c4a',
      'Glute Bridge: Smart Flex may undershoot — increase manually if needed',
      'Patterns covered: hip extension (compound), hip extension (unilateral), knee flexion (unilateral), hip abduction',
      'No duplicate movement patterns — full lower body in ~20 min',
      'No drop sets under any circumstances',
    ],
  },
  {
    id: 'he_glute',
    name: 'Heavy Express — Glute Bridge + Hamstring + Quad',
    subtitle: 'Hands-free · Barbell + ankle straps · Peak strength · ~20 min',
    created: '2026-04-19',
    anchor: 'Barbell Lying Glute Bridge — never cut, always has warmup set',
    blocks: [
      {
        name: 'Block 1 — Barbell · Floor',
        type: 'Warmup · Smart Flex OFF',
        exercises: [
          { name: 'Barbell Lying Glute Bridge', sets: '1 warmup', detail: '8 reps · light, increase manually' },
        ],
      },
      {
        name: 'Block 2 — Barbell · Floor',
        type: 'Working sets · 4 reps · manual load only',
        exercises: [
          { name: 'Barbell Lying Glute Bridge', sets: '3', detail: '4 reps · start 100 lbs+, increase each set · Smart Flex OFF' },
        ],
      },
      {
        name: 'Block 3 — Ankle Straps · Standing',
        type: 'Warmup · Smart Flex OFF',
        exercises: [
          { name: 'Standing Single Leg Hamstring Curl', sets: '1 warmup', detail: '8/side · light, just activate' },
        ],
      },
      {
        name: 'Block 4 — Prone Bench · Ankle Straps',
        type: 'Working sets · Smart Flex ON · 5 reps',
        exercises: [
          { name: 'Prone Bench Hamstring Curl', sets: 'warmup + 4', detail: '5 reps · start 25 lbs, push toward 30+' },
        ],
      },
      {
        name: 'Block 5 — Ankle Straps · Standing',
        type: 'Working sets · Smart Flex ON · 6 reps/side',
        exercises: [
          { name: 'Standing Leg Extension', sets: 'warmup + 3', detail: '6/side · monitor right knee at 80–90°' },
        ],
      },
    ],
    tiers: [
      { tier: 1, when: 'Low energy', adjustment: 'Cut Block 5 (Leg Extension)' },
      { tier: 2, when: 'Moderate', adjustment: 'As written' },
      { tier: 3, when: 'Strong', adjustment: 'Add sets to Glute Bridge or Hamstring Curl' },
    ],
    cutOrder: [
      'Block 5 — Standing Leg Extension (entire block)',
      'Block 4 — reduce from 4 to 2 working sets',
      'Block 2 — never cut (anchor)',
    ],
    notes: [
      'Two attachment setups: barbell first, then ankle straps — no mid-session swaps back',
      'Glute Bridge: Smart Flex undershoots — set manually, start at 100 lbs working weight',
      'Smart Flex must be enabled manually on Tonal screen — not settable via API',
      'Right knee: mild twinge at 80–90° on leg extension noted Apr 19 — hold weight steady if it recurs',
      'No drop sets under any circumstances',
    ],
  },
  {
    id: 'he_hip',
    name: 'Heavy Express — Hip Thrust + Hamstring',
    subtitle: 'Hands-free · Barbell + ankle straps · Peak strength · ~18 min · Replaced by Glute Bridge version',
    created: '2026-04-18',
    anchor: 'Barbell Hip Thrust — never cut, always has warmup set',
    blocks: [
      {
        name: 'Block 1 — Barbell · Bench',
        type: 'Warmup · Smart Flex OFF',
        exercises: [
          { name: 'Barbell Hip Thrust', sets: '1 warmup', detail: '8 reps · light, just activate' },
        ],
      },
      {
        name: 'Block 2 — Barbell · Bench',
        type: 'Working sets · Smart Flex ON · 4 reps',
        exercises: [
          { name: 'Barbell Hip Thrust', sets: '3', detail: '4 reps · increase weight each set · enable Smart Flex manually' },
        ],
      },
      {
        name: 'Block 3 — Ankle Straps · Standing',
        type: 'Working sets · Smart Flex ON · 4 reps/side',
        exercises: [
          { name: 'Standing Single Leg Hamstring Curl', sets: '3', detail: '4/side · Smart Flex · increase each set' },
        ],
      },
      {
        name: 'Block 4 — Ankle Straps · Standing',
        type: 'Working sets · Smart Flex ON · 5 reps/side',
        exercises: [
          { name: 'Standing Hip Abduction', sets: '3', detail: '5/side · Smart Flex · enable manually' },
        ],
      },
      {
        name: 'Block 5 — Ankle Straps · Standing',
        type: 'Working sets · Smart Flex ON · 8–10 reps/side',
        exercises: [
          { name: 'Standing Donkey Kick', sets: '3', detail: '8–10/side · straight sets only — no drop sets' },
        ],
      },
    ],
    tiers: [
      { tier: 1, when: 'Low energy', adjustment: 'Cut Block 5 (Donkey Kick)' },
      { tier: 2, when: 'Moderate', adjustment: 'As written' },
      { tier: 3, when: 'Strong', adjustment: 'Add sets to Hip Abduction' },
    ],
    cutOrder: [
      'Block 5 — Standing Donkey Kick',
      'Block 4 — Standing Hip Abduction',
      'Block 3 — Standing SL Hamstring Curl',
      'Block 2 — never cut (anchor)',
    ],
    notes: [
      'Replaced by Heavy Express — Glute Bridge + Hamstring + Quad for all future sessions',
      'Bench slides without wall anchor — practice independently until resolved',
      'Drop sets removed from all movements — tested Apr 18, not repeating',
      'Low calorie output is normal for heavy strength work — not a sign of low effort',
    ],
  },
  {
    id: 'hfla',
    name: 'Hands Free Lower Body',
    subtitle: 'No hands · No weight bearing · Perimenopause-aware · Strength focus',
    created: '2026-04-04',
    anchor: 'Barbell Hip Thrust — never cut this',
    blocks: [
      {
        name: 'Block 1 — Pilates Straps · Lying',
        type: 'Warmup · Smart Flex OFF',
        exercises: [
          { name: 'Feet in Straps Frog Press', sets: '2', detail: '30s work / 30s rest · Level 5 · Smart Flex OFF' },
          { name: 'Side Lying Hip Abduction', sets: '3', detail: '60s · Off-Tonal, bodyweight · Smart Flex OFF' },
        ],
      },
      {
        name: 'Block 2 — Ankle Straps · Standing',
        type: 'Working sets · Smart Flex ON · 8 reps/side',
        exercises: [
          { name: 'Standing Hip Abduction', sets: 'warmup + 3', detail: '8/side · Smart Flex ON' },
          { name: 'Standing Donkey Kick', sets: '3', detail: '8/side · Smart Flex ON' },
          { name: 'Standing Diagonal Glute Kickback', sets: '3', detail: '8/side · Smart Flex ON' },
          { name: 'Standing Straight Leg Glute Kickback', sets: '3', detail: '8/side · Smart Flex ON' },
        ],
      },
      {
        name: 'Block 3 — Barbell · Bench + Floor',
        type: 'Peak effort · Smart Flex ON + Burnout',
        exercises: [
          { name: 'Barbell Hip Thrust', sets: 'warmup + 2 + Burnout', detail: '6 reps · Smart Flex ON + Burnout' },
          { name: 'Barbell Lying Glute Bridge', sets: '2 + Burnout', detail: '8 reps · Smart Flex ON + Burnout' },
        ],
      },
    ],
    tiers: [
      { tier: 1, when: 'Luteal / first week back / low energy', adjustment: 'As written' },
      { tier: 2, when: 'Moderate week, 2–3×', adjustment: 'Add Side Lying Leg Press to Block 1' },
      { tier: 3, when: 'Strong week, follicular/ovulatory', adjustment: 'Add 4th set to all Block 2 movements' },
    ],
    cutOrder: [
      'Barbell Lying Glute Bridge',
      'Standing Straight Leg Glute Kickback',
      'Side Lying Hip Abduction',
    ],
    notes: [
      'Go up when last 2 reps of final set feel genuinely easy',
      'Burnout under 5 reps → weight too heavy, back off slightly',
      'Barbell movements handle more load than cable — push these',
    ],
  },
  {
    id: 'hqs',
    name: 'Hamstring + Quad Strength',
    subtitle: 'Hands-free · Prone bench + leg extension · Peak strength focus · ~36 min',
    created: '2026-04-26',
    anchor: 'Prone Bench Hamstring Curl — never cut',
    blocks: [
      {
        name: 'Block 1 — Free Lift Warmup',
        type: 'Pre-workout · Glute activation only if glutes > 50% readiness',
        exercises: [
          { name: 'Barbell Hip Thrust', sets: '1 warmup', detail: '10 reps · 40 lbs · glute activation only — skip if glutes cooked' },
        ],
      },
      {
        name: 'Block 2 — Prone Bench · Bilateral',
        type: 'Warmup + 3 working sets · 5 reps · 2 min rest after',
        exercises: [
          { name: 'Prone Bench Hamstring Curl', sets: 'warmup + 3', detail: '5 reps · Smart Flex ON · 2 min rest after block' },
        ],
      },
      {
        name: 'Block 3 — Prone Bench · Unilateral',
        type: '3 working sets · 5 reps/side · 90s rest after',
        exercises: [
          { name: 'Prone Bench Single Leg Hamstring Curl', sets: '3', detail: '5/side · Smart Flex ON · right leg self-limits ~27 lbs, stop before 80° knee flexion · 90s rest after block' },
        ],
      },
      {
        name: 'Block 4 — Leg Extension',
        type: 'Warmup + 3 working sets · 6 reps/side · 90s rest after',
        exercises: [
          { name: 'Standing Leg Extension', sets: 'warmup + 3', detail: '6/side · Smart Flex ON · right leg ~27 lbs limited ROM, stops before knee twitch at 80° · 90s rest after block' },
        ],
      },
    ],
    tiers: [],
    cutOrder: ['Block 1 — Free Lift Warmup'],
    notes: [
      'Right leg on SL hamstring curl and leg extension: self-limits ~27 lbs, stop before 80° knee flexion',
      'Hip thrust warmup is separate Free Lift — only do if glutes have >50% readiness',
      'Fasted session origin: 14.5 hr fast, herbal tea + creatine pre-workout',
      'Follow with off-Tonal core finisher if energy allows',
    ],
  },
  {
    id: 'hflb',
    name: 'Hands Free Lower Body + Core B',
    subtitle: 'No hands · Hamstring + quad focus · Core stability finisher · One attachment setup',
    created: '2026-04-05',
    anchor: 'Prone Bench Hamstring Curl — never cut this',
    blocks: [
      {
        name: 'Block 1 — Ankle Straps · Standing',
        type: 'Warmup · Smart Flex OFF',
        exercises: [
          { name: 'Standing Single Leg Hamstring Curl', sets: '1 warmup', detail: '8/side · light · Smart Flex OFF' },
        ],
      },
      {
        name: 'Block 2 — Prone Bench · Bilateral',
        type: 'Peak load · Smart Flex ON · 5 reps',
        exercises: [
          { name: 'Prone Bench Hamstring Curl', sets: 'warmup + 4', detail: '5 reps · Smart Flex ON' },
        ],
      },
      {
        name: 'Block 3 — Prone Bench · Unilateral',
        type: 'Smart Flex ON · 5 reps/side',
        exercises: [
          { name: 'Prone Bench Single Leg Hamstring Curl', sets: '3', detail: '5/side · Smart Flex ON' },
        ],
      },
      {
        name: 'Block 4 — Ankle Straps · Standing',
        type: 'Quads · Smart Flex ON · 6 reps/side',
        exercises: [
          { name: 'Standing Leg Extension', sets: 'warmup + 3', detail: '6/side · Smart Flex ON' },
        ],
      },
      {
        name: 'Block 5 — Standing Bicycle → Cable Knee Drive',
        type: 'Timer · 60s · Hip flexor + core stability · Smart Flex OFF',
        exercises: [
          { name: 'Cable Knee Drive', sets: '3', detail: '60s · ankle strap on low cable, face away · Smart Flex OFF' },
        ],
      },
      {
        name: 'Block 6 — Clamshell → Cable Hip Adduction',
        type: 'Timer · 60s · Adductor + pelvic stability · Smart Flex OFF',
        exercises: [
          { name: 'Cable Hip Adduction', sets: '3', detail: '60s · stand sideways, pull across body · Smart Flex OFF' },
        ],
      },
    ],
    tiers: [],
    cutOrder: [
      'Block 6 — Cable Hip Adduction',
      'Block 5 — Cable Knee Drive',
      'Block 3 — Single Leg Hamstring Curl',
    ],
    notes: [
      'Hamstring curls: 5 reps = heavy relative load — push these',
      'Quads are untouched from A session — go up when last 2 reps feel easy',
      'Blocks 5 + 6: timer-based, start light, first session is learning the movement',
      'Pairs with Hands Free Lower Body A — alternate with rest between',
    ],
  },
]

const PR_KEYS = {
  'Barbell Lying Glute Bridge':          'barbell_lying_glute_bridge',
  'Barbell Hip Thrust':                  'barbell_hip_thrust',
  'Standing Donkey Kick':                'standing_donkey_kick',
  'Standing SL Hamstring Curl':          'standing_sl_hamstring_curl',
  'Standing Single Leg Hamstring Curl':  'standing_sl_hamstring_curl',
  'Standing Hip Abduction':              'standing_hip_abduction',
  'Standing Leg Extension':              'standing_leg_extension',
  'Standing Diagonal Glute Kickback':    'standing_diagonal_glute_kickback',
  'Standing Straight Leg Glute Kickback':'standing_straight_leg_glute_kickback',
  'Prone Bench Hamstring Curl':          'prone_bench_hamstring_curl',
  'Prone Bench Single Leg Hamstring Curl':'prone_bench_sl_hamstring_curl',
}

function buildPRMap(sessions) {
  const best = {}
  for (const s of (sessions ?? [])) {
    for (const [key, pr] of Object.entries(s.prs ?? {})) {
      if (pr.weight != null && (best[key] == null || pr.weight > best[key])) {
        best[key] = pr.weight
      }
    }
  }
  return best
}

export default function Programs({ sessions, expandId }) {
  const prMap = buildPRMap(sessions)
  return (
    <div className="space-y-6">
      {[...PROGRAMS].sort((a, b) => b.created.localeCompare(a.created)).map(p => (
        <ProgramCard key={p.id} program={p} prMap={prMap} defaultOpen={p.id === expandId} />
      ))}
    </div>
  )
}

function ProgramCard({ program: p, prMap, defaultOpen }) {
  return (
    <details className="card group" open={defaultOpen || undefined}>
      <summary className="flex items-start justify-between cursor-pointer list-none gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">{p.name}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{p.subtitle}</p>
          <p className="text-xs text-zinc-600 mt-1">Created {p.created}</p>
        </div>
        <span className="text-zinc-600 group-open:rotate-180 transition-transform shrink-0 mt-1">▾</span>
      </summary>

      <div className="space-y-5 mt-5">

      {/* Anchor movement */}
      <div className="rounded-lg bg-accent/10 border border-accent/20 px-4 py-2.5 text-sm text-accent">
        ⚓ {p.anchor}
      </div>

      {/* Blocks */}
      <div className="space-y-4">
        {p.blocks.map(b => (
          <div key={b.name}>
            <div className="flex items-baseline gap-2 flex-wrap mb-2">
              <h3 className="text-sm font-semibold text-zinc-200">{b.name}</h3>
              <span className="text-xs text-zinc-500">{b.type}</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-3">
                  <th className="label pb-1.5 pr-4 text-left">Exercise</th>
                  <th className="label pb-1.5 pr-4 text-left">Sets</th>
                  <th className="label pb-1.5 text-left">Detail</th>
                </tr>
              </thead>
              <tbody>
                {b.exercises.map(e => {
                  const prKey = PR_KEYS[e.name]
                  const pr = prKey ? prMap[prKey] : null
                  return (
                    <tr key={e.name} className="border-b border-surface-3/30">
                      <td className="py-2 pr-4 text-zinc-200">
                        <span>{e.name}</span>
                        {pr != null && (
                          <span className="ml-2 rounded bg-accent/15 px-1.5 py-0.5 text-[11px] font-semibold text-accent tabular-nums">
                            PR {pr} lbs
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-zinc-400 tabular-nums">{e.sets}</td>
                      <td className="py-2 text-zinc-500">{e.detail}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Tiers */}
      {p.tiers.length > 0 && (
        <div>
          <h3 className="label mb-2">Tier Guidance</h3>
          <div className="space-y-1.5">
            {p.tiers.map(t => (
              <div key={t.tier} className="flex items-start gap-3 text-sm">
                <span className="rounded bg-surface-2 px-2 py-0.5 text-xs font-bold text-accent tabular-nums shrink-0">T{t.tier}</span>
                <span className="text-zinc-500">{t.when}</span>
                <span className="text-zinc-400 ml-auto pl-4 text-right shrink-0">{t.adjustment}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cut order */}
      <div>
        <h3 className="label mb-2">If Running Out of Steam — Cut in This Order</h3>
        <ol className="space-y-1">
          {p.cutOrder.map((item, i) => (
            <li key={item} className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="text-zinc-700 tabular-nums">{i + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
      </div>

      {/* Notes */}
      <div>
        <h3 className="label mb-2">Loading Notes</h3>
        <ul className="space-y-1">
          {p.notes.map(n => (
            <li key={n} className="text-sm text-zinc-500 flex items-start gap-2">
              <span className="text-zinc-700 shrink-0">·</span>{n}
            </li>
          ))}
        </ul>
      </div>

      </div>{/* end collapsible content */}
    </details>
  )
}
