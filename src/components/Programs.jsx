const PROGRAMS = [
  {
    id: 'hfla',
    name: 'Hands Free Lower Body',
    subtitle: 'No hands · No weight bearing · Perimenopause-aware · Strength focus',
    created: '2026-04-04',
    anchor: 'Barbell Hip Thrust — never cut this',
    blocks: [
      {
        name: 'Block 1 — Pilates Straps · Lying',
        type: 'Warmup',
        exercises: [
          { name: 'Feet in Straps Frog Press', sets: '2', detail: '30s work / 30s rest · Level 5' },
          { name: 'Side Lying Hip Abduction', sets: '3', detail: '60s · Off-Tonal, bodyweight' },
        ],
      },
      {
        name: 'Block 2 — Ankle Straps · Standing',
        type: 'Working sets · Smart Flex · 8 reps/side',
        exercises: [
          { name: 'Standing Hip Abduction', sets: 'warmup + 3', detail: '8/side' },
          { name: 'Standing Donkey Kick', sets: '3', detail: '8/side' },
          { name: 'Standing Diagonal Glute Kickback', sets: '3', detail: '8/side' },
          { name: 'Standing Straight Leg Glute Kickback', sets: '3', detail: '8/side' },
        ],
      },
      {
        name: 'Block 3 — Barbell · Bench + Floor',
        type: 'Peak effort · Smart Flex + Burnout',
        exercises: [
          { name: 'Barbell Hip Thrust', sets: 'warmup + 2 + Burnout', detail: '6 reps' },
          { name: 'Barbell Lying Glute Bridge', sets: '2 + Burnout', detail: '8 reps' },
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
        type: 'Warmup',
        exercises: [
          { name: 'Standing Single Leg Hamstring Curl', sets: '1 warmup', detail: '8/side · light' },
        ],
      },
      {
        name: 'Block 2 — Prone Bench · Bilateral',
        type: 'Peak load · Smart Flex · 5 reps',
        exercises: [
          { name: 'Prone Bench Hamstring Curl', sets: 'warmup + 4', detail: '5 reps' },
        ],
      },
      {
        name: 'Block 3 — Prone Bench · Unilateral',
        type: 'Smart Flex · 5 reps/side',
        exercises: [
          { name: 'Prone Bench Single Leg Hamstring Curl', sets: '3', detail: '5/side' },
        ],
      },
      {
        name: 'Block 4 — Ankle Straps · Standing',
        type: 'Quads · Smart Flex · 6 reps/side',
        exercises: [
          { name: 'Standing Leg Extension', sets: 'warmup + 3', detail: '6/side' },
        ],
      },
      {
        name: 'Block 5 — Standing Bicycle → Cable Knee Drive',
        type: 'Timer · 60s · Hip flexor + core stability',
        exercises: [
          { name: 'Cable Knee Drive', sets: '3', detail: '60s · ankle strap on low cable, face away' },
        ],
      },
      {
        name: 'Block 6 — Clamshell → Cable Hip Adduction',
        type: 'Timer · 60s · Adductor + pelvic stability',
        exercises: [
          { name: 'Cable Hip Adduction', sets: '3', detail: '60s · stand sideways, pull across body' },
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

export default function Programs() {
  return (
    <div className="space-y-6">
      {PROGRAMS.map(p => (
        <ProgramCard key={p.id} program={p} />
      ))}
    </div>
  )
}

function ProgramCard({ program: p }) {
  return (
    <div className="card space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">{p.name}</h2>
        <p className="text-xs text-zinc-500 mt-0.5">{p.subtitle}</p>
        <p className="text-xs text-zinc-600 mt-1">Created {p.created}</p>
      </div>

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
                {b.exercises.map(e => (
                  <tr key={e.name} className="border-b border-surface-3/30">
                    <td className="py-2 pr-4 text-zinc-200">{e.name}</td>
                    <td className="py-2 pr-4 text-zinc-400 tabular-nums">{e.sets}</td>
                    <td className="py-2 text-zinc-500">{e.detail}</td>
                  </tr>
                ))}
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
    </div>
  )
}
