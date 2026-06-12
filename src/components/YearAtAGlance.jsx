import { useMemo, useState } from 'react'
import zone2Log from '../data/zone2_log.json'

// Category colors — match tailwind cat-* tokens (design.md)
const CAT_COLORS = {
  strength: '#a78bfa',
  cardio:   '#34d399',
  rowing:   '#38bdf8',
  mixed:    '#818cf8',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function pad2(n) { return String(n).padStart(2, '0') }

function localTodayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`
}

function daysInMonth(year, monthIdx) {
  return new Date(year, monthIdx + 1, 0).getDate()
}

// 'strength' | 'cardio' | 'rowing' | 'mixed' from the day's entries
function deriveDayType({ hasStrength, hasCardio, hasRowing }) {
  if (hasStrength && (hasCardio || hasRowing)) return 'mixed'
  if (hasStrength) return 'strength'
  if (hasRowing) return 'rowing'
  if (hasCardio) return 'cardio'
  return null
}

export default function YearAtAGlance({ sessions, onSelectSession }) {
  const todayStr = localTodayStr()

  // date → { hasStrength, hasCardio, hasRowing, labels: [], tonalId }
  const dayMap = useMemo(() => {
    const map = {}
    const get = d => (map[d] ??= { hasStrength: false, hasCardio: false, hasRowing: false, labels: [], tonalId: null })

    // Bucket by the `date` field — it's already the local date. Slicing the
    // timestamp would shift late-evening zone2 sessions (UTC) to the next day.
    for (const s of sessions) {
      const day = get(s.date)
      day.hasStrength = true
      day.labels.push(s.workout)
      if (!day.tonalId && s.tonal_activity_id) day.tonalId = s.tonal_activity_id
    }
    for (const e of zone2Log) {
      const day = get(e.date)
      // Zones-exported Tonal sessions are strength workouts already in sessions.json
      if (e.activity === 'Tonal') { day.hasStrength = true; continue }
      if (e.activity === 'Rowing') day.hasRowing = true
      else day.hasCardio = true
      day.labels.push(`${e.activity} · ${Math.round(e.duration_min ?? 0)}m`)
    }
    return map
  }, [sessions])

  const years = useMemo(() => {
    const ys = new Set(Object.keys(dayMap).map(d => Number(d.slice(0, 4))))
    ys.add(new Date().getFullYear())
    return [...ys].sort()
  }, [dayMap])

  const [year, setYear] = useState(new Date().getFullYear())

  // Streaks + totals for the selected year
  const { activeDays, currentStreak, longestStreak } = useMemo(() => {
    const dates = Object.keys(dayMap).filter(d => d.startsWith(String(year)) && d <= todayStr).sort()
    let longest = 0, run = 0, prev = null
    for (const d of dates) {
      if (prev && Math.round((new Date(d) - new Date(prev)) / 86400000) === 1) run += 1
      else run = 1
      if (run > longest) longest = run
      prev = d
    }
    // current streak: count back from today (or yesterday, so a rest morning doesn't zero it)
    let cur = 0
    const cursor = new Date()
    if (!dayMap[todayStr]) cursor.setDate(cursor.getDate() - 1)
    for (;;) {
      const key = `${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}-${pad2(cursor.getDate())}`
      if (!dayMap[key]) break
      cur += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return { activeDays: dates.length, currentStreak: cur, longestStreak: longest }
  }, [dayMap, year, todayStr])

  return (
    <div className="card">
      <div className="section-header">
        <div>
          <h2 className="label">Year at a Glance</h2>
          <p className="text-xs text-zinc-500 mt-1">Every training day, color-coded by activity</p>
        </div>
        {years.length > 1 && (
          <div className="flex gap-1">
            {years.map(y => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`rounded px-2 py-0.5 text-xs font-medium mono-stat transition-colors ${
                  y === year ? 'bg-accent/20 text-accent-hover' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* 12 × 31 grid — hairline borders via gap-px on a surface-3 background */}
        <div className="flex-1 overflow-x-auto">
          <div className="grid min-w-[480px] grid-cols-[auto_repeat(12,1fr)] gap-px rounded-md bg-surface-3 p-px">
            <div className="bg-surface-1 rounded-tl-md" />
            {MONTHS.map(m => (
              <div key={m} className="label bg-surface-1 py-1 text-center !text-[9px] sm:!text-[10px]">{m}</div>
            ))}
            {Array.from({ length: 31 }, (_, di) => {
              const dayNum = di + 1
              return [
                <div key={`d${dayNum}`} className="bg-surface-1 px-1.5 text-right text-[9px] leading-[18px] text-zinc-600 mono-stat">
                  {dayNum}
                </div>,
                ...MONTHS.map((m, mi) => {
                  const valid = dayNum <= daysInMonth(year, mi)
                  const dateStr = `${year}-${pad2(mi + 1)}-${pad2(dayNum)}`
                  if (!valid) {
                    return <div key={dateStr} className="h-[18px] bg-surface-0 opacity-30" />
                  }
                  const isFuture = dateStr > todayStr
                  const isToday = dateStr === todayStr
                  const day = dayMap[dateStr]
                  const type = day ? deriveDayType(day) : null
                  const color = type ? CAT_COLORS[type] : null
                  const clickable = !!day?.tonalId && !!onSelectSession
                  return (
                    <div key={dateStr} className="group relative h-[18px]">
                      <button
                        onClick={clickable ? () => onSelectSession(day.tonalId) : undefined}
                        className={`h-full w-full transition-[filter] ${
                          isFuture ? 'bg-surface-0' : color ? 'hover:brightness-125' : 'bg-surface-2/60'
                        } ${clickable ? 'cursor-pointer' : 'cursor-default'} ${
                          isToday ? 'ring-1 ring-inset ring-zinc-300' : ''
                        }`}
                        style={color ? { backgroundColor: color } : undefined}
                        tabIndex={day ? 0 : -1}
                        aria-label={dateStr}
                      />
                      {day && (
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-surface-3 bg-surface-2 px-2.5 py-1.5 text-left shadow-lg group-hover:block">
                          <p className="text-[11px] font-semibold text-zinc-100 mono-stat">{dateStr}</p>
                          {day.labels.slice(0, 4).map((l, i) => (
                            <p key={i} className="text-[11px] text-zinc-400">{l}</p>
                          ))}
                          {clickable && <p className="mt-0.5 text-[10px] text-accent-hover">click to open session →</p>}
                        </div>
                      )}
                    </div>
                  )
                }),
              ]
            })}
          </div>
        </div>

        {/* Legend + streaks */}
        <div className="flex shrink-0 flex-row flex-wrap gap-x-6 gap-y-4 lg:w-40 lg:flex-col">
          <div className="space-y-2">
            {[
              ['Strength', CAT_COLORS.strength],
              ['Cardio', CAT_COLORS.cardio],
              ['Rowing', CAT_COLORS.rowing],
              ['Mixed', CAT_COLORS.mixed],
            ].map(([name, color]) => (
              <div key={name} className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
                <span className="label !text-[10px] text-zinc-400">{name}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-surface-2/60 border border-surface-3" />
              <span className="label !text-[10px] text-zinc-400">Rest</span>
            </div>
          </div>
          <div className="space-y-3 border-surface-3 lg:border-t lg:pt-3">
            <div>
              <p className="label !text-[10px]">Active days</p>
              <p className="mono-stat text-lg font-semibold text-zinc-100">{activeDays}</p>
            </div>
            <div>
              <p className="label !text-[10px]">Current streak</p>
              <p className="mono-stat text-lg font-semibold" style={{ color: CAT_COLORS.cardio }}>{currentStreak}d</p>
            </div>
            <div>
              <p className="label !text-[10px]">Longest streak</p>
              <p className="mono-stat text-lg font-semibold text-zinc-100">{longestStreak}d</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
