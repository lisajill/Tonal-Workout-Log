import { useState } from 'react'
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

const TAB_GROUPS = [
  {
    label: 'Summary',
    tabs: [
      { id: 'overview',  label: 'Overview' },
      { id: 'strength',  label: 'Strength Scores' },
    ],
  },
  {
    label: 'Sessions',
    tabs: [
      { id: 'log',      label: 'Tonal Sessions' },
      { id: 'sessions', label: 'Detail' },
      { id: 'bodymaps', label: 'Body Maps' },
    ],
  },
  {
    label: 'Analysis',
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
    tabs: [
      { id: 'cardio', label: 'Cardio' },
      { id: 'rowing', label: 'Rowing' },
    ],
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
      <header className="border-b border-surface-3 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Training Tracker</h1>
      </header>

      <nav className="bg-surface-1 border-b border-surface-3 px-4 relative">
        {openGroup && <div className="fixed inset-0 z-10" onClick={() => setOpenGroup(null)} />}
        <div className="flex items-center gap-x-1">
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
                    className={`px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                      tab === t.id
                        ? 'border-accent text-zinc-100'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t.label}
                  </button>
                )
              }

            return (
              <div key={group.label} className="relative z-20">
                <button
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? 'border-accent text-zinc-100'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span>{isActive ? activeTab.label : group.label}</span>
                  <span className={`text-[10px] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''} ${isActive ? 'text-accent' : 'text-zinc-600'}`}>▾</span>
                </button>
                {isOpen && (
                  <div className="absolute top-full left-0 mt-0 bg-surface-2 border border-surface-3 rounded-b-lg rounded-tr-lg shadow-xl py-1 min-w-[140px]">
                    {group.tabs.map(t => (
                      <button
                        key={t.id}
                        onClick={() => selectTab(t.id)}
                        className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                          tab === t.id
                            ? 'text-accent bg-accent/10'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-3'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      <main className="px-6 py-6 max-w-5xl mx-auto">
        {tab === 'overview'  && <Overview      sessions={sessions} />}
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
