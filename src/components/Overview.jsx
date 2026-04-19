const MOVEMENT_LABELS = {
  barbell_hip_thrust:                   'Barbell Hip Thrust',
  barbell_lying_glute_bridge:           'Barbell Lying Glute Bridge',
  prone_bench_hamstring_curl:           'Prone Bench Hamstring Curl',
  prone_bench_sl_hamstring_curl:        'Prone Bench SL Hamstring Curl',
  standing_sl_hamstring_curl:           'Standing SL Hamstring Curl',
  standing_leg_extension:               'Standing Leg Extension',
  standing_hip_abduction:               'Standing Hip Abduction',
  standing_donkey_kick:                 'Standing Donkey Kick',
  standing_diagonal_glute_kickback:     'Standing Diagonal Glute Kickback',
  standing_straight_leg_glute_kickback: 'Standing Straight Leg Glute Kickback',
}

export default function Overview({ sessions }) {
  if (!sessions.length) return null

  const sorted   = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  const first    = sorted[0]
  const last     = sorted[sorted.length - 1]
  const daySpan  = daysBetween(first.date, last.date)
  const totalVol = sessions.reduce((s, x) => s + (x.total_volume ?? 0), 0)
  const avgRating = (sessions.reduce((s, x) => s + x.subjective_rating, 0) / sessions.length).toFixed(1)
  const prCount  = countPRs(sessions)
  const recaps   = sessions.map(buildRecap)
  const bestPRs  = findNotablePRs(sessions)

  return (
    <div className="space-y-6">
      {/* TL;DR */}
      <div className="card border-accent/30 bg-accent/5">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Across <strong className="text-zinc-100">{sessions.length} sessions</strong> you've set{' '}
          <strong className="text-zinc-100">{prCount} personal records</strong> in{' '}
          {Object.keys(MOVEMENT_LABELS).length} tracked movements. The pattern so far: recovery-phase
          groundwork in week one, followed by heavier express sessions that are shorter, denser, and rated higher.
          Your strongest sessions have come despite external stressors — a good sign.
        </p>
      </div>

      {/* Hero stats — this training block */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Sessions" value={sessions.length} />
        <Stat label="Days active" value={daySpan} />
        <Stat label="Volume this block" value={`${(totalVol / 1000).toFixed(1)}k lbs`} />
        <Stat label="Avg rating" value={`${avgRating} / 5`} />
      </div>

      {/* Lifetime stats */}
      <div className="card">
        <h2 className="label mb-4">Lifetime Stats <span className="normal-case font-normal text-zinc-600 ml-1">— as of Apr 18, 2026</span></h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <MiniLifeStat label="Total workouts"   value="185" />
          <MiniLifeStat label="Lifetime volume"  value="479,938 lbs" />
          <MiniLifeStat label="Total time"       value="67 hrs" />
          <MiniLifeStat label="Best streak"      value="19 sessions" />
          <MiniLifeStat label="Movements used"   value="199" />
        </div>
      </div>

      {/* Goals */}
      <div className="card">
        <h2 className="label mb-4">Goals</h2>
        <div className="space-y-2">
          <Goal icon="💪" text="Build muscle mass to increase TDEE — priority while on Zepbound (GLP-1)" />
          <Goal icon="🐴" text="Return to riding — target mid-May 2026" />
          <Goal icon="🤲" text="Reassess upper body reintroduction once hands are cleared" />
          <Goal icon="📈" text="Progress to heavier express sessions — shorter, denser, higher rated" />
          <Goal icon="⚖️" text="Perimenopause-aware programming — phase-matched intensity, recovery-first when needed" />
        </div>
      </div>

      {/* Training context */}
      <div className="card">
        <h2 className="label mb-4">Training Context</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-zinc-400">
          <ContextItem label="Current constraint"   value="Hands-free lower body only — both hands post-op" />
          <ContextItem label="Right hand"           value="Light grip available, ~week 7 post-op at Apr 18" />
          <ContextItem label="Left hand"            value="No grip — cleared of infection ~Apr 14" />
          <ContextItem label="Medication"           value="Zepbound (GLP-1) — shot day affects energy and output" />
          <ContextItem label="Life stage"           value="Perimenopause — training adapted accordingly" />
          <ContextItem label="Next milestone"       value="Upper body reassessment when hands are cleared" />
        </div>
      </div>

      {/* Session rating scale */}
      <div className="card">
        <h2 className="label mb-4">Session Rating Scale</h2>
        <div className="space-y-1.5">
          {[
            { score: 5, text: 'Best session energy, everything clicked' },
            { score: 4, text: 'Strong, felt good throughout' },
            { score: 3, text: 'Solid, normal session' },
            { score: 2, text: 'Below par, got it done' },
            { score: 1, text: 'Struggled through, considered stopping' },
          ].map(({ score, text }) => (
            <div key={score} className="flex items-center gap-3 text-sm">
              <span className="w-5 text-right font-bold text-accent tabular-nums">{score}</span>
              <span className="text-zinc-500">—</span>
              <span className="text-zinc-400">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Injury history */}
      <div className="card space-y-3 text-sm">
        <h2 className="label">Injury &amp; Return History</h2>
        <ol className="space-y-2 border-l border-surface-3 pl-4">
          <TimelineItem date="Oct 2025"      text="Training stopped — cellulitis progressed to tenosynovitis. Tenosynovitis required surgery." />
          <TimelineItem date="During PT"     text="Physical therapy irritated the trigger fingers on both small fingers." />
          <TimelineItem date="Feb 26, 2026"  text="A1 pulley release surgery — small finger, right hand." />
          <TimelineItem date="Mar 26, 2026"  text="A1 pulley release surgery — small finger, left hand." />
          <TimelineItem date="Apr 4, 2026"   text="First session back. Hands-free lower body only — no grip load." highlight />
        </ol>
      </div>

      {/* Narrative */}
      <div className="card space-y-4 leading-relaxed text-zinc-300 text-sm">
        <h2 className="label mb-2">Progress Story</h2>

        <p>
          You logged your first Tonal session on <strong className="text-zinc-100">{first.date}</strong> — a
          {' '}<em>{first.workout}</em> in the recovery phase, a gentle re-entry at {first.total_volume?.toLocaleString()} lbs total
          volume and an average heart rate of {first.avg_hr} bpm.
          That session ended with glutes and hamstrings nearly depleted (1% and 13% readiness respectively),
          while quads held up at 74% — a clear signal of where the work landed.
        </p>

        <p>
          The very next day you came back for <em>Hands Free Lower Body + Core B</em>, training on already-sore legs.
          Volume dropped to {sorted[1]?.total_volume?.toLocaleString()} lbs — appropriate for day-two fatigue —
          and you rated it {sorted[1]?.subjective_rating}/5: a good session for the circumstances.
          This is when the hamstring and leg extension work began: you hit strength PRs on the prone bench curl,
          single-leg curl, and leg extension in the same session.
        </p>

        <p>
          After a 13-day gap you returned on April 18 — shot day (Zepbound), tired, full — and still
          delivered a <strong className="text-zinc-100">4.5/5</strong> session. You were fully recovered going in
          (100% readiness across glutes, hamstrings, and quads), held that energy for just 18 minutes,
          and set a barbell hip thrust PR at <strong className="text-zinc-100">56 lbs</strong>.
          The density of that session tells the story: {sorted[2]?.total_volume?.toLocaleString()} lbs moved in {sorted[2]?.duration} minutes.
        </p>

        <p>
          The most recent session — <strong className="text-zinc-100">April 19</strong> — is the strongest on record.
          Running on poor sleep and four days off, you hit PRs on nearly every set: glute bridge climbed
          to <strong className="text-zinc-100">120 lbs</strong> (up from 35 lbs in session one — a{' '}
          <strong className="text-zinc-100">{Math.round(((120 - 35) / 35) * 100)}% increase</strong>),
          prone bench hamstring curl reached 28 lbs, and leg extension hit 29 lbs.
          Total volume was {last.total_volume?.toLocaleString()} lbs — second highest despite the shorter duration,
          and a perfect 5/5 rating.
        </p>

      </div>

      {/* Notable PRs */}
      {bestPRs.length > 0 && (
        <div className="card">
          <h2 className="label mb-4">Notable PRs</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {bestPRs.map(pr => (
              <div key={pr.key} className="flex items-center justify-between rounded-lg bg-surface-2 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-100">{MOVEMENT_LABELS[pr.key] ?? pr.key}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Set {pr.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-accent tabular-nums">{pr.weight} lbs</p>
                  {pr.growth != null && (
                    <p className="text-xs text-emerald-400">+{pr.growth}% from first</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-session recaps */}
      <div className="card">
        <h2 className="label mb-4">Session Recaps</h2>
        <div className="space-y-4">
          {recaps.map((r, i) => (
            <div key={r.date} className="flex gap-4 items-start">
              <div className="w-1 self-stretch rounded-full bg-accent/30 shrink-0" />
              <div className="flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xs text-zinc-500 tabular-nums">{r.date}</span>
                  <span className="text-sm font-medium text-zinc-100">{r.workout}</span>
                  <span className="text-xs text-zinc-500">{r.duration} min · {r.volume?.toLocaleString()} lbs · {r.rating}/5</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">{r.narrative}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="card text-center">
      <p className="label">{label}</p>
      <p className="mt-2 text-2xl font-bold text-zinc-100 tabular-nums">{value}</p>
    </div>
  )
}

function MiniLifeStat({ label, value }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2.5 text-center">
      <p className="label">{label}</p>
      <p className="mt-1.5 text-base font-bold text-zinc-100 tabular-nums">{value}</p>
    </div>
  )
}

function Goal({ icon, text }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-surface-2 px-3 py-2.5 text-sm text-zinc-300">
      <span className="text-base leading-snug shrink-0">{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function ContextItem({ label, value }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2.5">
      <p className="label mb-0.5">{label}</p>
      <p className="text-zinc-300 text-sm">{value}</p>
    </div>
  )
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000) + 1
}

function countPRs(sessions) {
  let n = 0
  for (const s of sessions) {
    for (const pr of Object.values(s.prs ?? {})) {
      if (pr.weight != null) n++
    }
  }
  return n
}

function findNotablePRs(sessions) {
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  const first = sorted[0]
  const bests = {}
  const firsts = {}

  for (const s of sorted) {
    for (const [key, pr] of Object.entries(s.prs ?? {})) {
      if (pr.weight == null) continue
      if (!(key in firsts)) firsts[key] = pr.weight
      if (!bests[key] || pr.weight > bests[key].weight) {
        bests[key] = { weight: pr.weight, date: pr.date, key }
      }
    }
  }

  return Object.values(bests)
    .map(pr => ({
      ...pr,
      growth: firsts[pr.key] != null && firsts[pr.key] !== pr.weight
        ? Math.round(((pr.weight - firsts[pr.key]) / firsts[pr.key]) * 100)
        : null,
    }))
    .sort((a, b) => (b.growth ?? 0) - (a.growth ?? 0))
    .slice(0, 6)
}

const SESSION_NARRATIVES = {
  '2026-04-04': 'First tracked session. Tonal MCP connected mid-session. Legs were toast by the end — glutes and hamstrings at near-zero readiness post. Set early baselines on glute bridge and kickbacks.',
  '2026-04-05': 'Came back on sore legs the next day. Appropriately lighter volume. First time on the hamstring curl machine — hit PRs immediately on prone curl, SL curl, and leg extension.',
  '2026-04-18': 'Shot day. Tired and full. Trained anyway and rated it 4.5/5. Went heavy on hip thrusts, set a 56 lb PR. Hip abduction and donkey kick PRs too. Short, dense, effective.',
  '2026-04-19': 'Best session yet. Poor sleep, four days off — didn\'t matter. PRs on almost every set. Glute bridge hit 120 lbs. Volume second-highest in just 24 minutes. First perfect 5/5.',
}

function buildRecap(s) {
  return {
    date: s.date,
    workout: s.workout,
    duration: s.duration,
    volume: s.total_volume,
    rating: s.subjective_rating,
    narrative: SESSION_NARRATIVES[s.date] ?? '',
  }
}

function TimelineItem({ date, text, highlight }) {
  return (
    <li className="relative">
      <span className={`font-medium tabular-nums ${highlight ? 'text-accent' : 'text-zinc-400'}`}>{date}</span>
      <span className="text-zinc-500"> — </span>
      <span className={highlight ? 'text-zinc-200' : 'text-zinc-400'}>{text}</span>
    </li>
  )
}
