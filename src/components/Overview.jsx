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

function formatMovement(key) {
  return MOVEMENT_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
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
  const bestPRs  = findNotablePRs(sessions)

  // Latest PR event + distinct movements PR'd — drives the dynamic TL;DR
  const prMovements = new Set()
  let lastPR = null
  for (const s of sorted) {
    for (const [key, pr] of Object.entries(s.prs ?? {})) {
      if (pr.weight == null) continue
      prMovements.add(key)
      if (!lastPR || (pr.date ?? s.date) >= lastPR.date) lastPR = { key, weight: pr.weight, date: pr.date ?? s.date }
    }
  }

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
            <h2 className="text-2xl font-semibold text-zinc-100">This Week</h2>
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

      {/* ── TL;DR — computed live from the data ────────── */}
      <div className="card border-l-[3px] border-l-accent">
        <p className="text-lg leading-relaxed text-zinc-200">
          Across <strong className="text-accent-hover">{sessions.length} sessions</strong> since {first.date} you've set{' '}
          <strong className="text-cat-pr">{prCount} personal records</strong> in {prMovements.size} movements.
          Most recent: <em>{last.workout}</em> on {last.date}
          {last.total_volume ? <> — {last.total_volume.toLocaleString()} lbs{last.subjective_rating ? ` at ${last.subjective_rating}/5` : ''}</> : null}.
          {lastPR && <> Latest record: {formatMovement(lastPR.key)} at <strong className="text-cat-pr">{lastPR.weight} lbs</strong> on {lastPR.date}.</>}
          {' '}<em>External stressors are not stopping you.</em>
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
            <Goal icon="💪" text="Body recomposition on Tirzepatide — preserve and build muscle mass while losing fat. Protein target 125–130g/day." />
            <Goal icon="🐴" text="Riding on hold — Marley is lame. Building lower body strength in the meantime." />
            <Goal icon="🤲" text="Hands cleared to lift (Jul 17, 2026) — rebuilding grip endurance and tolerance after bilateral carpal tunnel + ulnar neuropathy (dx Jun 11, 2026). Grip-Free program (GF1–GF4) now supplemented with graded hands-on reintroduction, including Hydrow." />
            <Goal icon="🦵" text="Right knee — pain on terminal extension under load (leg extension). Investigating cause; brace returned Jun 18." />
            <Goal icon="❤️" text="Zone 2 — 150 min/week (Rhonda Patrick protocol). Walking + Hydrow rowing. Heat (&gt;90°F) is current limiter." />
            <Goal icon="⚖️" text="Perimenopause-aware programming — bone density, tendon health, recovery-first when needed." />
          </div>
        </div>
        <div className="card">
          <div className="section-header"><h2 className="label">Training Context</h2></div>
          <div className="space-y-2">
            <ContextItem label="Hand status"         value="Cleared to lift (Jul 17, 2026) — bilateral carpal tunnel + ulnar nerve neuropathy (mild, sensory only, dx Jun 11, 2026), self-monitor and stop if it hurts. Actively reconditioning grip endurance; clean sessions across Tonal and Hydrow, wrist soreness at high stroke rate (26 spm) the one open thread." />
            <ContextItem label="Surgical history"   value="A1 pulley releases Feb + Mar 2026 (both hands) — recovered; upper body training resumed May 2, 2026" />
            <ContextItem label="Medication"         value="Compounded Tirzepatide 6.3mg weekly (GLP-1+GIP agonist) — shot day affects energy, appetite, and GI" />
            <ContextItem label="Life stage"         value="Perimenopause — training adapted for bone density, tendon health, and muscle preservation" />
            <ContextItem label="Next milestone"     value="Resolve right knee pain on terminal leg extension — PT evaluation underway Jun 18, 2026" />
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
              <ArcEvent date="Jun 11"       color="bg-orange-400"  text="Hands uncleared — bilateral carpal tunnel + ulnar nerve neuropathy (mild, sensory only). Grip-free programming." active />
              <ArcEvent date="Jun 13"       color="bg-emerald-400" text="Grip-Free program launched (GF1–GF4) — hip thrust 110 lbs, 4 PRs first session · 5/5" active />
              <ArcEvent date="Jun 2026"     color="bg-orange-400"  text="Riding on hold — Marley is lame" active />
              <ArcEvent date="Jun 18"       color="bg-orange-400"  text="Knee: patellar tracking brace trialed and returned — pain on terminal leg extension persists at end range. PT evaluation scheduled." active />
              <ArcEvent date="Jul 17"       color="bg-emerald-400" text="Hands cleared to lift — self-monitor, stop if it hurts. Steroid injection into left-hand scar tissue same day." active />
              <ArcEvent date="Jul 18"       color="bg-emerald-400" text="First hands-on session since diagnosis — wrist-support gloves debuted" active />
              <ArcEvent date="Jul 24"       color="bg-orange-400"  text="Grip gave out on Single-Leg RDL, no pain — first real grip-endurance data point; session cut short" active />
              <ArcEvent date="Jul 26"       color="bg-emerald-400" text="First Hydrow row since diagnosis (~11 weeks off) — hands felt better than the Tonal arm bike, no issues" active />
              <ArcEvent date="Jul 28–Aug 1" color="bg-emerald-400" text="Hydrow reintroduction holds clean — 3 sessions, zero grip issues; first full-length row (15 min) surfaces wrist soreness specifically at 26 spm, isolated as a narrow thread to keep testing" active />
            </div>
          </div>
        </div>

        {bestPRs.length > 0 && (
          <div className="card">
            <div className="section-header">
              <h2 className="label">Most Improved Lifts</h2>
              <span className="pr-badge">⬆ {prCount} PRs</span>
            </div>
            <div className="space-y-2">
              {bestPRs.slice(0, 8).map(pr => (
                <div key={pr.key} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{formatMovement(pr.key)}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 mono-stat">Set {pr.date}</p>
                  </div>
                  <div className="text-right shrink-0 pl-4">
                    <p className="mono-stat text-base font-bold text-cat-pr">{pr.weight} lbs</p>
                    {pr.growth != null && <p className="mono-stat text-xs text-emerald-400">+{pr.growth}%</p>}
                  </div>
                </div>
              ))}
            </div>
            <a href="#prs" className="mt-3 block text-right text-xs text-accent-hover hover:text-zinc-100 transition-colors">
              All {bestPRs.length} movements →
            </a>
          </div>
        )}
      </div>

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
