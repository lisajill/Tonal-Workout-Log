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
        <h2 className="label mb-4">Lifetime Stats <span className="normal-case font-normal text-zinc-600 ml-1">— as of Apr 19, 2026</span></h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <MiniLifeStat label="Total workouts"   value="186" />
          <MiniLifeStat label="Lifetime volume"  value="484,829 lbs" />
          <MiniLifeStat label="Total time"       value="67 hrs" />
          <MiniLifeStat label="Best streak"      value="19 sessions" />
          <MiniLifeStat label="Movements used"   value="199" />
        </div>
      </div>

      {/* Goals + Context side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="label mb-3">Goals</h2>
          <div className="space-y-2">
            <Goal icon="💪" text="Build muscle mass to increase TDEE — priority while on Compounded Tirzepatide (GLP-1)" />
            <Goal icon="🐴" text="Return to riding — target mid-May 2026" />
            <Goal icon="🤲" text="Reassess upper body reintroduction once hands are cleared" />
            <Goal icon="📈" text="Progress to heavier express sessions — shorter, denser, higher rated" />
            <Goal icon="⚖️" text="Perimenopause-aware programming — phase-matched intensity, recovery-first when needed" />
          </div>
        </div>
        <div className="card">
          <h2 className="label mb-3">Training Context</h2>
          <div className="space-y-2">
            <ContextItem label="Current constraint" value="Hands-free lower body only — both hands post-op" />
            <ContextItem label="Right hand"         value="Light grip available, ~week 7 post-op at Apr 18" />
            <ContextItem label="Left hand"          value="No grip — cleared of infection ~Apr 14" />
            <ContextItem label="Medication"         value="Compounded Tirzepatide (GLP-1) — shot day affects energy and output" />
            <ContextItem label="Life stage"         value="Perimenopause — training adapted accordingly" />
            <ContextItem label="Next milestone"     value="Upper body reassessment when hands are cleared" />
          </div>
        </div>
      </div>

      {/* Recovery arc + Notable PRs side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="label mb-4">Recovery Arc</h2>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-surface-3" />
            <div className="space-y-3">
              <ArcEvent date="Oct 2025"     color="bg-red-500"     text="Training stopped — cellulitis → tenosynovitis surgery" />
              <ArcEvent date="Nov–Jan"      color="bg-orange-500"  text="PT irritated trigger fingers on both small fingers" />
              <ArcEvent date="Feb 26, 2026" color="bg-orange-400"  text="A1 pulley release — small finger, right hand" />
              <ArcEvent date="Mar 26, 2026" color="bg-yellow-500"  text="A1 pulley release — small finger, left hand" />
              <ArcEvent date="Apr 4, 2026"  color="bg-accent"      text="First session back — 5,553 lbs · 4/5" active />
              <ArcEvent date="Apr 5"        color="bg-accent"      text="Session 2 — sore legs, first hamstring PRs" active />
              <ArcEvent date="Apr 18"       color="bg-accent"      text="Session 3 — shot day, hip thrust PR 56 lbs · 4.5/5" active shot />
              <ArcEvent date="Apr 19"       color="bg-emerald-400" text="Session 4 — glute bridge 120 lbs, PRs everywhere · 5/5" active />
            </div>
          </div>
        </div>

        {bestPRs.length > 0 && (
          <div className="card">
            <h2 className="label mb-4">Notable PRs</h2>
            <div className="space-y-2">
              {bestPRs.map(pr => (
                <div key={pr.key} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{MOVEMENT_LABELS[pr.key] ?? pr.key}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Set {pr.date}</p>
                  </div>
                  <div className="text-right shrink-0 pl-4">
                    <p className="text-base font-bold text-accent tabular-nums">{pr.weight} lbs</p>
                    {pr.growth != null && <p className="text-xs text-emerald-400">+{pr.growth}%</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Collapsible: Progress Story + Recaps */}
      <details className="card group">
        <summary className="label cursor-pointer list-none flex items-center justify-between">
          Progress Story &amp; Session Recaps
          <span className="text-zinc-600 group-open:rotate-180 transition-transform">▾</span>
        </summary>
        <div className="mt-4 space-y-4 leading-relaxed text-zinc-300 text-sm">
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
            and you rated it {sorted[1]?.subjective_rating}/5. First hamstring PRs: prone bench curl, SL curl, and leg extension in the same session.
          </p>
          <p>
            After a 13-day gap you returned on April 18 — shot day (GLP-1), tired, full — and still delivered a{' '}
            <strong className="text-zinc-100">4.5/5</strong>. Fully recovered going in (100% readiness), {sorted[2]?.total_volume?.toLocaleString()} lbs in {sorted[2]?.duration} minutes, hip thrust PR at 56 lbs.
          </p>
          <p>
            April 19 is the strongest session on record. Poor sleep, four days off — glute bridge climbed to{' '}
            <strong className="text-zinc-100">120 lbs</strong> ({Math.round(((120 - 35) / 35) * 100)}% up from session one),
            PRs on nearly every set, perfect 5/5.
          </p>
        </div>
        <div className="mt-5 space-y-3 border-t border-surface-3 pt-4">
          <p className="label">Session Recaps</p>
          {recaps.map(r => (
            <div key={r.date} className="flex gap-3 items-start">
              <div className="w-1 self-stretch rounded-full bg-accent/30 shrink-0" />
              <div className="flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xs text-zinc-500 tabular-nums">{r.date}</span>
                  <span className="text-sm font-medium text-zinc-100">{r.workout}</span>
                  <span className="text-xs text-zinc-500">{r.duration} min · {r.volume?.toLocaleString()} lbs · {r.rating}/5</span>
                </div>
                <p className="text-sm text-zinc-400 mt-0.5">{r.narrative}</p>
              </div>
            </div>
          ))}
        </div>
      </details>
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

function ArcEvent({ date, color, text, active, shot }) {
  return (
    <div className="relative flex items-start gap-4 pl-8">
      <span className={`absolute left-0 top-1 h-6 w-6 rounded-full ${color} flex items-center justify-center shrink-0 ${active ? 'ring-2 ring-offset-2 ring-offset-surface-1 ring-current' : ''}`}>
        {shot ? <span className="text-xs">💉</span> : null}
      </span>
      <div>
        <p className={`text-xs font-semibold tabular-nums ${active ? 'text-zinc-200' : 'text-zinc-500'}`}>{date}</p>
        <p className={`text-sm mt-0.5 ${active ? 'text-zinc-300' : 'text-zinc-500'}`}>{text}</p>
      </div>
    </div>
  )
}
