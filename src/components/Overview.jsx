import lifetime from '../data/lifetime-stats.json'
import zone2Log from '../data/zone2_log.json'
import YearAtAGlance from './YearAtAGlance.jsx'

const CAT = {
  strength: '#a78bfa',
  cardio:   '#34d399',
  rowing:   '#38bdf8',
  mixed:    '#818cf8',
  recovery: '#fb923c',
  pr:       '#f472b6',
}

const WEEKLY_Z2_TARGET = 150
const WEEKLY_STRENGTH_TARGET = 3 // current program is 3 days/week

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

function pad2(n) { return String(n).padStart(2, '0') }

// Sunday-start week using local date parts (never new Date('YYYY-MM-DD') — UTC parse)
function getWeekStart(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay()
  const sun = new Date(y, m - 1, d - day)
  return `${sun.getFullYear()}-${pad2(sun.getMonth() + 1)}-${pad2(sun.getDate())}`
}

function localTodayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`
}

export default function Overview({ sessions, onSelectSession }) {
  if (!sessions.length) return null

  const sorted   = [...sessions].sort((a, b) => (a.timestamp ?? a.date).localeCompare(b.timestamp ?? b.date))
  const first    = sorted[0]
  const last     = sorted[sorted.length - 1]
  const daySpan  = daysBetween(first.date, last.date)
  const totalVol  = sessions.reduce((s, x) => s + (x.total_volume ?? 0), 0)
  const totalReps = sessions.reduce((s, x) => s + (x.total_reps ?? 0), 0)
  const avgTUT    = (sessions.reduce((s, x) => s + (x.time_under_tension ?? 0), 0) / sessions.length).toFixed(1)
  const avgRating = (sessions.reduce((s, x) => s + x.subjective_rating, 0) / sessions.length).toFixed(1)
  const prCount   = countPRs(sessions)
  const recaps   = sessions.map(buildRecap)
  const bestPRs  = findNotablePRs(sessions)

  // ── This week (Sun–Sat) ──────────────────────────────────────────────
  const todayStr = localTodayStr()
  const weekStart = getWeekStart(todayStr)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const [y, m, d] = weekStart.split('-').map(Number)
    const dt = new Date(y, m - 1, d + i)
    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`
  })

  const weekStrength = sessions.filter(s => s.date >= weekStart && s.date <= todayStr)
  const weekCardio   = zone2Log.filter(e => e.date >= weekStart && e.date <= todayStr)
  const weekZ2       = weekCardio.reduce((a, e) => a + (e.zone2_min ?? 0), 0)
  const weekVolume   = weekStrength.reduce((a, s) => a + (s.total_volume ?? 0), 0)

  const dayActivity = weekDays.map(d => {
    const types = new Set()
    for (const s of sessions) if (s.date === d) types.add('strength')
    for (const e of zone2Log) {
      if (e.date !== d) continue
      if (e.activity === 'Tonal') types.add('strength')
      else if (e.activity === 'Rowing') types.add('rowing')
      else types.add('cardio')
    }
    return { date: d, types: [...types] }
  })

  return (
    <div className="space-y-6">

      {/* ── This Week — reference-style day strip + progress rings ───── */}
      <div className="card">
        <div className="section-header">
          <div>
            <h2 className="font-display italic text-2xl text-zinc-100">This Week</h2>
            <p className="text-xs text-zinc-500 mt-0.5 mono-stat">{weekLabel(weekStart)}</p>
          </div>
          <p className="label hidden sm:block">Sun – Sat</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
          {/* Day strip */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {dayActivity.map(({ date, types }, i) => {
              const isToday = date === todayStr
              const isFuture = date > todayStr
              const dayNum = Number(date.slice(8))
              return (
                <div
                  key={date}
                  className={`rounded-lg border px-1 py-2 text-center ${
                    isToday ? 'border-accent/60 bg-accent/5' : 'border-surface-3 bg-surface-2/40'
                  } ${isFuture ? 'opacity-40' : ''}`}
                >
                  <p className="label !text-[9px] sm:!text-[10px]">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}</p>
                  <p className={`mono-stat mt-0.5 text-sm font-semibold ${isToday ? 'text-accent-hover' : 'text-zinc-300'}`}>{dayNum}</p>
                  <div className="mt-1.5 flex min-h-[8px] items-center justify-center gap-1">
                    {types.length === 0 && !isFuture && <span className="h-1 w-3 rounded-full bg-surface-3" />}
                    {types.map(t => (
                      <span key={t} className="h-2 w-2 rounded-full" style={{ backgroundColor: CAT[t] }} title={t} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Rings */}
          <div className="flex items-center justify-center gap-8 lg:pl-6 lg:border-l lg:border-surface-3">
            <ProgressRing
              value={weekZ2}
              target={WEEKLY_Z2_TARGET}
              color={CAT.cardio}
              label="Zone 2"
              sub={`${Math.round(weekZ2)} / ${WEEKLY_Z2_TARGET} min`}
            />
            <ProgressRing
              value={weekStrength.length}
              target={WEEKLY_STRENGTH_TARGET}
              color={CAT.strength}
              label="Strength"
              sub={`${weekStrength.length} / ${WEEKLY_STRENGTH_TARGET} sessions`}
            />
            <div className="hidden sm:block">
              <p className="label !text-[10px]">Week volume</p>
              <p className="mono-stat text-xl font-semibold text-zinc-100">{weekVolume.toLocaleString()}</p>
              <p className="text-[11px] text-zinc-500">lbs lifted</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TL;DR — serif narrative ───────────────────────────────────── */}
      <div className="card border-l-[3px] border-l-accent">
        <p className="font-display text-lg leading-relaxed text-zinc-200">
          Across <strong className="text-accent-hover">{sessions.length} sessions</strong> you've set{' '}
          <strong className="text-cat-pr">{prCount} personal records</strong> in{' '}
          {Object.keys(MOVEMENT_LABELS).length} tracked movements. Two recovery sessions built the baseline,
          then strength sessions drove rapid gains — including a two-session day on Apr 25 that confirmed the bench fix
          and pushed hip thrust to 65 lbs (+86% from session one). Apr 26 added two more PRs: Prone Bench SL Hamstring Curl
          (25 lbs, +25%) and Standing Leg Extension (35 lbs, +21%), plus a 3-circuit core finisher.
          Your best sessions have come on shot days and after poor sleep. <em>External stressors are not stopping you.</em>
        </p>
      </div>

      {/* ── Block stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Sessions"   value={sessions.length}                 color={CAT.strength} />
        <Stat label="Days active" value={daySpan}                        color={CAT.strength} />
        <Stat label="Volume"     value={`${(totalVol / 1000).toFixed(1)}k`} unit="lbs"  color={CAT.strength} />
        <Stat label="Total reps" value={totalReps.toLocaleString()}      color={CAT.strength} />
        <Stat label="Avg TUT"    value={avgTUT} unit="min"               color={CAT.recovery} />
        <Stat label="Avg rating" value={avgRating} unit="/ 5"            color={CAT.pr} />
      </div>

      {/* ── Year at a Glance ──────────────────────────────────────────── */}
      <YearAtAGlance sessions={sessions} onSelectSession={onSelectSession} />

      {/* ── Lifetime stats banner ─────────────────────────────────────── */}
      <div className="card">
        <div className="section-header">
          <h2 className="label">Lifetime Stats</h2>
          <p className="text-xs text-zinc-600">all Tonal history</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <MiniLifeStat label="Total workouts"  value={lifetime.totalWorkouts} />
          <MiniLifeStat label="Lifetime volume" value={`${lifetime.totalVolumeLbs.toLocaleString()}`} unit="lbs" />
          <MiniLifeStat label="Total time"      value={`${Math.round(lifetime.totalDurationMinutes / 60)}`} unit="hrs" />
          <MiniLifeStat label="Avg per session" value={`${lifetime.avgVolumePerWorkout.toLocaleString()}`} unit="lbs" />
          <MiniLifeStat label="Movements used"  value={lifetime.totalMovements} />
        </div>
      </div>

      {/* Goals + Context side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="section-header"><h2 className="label">Goals</h2></div>
          <div className="space-y-2">
            <Goal icon="💪" text="Build muscle mass to increase TDEE — priority while on Compounded Tirzepatide (GLP-1)" />
            <Goal icon="🐴" text="Return to riding — target mid-May 2026" />
            <Goal icon="🤲" text="Reintegrate upper body — hands cleared May 2, 2026. Build back compound pressing and pulling." />
            <Goal icon="📈" text="Progress to heavier express sessions — shorter, denser, higher rated" />
            <Goal icon="❤️" text="Zone 2 cardio — 150 min/week target (Rhonda Patrick protocol). Walks + Hydrow rowing once cleared post-May 4" />
            <Goal icon="⚖️" text="Perimenopause-aware programming — phase-matched intensity, recovery-first when needed" />
          </div>
        </div>
        <div className="card">
          <div className="section-header"><h2 className="label">Training Context</h2></div>
          <div className="space-y-2">
            <ContextItem label="Hand status"         value="Both hands cleared — upper body training resumed May 2, 2026" />
            <ContextItem label="Right hand"         value="Post-op (A1 pulley release Feb 2026) — cleared ~7 weeks post-Apr 18" />
            <ContextItem label="Left hand"          value="Post-op (A1 pulley release Mar 2026) — cleared of infection ~Apr 14" />
            <ContextItem label="Medication"         value="Compounded Tirzepatide (GLP-1) — shot day affects energy and output" />
            <ContextItem label="Life stage"         value="Perimenopause — training adapted accordingly" />
            <ContextItem label="Next milestone"     value="Return to riding — target mid-May 2026" />
          </div>
        </div>
      </div>

      {/* Recovery arc + Notable PRs side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="section-header"><h2 className="label">Recovery Arc</h2></div>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-surface-3" />
            <div className="space-y-3">
              <ArcEvent date="Oct 2025"     color="bg-red-500"     text="Training stopped — cellulitis → tenosynovitis surgery" />
              <ArcEvent date="Feb 26, 2026" color="bg-orange-400"  text="A1 pulley release — small finger, right hand" />
              <ArcEvent date="Mar 26, 2026" color="bg-yellow-500"  text="A1 pulley release — small finger, left hand" />
              <ArcEvent date="Apr 4, 2026"  color="bg-accent"      text="First session back — hands-free lower body only" active />
              <ArcEvent date="Apr 19"       color="bg-emerald-400" text="Breakout session — glute bridge 120 lbs, PRs across the board · 5/5" active />
              <ArcEvent date="May 2"        color="bg-emerald-400" text="Hands cleared — first upper body session, hip thrust strength + power PR at 62 lbs" active />
            </div>
          </div>
        </div>

        {bestPRs.length > 0 && (
          <div className="card">
            <div className="section-header">
              <h2 className="label">Notable PRs</h2>
              <span className="pr-badge">⬆ PR</span>
            </div>
            <div className="space-y-2">
              {bestPRs.map(pr => (
                <div key={pr.key} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{MOVEMENT_LABELS[pr.key] ?? pr.key}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 mono-stat">Set {pr.date}</p>
                  </div>
                  <div className="text-right shrink-0 pl-4">
                    <p className="mono-stat text-base font-bold text-cat-pr">{pr.weight} lbs</p>
                    {pr.growth != null && <p className="mono-stat text-xs text-emerald-400">+{pr.growth}%</p>}
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
            {' '}<em>{first.workout}</em> in the recovery phase. This was a return after a significant break: cellulitis
            leading to tenosynovitis surgery in Oct 2025, two A1 pulley releases (Feb and Mar 2026), and months of
            hands-free-only constraint. Re-entry at {first.total_volume?.toLocaleString()} lbs total
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
            After a 13-day gap — caused by a post-op infection at the left surgical site, cleared around Apr 14 — you returned on April 18.
            Shot day (GLP-1), tired, full — and still delivered a{' '}
            <strong className="text-zinc-100">4.5/5</strong>. Fully recovered going in (100% readiness), {sorted[2]?.total_volume?.toLocaleString()} lbs in {sorted[2]?.duration} minutes, hip thrust PR at 56 lbs.
          </p>
          <p>
            April 19 is the best single session on record. Poor sleep, four days off — glute bridge climbed to{' '}
            <strong className="text-zinc-100">120 lbs</strong> ({Math.round(((120 - 35) / 35) * 100)}% up from session one),
            PRs on nearly every set, perfect 5/5.
          </p>
          <p>
            April 25 — another shot day — brought two sessions. The main workout hit PRs on donkey kick (+50%), SL hamstring curl,
            and hip abduction. Smart Flex proposed 132 lbs on the glute bridge and it was unbudgeable; worked down to 100–112 lbs with a volume PR on set 3.
            Then immediately after: a Free Lift hip thrust to solve the bench-slide problem. Yoga mat under the bench fixed it.
            Hit <strong className="text-zinc-100">65 lbs</strong> for a Strength, Power, and Volume PR in the same set — rated 5/5.
          </p>
        </div>
        <div className="mt-5 space-y-3 border-t border-surface-3 pt-4">
          <p className="label">Session Recaps</p>
          {recaps.map(r => (
            <div key={r.id} className="flex gap-3 items-start">
              <div className="w-1 self-stretch rounded-full bg-cat-strength/40 shrink-0" />
              <div className="flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-xs text-zinc-500 mono-stat">{r.date}</span>
                  <span className="text-sm font-medium text-zinc-100">{r.workout}</span>
                  <span className="text-xs text-zinc-500 mono-stat">{r.duration} min · {r.volume?.toLocaleString()} lbs · {r.rating}/5</span>
                </div>
                <p className="text-sm text-zinc-400 mt-0.5">{r.narrative}</p>
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* Footnote */}
      <p className="text-xs text-zinc-700 text-center pt-2">
        Session data pulled via{' '}
        <a
          href="https://github.com/dlwiest/ts-tonal-client"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
        >
          ts-tonal-client
        </a>
      </p>
    </div>
  )
}

// SVG progress ring — reference's "daily habit progress" rings, dark-mode (design.md)
function ProgressRing({ value, target, color, label, sub }) {
  const pct = Math.min(100, Math.round((value / target) * 100))
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#303036" strokeWidth="6" />
          <circle
            cx="32" cy="32" r={r} fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <span className="mono-stat absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-100">
          {pct}%
        </span>
      </div>
      <p className="label !text-[10px]">{label}</p>
      <p className="mono-stat text-[11px] text-zinc-500 -mt-1">{sub}</p>
    </div>
  )
}

function Stat({ label, value, unit, color }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <p className="label">{label}</p>
      <p className="mono-stat mt-1.5 text-2xl font-bold text-zinc-100">
        {value}
        {unit && <span className="ml-1 text-xs font-medium text-zinc-500">{unit}</span>}
      </p>
    </div>
  )
}

function MiniLifeStat({ label, value, unit }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2.5 text-center">
      <p className="label">{label}</p>
      <p className="mono-stat mt-1.5 text-base font-bold text-zinc-100">
        {value}
        {unit && <span className="ml-1 text-[10px] font-medium text-zinc-500">{unit}</span>}
      </p>
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

function weekLabel(weekStart) {
  const [y, m, d] = weekStart.split('-').map(Number)
  const sun = new Date(y, m - 1, d)
  const sat = new Date(y, m - 1, d + 6)
  const fmt = dt => `${dt.toLocaleString('default', { month: 'short' })} ${dt.getDate()}`
  return `${fmt(sun)} – ${fmt(sat)}, ${sat.getFullYear()}`
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
  const sorted = [...sessions].sort((a, b) => (a.timestamp ?? a.date).localeCompare(b.timestamp ?? b.date))
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
}

const SESSION_NARRATIVES = {
  'aeb1248b-83ca-41cc-8af5-594c630a0626': 'First tracked session. Tonal MCP connected mid-session. Legs were toast by the end — glutes and hamstrings at near-zero readiness post. Set early baselines on glute bridge and kickbacks.',
  '00341bc1-7c4d-4713-9f63-8bce102fa9b0': 'Came back on sore legs the next day. Appropriately lighter volume. First time on the hamstring curl machine — hit PRs immediately on prone curl, SL curl, and leg extension.',
  'f8a42e03-03bf-4bdd-8229-d00978f3bc55': 'Shot day. Tired and full. Trained anyway and rated it 4.5/5. Went heavy on hip thrusts, set a 56 lb PR. Hip abduction and donkey kick PRs too. Short, dense, effective.',
  'e6b7b607-d8c0-49ec-8614-09ad03577421': 'Best single session yet. Poor sleep, four days off — didn\'t matter. PRs on almost every set. Glute bridge hit 120 lbs. Volume second-highest in just 24 minutes. First perfect 5/5.',
  '03fb2420-f725-4b1e-9ef7-2654636330cb': 'Shot day energy 4/5. First session with proper rest breaks (2 min post-compound, 90s between isolations) — lower density than Apr 19 but correct execution. Smart Flex proposed 132 lbs on glute bridge — unbudgeable. Worked down to 100–112 lbs, still got a volume PR. Hit PRs on donkey kick (+50%), SL hamstring curl, and hip abduction.',
  '084ab93a-fe9c-49f3-b773-78451edea6d6': 'Bonus session immediately post-workout to test the bench slide fix. Yoga mat under bench + weight plates behind legs — held through 65 lbs. Strength, Power, and Volume PR in one set. Rated 5/5.',
  'db03899d-36f9-46a7-b51c-c34cb53ab5bb': 'Fasted session, 14.5 hr fast. Glutes at 21% from Apr 25 double session — hip thrust done as a separate Free Lift warmup only. Two PRs: Prone Bench SL Hamstring Curl 25 lbs (+25%) and Standing Leg Extension 35 lbs (+21%). Followed by 3-circuit core finisher off-Tonal (dead bug, pilates teaser, bicycle crunches, clamshells, hollow hold, wall pushups, glute bridge march). Right inner groin clicks on dead bug — monitor.',
  '6730f404-c0da-42ab-87e8-e1b72e7c81e3': 'Pre-workout Free Lift hip thrust warmup only — 40 lbs × 10 reps, 1.5 min. Glutes too depleted from Apr 25 for a real hip thrust session.',
  'f61fce07-1e13-4dfc-8eec-f5a2c32a661a': 'First Hands Back — first upper body session since surgery. Tonal crashed mid-workout during bench press sets 2–3. Still got a hip thrust strength + power PR at 62 lbs. Shot day. Energy 5/5.',
}

function buildRecap(s) {
  return {
    id: s.tonal_activity_id ?? `${s.date}::${s.workout}`,
    date: s.date,
    workout: s.workout,
    duration: s.duration,
    volume: s.total_volume,
    rating: s.subjective_rating,
    narrative: SESSION_NARRATIVES[s.tonal_activity_id] ?? '',
  }
}

function ArcEvent({ date, color, text, active, shot }) {
  return (
    <div className="relative flex items-start gap-4 pl-8">
      <span className={`absolute left-0 top-1 h-6 w-6 rounded-full ${color} flex items-center justify-center shrink-0 ${active ? 'ring-2 ring-offset-2 ring-offset-surface-1 ring-current' : ''}`}>
        {shot ? <span className="text-xs">💉</span> : null}
      </span>
      <div>
        <p className={`text-xs font-semibold mono-stat ${active ? 'text-zinc-200' : 'text-zinc-500'}`}>{date}</p>
        <p className={`text-sm mt-0.5 ${active ? 'text-zinc-300' : 'text-zinc-500'}`}>{text}</p>
      </div>
    </div>
  )
}
