const PROGRAMS = [
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

export default function Programs({ sessions }) {
  const prMap = buildPRMap(sessions)
  return (
    <div className="space-y-6">
      {PROGRAMS.map(p => (
        <ProgramCard key={p.id} program={p} prMap={prMap} />
      ))}
    </div>
  )
}

function ProgramCard({ program: p, prMap }) {
  return (
    <details className="card group">
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
