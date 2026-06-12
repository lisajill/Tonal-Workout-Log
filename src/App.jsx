import { useState, useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Overview from './components/Overview.jsx'
import SessionLog from './components/SessionLog.jsx'
import SessionDetail from './components/SessionDetail.jsx'
import PRTracker from './components/PRTracker.jsx'
import MuscleHeatmap from './components/MuscleHeatmap.jsx'
import Charts from './components/Charts.jsx'
import BodyMaps from './components/BodyMaps.jsx'
import MuscleMatrix from './components/MuscleMatrix.jsx'
import StrengthScores from './components/StrengthScores.jsx'
import CurrentReadiness from './components/CurrentReadiness.jsx'
import CardioTracker from './components/CardioTracker.jsx'
import RowingTracker from './components/RowingTracker.jsx'
import rawSessions from './data/sessions.json'
const sessions = rawSessions.filter(s => !s.merged_into)

// Each group carries a category color — color = category (design.md)
const TAB_GROUPS = [
  {
    label: 'Summary',
    color: '#6366f1', // accent
    tabs: [
      { id: 'overview',  label: 'Overview' },
      { id: 'strength',  label: 'Strength Scores' },
    ],
  },
  {
    label: 'Sessions',
    color: '#a78bfa', // cat-strength
    tabs: [
      { id: 'log',      label: 'Tonal Sessions' },
      { id: 'sessions', label: 'Detail' },
      { id: 'bodymaps', label: 'Body Maps' },
    ],
  },
  {
    label: 'Analysis',
    color: '#fb923c', // cat-recovery
    tabs: [
      { id: 'charts',  label: 'Charts' },
      { id: 'prs',     label: 'PRs' },
      { id: 'matrix',  label: 'Muscle Matrix' },
      { id: 'heatmap', label: 'Readiness' },
      { id: 'current-readiness', label: 'Current State' },
    ],
  },
  {
    label: 'Cardio',
    color: '#34d399', // cat-cardio
    tabs: [{ id: 'cardio', label: 'Cardio' }],
  },
  {
    label: 'Rowing',
    color: '#38bdf8', // cat-rowing
    tabs: [{ id: 'rowing', label: 'Rowing' }],
  },
]

const TABS = TAB_GROUPS.flatMap(g => g.tabs)

const VALID_TABS = new Set(TABS.map(t => t.id))

function parseHash() {
  const hash = window.location.hash.slice(1)
  const [tabPart, ...rest] = hash.split(':')
  const sessionKey = rest.length ? rest.join(':') : null
  const tab = VALID_TABS.has(tabPart) ? tabPart : 'overview'
  return { tab, sessionKey }
}

export default function App() {
  const initial = parseHash()
  const [tab, setTab] = useState(initial.tab)
  const [activeSession, setActiveSession] = useState(initial.sessionKey)
  const [openGroup, setOpenGroup] = useState(null)
  const [dropdownStyle, setDropdownStyle] = useState({})

  // Keep tab state in sync with the hash — enables plain anchor links
  // between tabs and makes browser back/forward work
  useEffect(() => {
    function onHash() {
      const next = parseHash()
      setTab(next.tab)
      setActiveSession(next.sessionKey)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function setTabAndHash(id, sessionKey = null) {
    window.location.hash = sessionKey ? `${id}:${sessionKey}` : id
    setTab(id)
  }

  function openSession(key) {
    setActiveSession(key)
    setTabAndHash('sessions', key)
  }

  function selectTab(id) {
    setTabAndHash(id)
    setOpenGroup(null)
  }

  return (
    <>
      <Analytics />
      <div className="min-h-screen bg-surface-0">
      <nav className="sticky top-0 z-30 h-12 bg-surface-1/95 backdrop-blur border-b border-surface-3 px-3 sm:px-6">
        {openGroup && <div className="fixed inset-0 z-10" onClick={() => setOpenGroup(null)} />}
        <div className="flex h-full items-center gap-x-3 max-w-7xl mx-auto">
          <button
            onClick={() => selectTab('overview')}
            className="font-display italic text-xl text-zinc-100 leading-none shrink-0 pr-2 sm:pr-4 hover:text-accent-hover transition-colors"
            title="Overview"
          >
            LJ <span className="text-accent">Fitness</span>
          </button>
          <div className="flex h-full items-center gap-x-0.5 overflow-x-auto scrollbar-hide">
          {TAB_GROUPS.map(group => {
            const activeTab = group.tabs.find(t => t.id === tab)
            const isActive = !!activeTab
            const isOpen = openGroup === group.label
            if (group.tabs.length === 1) {
              const t = group.tabs[0]
              return (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  className={`h-full px-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                    tab === t.id
                      ? 'text-zinc-100'
                      : 'border-transparent text-zinc-500 hover:text-zinc-200'
                  }`}
                  style={tab === t.id ? { borderBottomColor: group.color } : undefined}
                >
                  {t.label}
                </button>
              )
            }
            return (
              <div key={group.label} className="relative z-20 h-full">
                <button
                  onClick={e => {
                    if (isOpen) { setOpenGroup(null); return }
                    const rect = e.currentTarget.getBoundingClientRect()
                    setDropdownStyle({ top: rect.bottom, left: rect.left })
                    setOpenGroup(group.label)
                  }}
                  className={`flex h-full items-center gap-1.5 px-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? 'text-zinc-100'
                      : 'border-transparent text-zinc-500 hover:text-zinc-200'
                  }`}
                  style={isActive ? { borderBottomColor: group.color } : undefined}
                >
                  <span>{isActive ? activeTab.label : group.label}</span>
                  <span
                    className={`text-[10px] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''} ${isActive ? '' : 'text-zinc-600'}`}
                    style={isActive ? { color: group.color } : undefined}
                  >▾</span>
                </button>
              </div>
            )
          })}
          </div>
        </div>
        {openGroup && (() => {
          const group = TAB_GROUPS.find(g => g.label === openGroup)
          if (!group) return null
          return (
            <div
              className="fixed z-20 bg-surface-2 border border-surface-3 rounded-b-lg rounded-tr-lg shadow-lg py-1 min-w-[150px]"
              style={dropdownStyle}
            >
              {group.tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors flex items-center gap-2 ${
                    tab === t.id
                      ? 'text-zinc-100 bg-surface-3/60'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-3'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${tab === t.id ? '' : 'opacity-0'}`}
                    style={{ backgroundColor: group.color }}
                  />
                  {t.label}
                </button>
              ))}
            </div>
          )
        })()}
      </nav>

      <main className="px-3 py-4 sm:px-6 sm:py-6 max-w-7xl mx-auto">
        {tab === 'overview'  && <Overview      sessions={sessions} onSelectSession={openSession} />}
        {tab === 'log'       && <SessionLog    sessions={sessions} onSelectSession={openSession} />}
        {tab === 'sessions'  && <SessionDetail key={activeSession} sessions={sessions} initialKey={activeSession} />}
        {tab === 'prs'       && <PRTracker     sessions={sessions} />}
        {tab === 'bodymaps'  && <BodyMaps       sessions={sessions} />}
        {tab === 'matrix'    && <MuscleMatrix   sessions={sessions} />}
        {tab === 'heatmap'   && <MuscleHeatmap  sessions={sessions} />}
        {tab === 'charts'    && <Charts        sessions={sessions} />}
        {tab === 'strength'         && <StrengthScores />}
        {tab === 'current-readiness' && <CurrentReadiness />}
        {tab === 'cardio'    && <CardioTracker />}
        {tab === 'rowing'    && <RowingTracker />}
      </main>
      </div>
    </>
  )
}
