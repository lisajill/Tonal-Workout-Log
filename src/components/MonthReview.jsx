import { useMemo, useState } from 'react'
import zone2Log from '../data/zone2_log.json'

// Category colors — match tailwind cat-* tokens (design.md)
const CAT_COLORS = {
  strength: '#a78bfa',
  cardio:   '#34d399',
  rowing:   '#38bdf8',
  mixed:    '#818cf8',
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function pad2(n) { return String(n).padStart(2, '0') }

function localTodayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`
}

function daysInMonth(year, monthIdx) {
  return new Date(year, monthIdx + 1, 0).getDate()
}

// Monday-first weekday index (0 = Mon ... 6 = Sun) for the 1st of the month
function mondayFirstWeekday(year, monthIdx) {
  const jsDay = new Date(year, monthIdx, 1).getDay() // 0 = Sun
  return (jsDay + 6) % 7
}

function deriveDayType({ hasStrength, hasCardio, hasRowing }) {
  if (hasStrength && (hasCardio || hasRowing)) return 'mixed'
  if (hasStrength) return 'strength'
  if (hasRowing) return 'rowing'
  if (hasCardio) return 'cardio'
  return null
}

export default function MonthReview({ sessions, onSelectSession }) {
  const todayStr = localTodayStr()
  const today = new Date()

  const dayMap = useMemo(() => {
    const map = {}
    const get = d => (map[d] ??= { hasStrength: false, hasCardio: false, hasRowing: false, labels: [], tonalId: null })
    for (const s of sessions) {
      const day = get(s.date)
      day.hasStrength = true
      day.labels.push(s.workout)
      if (!day.tonalId && s.tonal_activity_id) day.tonalId = s.tonal_activity_id
    }
    for (const e of zone2Log) {
      const day = get(e.date)
      if (e.activity.startsWith('Tonal')) { day.hasStrength = true; continue }
      if (e.activity === 'Rowing') day.hasRowing = true
      else day.hasCardio = true
      day.labels.push(`${e.activity} · ${Math.round(e.duration_min ?? 0)}m`)
    }
    return map
  }, [sessions])

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0-indexed

  function shiftMonth(delta) {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setViewMonth(m)
    setViewYear(y)
  }

  const activeDaysOnTonal = useMemo(() => {
    const prefix = `${viewYear}-${pad2(viewMonth + 1)}`
    return Object.keys(dayMap).filter(d => d.startsWith(prefix) && dayMap[d].hasStrength).length
  }, [dayMap, viewYear, viewMonth])

  const leadingBlanks = mondayFirstWeekday(viewYear, viewMonth)
  const totalDays = daysInMonth(viewYear, viewMonth)
  const cells = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]

  return (
    <div className="card">
      <div className="section-header">
        <div>
          <h2 className="label">Month Review</h2>
          <p className="text-xs text-zinc-500 mt-1">{activeDaysOnTonal} active day{activeDaysOnTonal === 1 ? '' : 's'} on Tonal</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftMonth(-1)} className="rounded px-2 py-1 text-zinc-400 hover:text-zinc-100 hover:bg-surface-2 transition-colors" aria-label="Previous month">‹</button>
          <span className="mono-stat text-sm font-medium text-zinc-200 w-32 text-center">{MONTH_NAMES[viewMonth]} {viewYear}</span>
          <button onClick={() => shiftMonth(1)} className="rounded px-2 py-1 text-zinc-400 hover:text-zinc-100 hover:bg-surface-2 transition-colors" aria-label="Next month">›</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map(w => (
          <div key={w} className="label !text-[10px] text-center pb-1">{w}</div>
        ))}
        {cells.map((dayNum, i) => {
          if (dayNum == null) return <div key={`blank${i}`} />
          const dateStr = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(dayNum)}`
          const isFuture = dateStr > todayStr
          const isToday = dateStr === todayStr
          const day = dayMap[dateStr]
          const type = day ? deriveDayType(day) : null
          const color = type ? CAT_COLORS[type] : null
          const clickable = !!day?.tonalId && !!onSelectSession
          return (
            <div key={dateStr} className="group relative aspect-square">
              <button
                onClick={clickable ? () => onSelectSession(day.tonalId) : undefined}
                className={`flex h-full w-full items-center justify-center rounded-full text-sm mono-stat transition-[filter] ${
                  isFuture ? 'text-zinc-700' : color ? 'text-zinc-950 font-semibold hover:brightness-110' : 'text-zinc-500 bg-surface-2/60'
                } ${clickable ? 'cursor-pointer' : 'cursor-default'} ${
                  isToday ? 'ring-1 ring-inset ring-accent' : ''
                }`}
                style={color ? { backgroundColor: color } : undefined}
                tabIndex={day ? 0 : -1}
                aria-label={dateStr}
              >
                {dayNum}
              </button>
              {day && (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-surface-3 bg-surface-2 px-2.5 py-1.5 text-left shadow-lg group-hover:block">
                  <p className="text-[11px] font-semibold text-zinc-100 mono-stat">{dateStr}</p>
                  {day.labels.slice(0, 4).map((l, i) => (
                    <p key={i} className="text-[11px] text-zinc-400">{l}</p>
                  ))}
                  {clickable && <p className="mt-0.5 text-[10px] text-accent-hover">click to open session →</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-surface-3 pt-3">
        {[
          ['Strength', CAT_COLORS.strength],
          ['Cardio', CAT_COLORS.cardio],
          ['Rowing', CAT_COLORS.rowing],
          ['Mixed', CAT_COLORS.mixed],
        ].map(([name, color]) => (
          <div key={name} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="label !text-[10px] text-zinc-400">{name}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-surface-2/60 border border-surface-3" />
          <span className="label !text-[10px] text-zinc-400">Rest</span>
        </div>
      </div>
    </div>
  )
}
