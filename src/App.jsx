import { useState } from 'react'
import Overview from './components/Overview.jsx'
import SessionLog from './components/SessionLog.jsx'
import SessionDetail from './components/SessionDetail.jsx'
import PRTracker from './components/PRTracker.jsx'
import MuscleHeatmap from './components/MuscleHeatmap.jsx'
import Charts from './components/Charts.jsx'
import BodyMaps from './components/BodyMaps.jsx'
import Programs from './components/Programs.jsx'
import MuscleMatrix from './components/MuscleMatrix.jsx'
import StrengthScores from './components/StrengthScores.jsx'
import sessions from './data/sessions.json'

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
      { id: 'log',      label: 'Session Log' },
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
    ],
  },
  {
    label: 'Training',
    tabs: [
      { id: 'programs', label: 'Custom Workouts' },
    ],
  },
]

const TABS = TAB_GROUPS.flatMap(g => g.tabs)

const VALID_TABS = new Set(TABS.map(t => t.id))

function getInitialTab() {
  const hash = window.location.hash.slice(1)
  return VALID_TABS.has(hash) ? hash : 'overview'
}

export default function App() {
  const [tab, setTab] = useState(getInitialTab)
  const [activeSession, setActiveSession] = useState(null)

  function setTabAndHash(id) {
    window.location.hash = id
    setTab(id)
  }

  function openSession(date) {
    setActiveSession(date)
    setTabAndHash('sessions')
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <header className="border-b border-surface-3 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-100">Tonal Tracker</h1>
      </header>

      <nav className="border-b border-surface-3 px-4 py-2">
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
          {TAB_GROUPS.map((group, gi) => (
            <div key={group.label} className="flex items-center gap-x-1">
              {gi > 0 && (
                <span className="hidden sm:block w-px h-4 bg-surface-3 mx-1" />
              )}
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 px-2 hidden sm:block">
                {group.label}
              </span>
              {group.tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTabAndHash(t.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    tab === t.id
                      ? 'bg-accent/15 text-accent'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-2'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <main className="px-6 py-6 max-w-5xl mx-auto">
        {tab === 'overview'  && <Overview      sessions={sessions} />}
        {tab === 'log'       && <SessionLog    sessions={sessions} onSelectSession={openSession} />}
        {tab === 'sessions'  && <SessionDetail key={activeSession} sessions={sessions} initialDate={activeSession} />}
        {tab === 'prs'       && <PRTracker     sessions={sessions} />}
        {tab === 'bodymaps'  && <BodyMaps       sessions={sessions} />}
        {tab === 'matrix'    && <MuscleMatrix   sessions={sessions} />}
        {tab === 'heatmap'   && <MuscleHeatmap  sessions={sessions} />}
        {tab === 'charts'    && <Charts        sessions={sessions} />}
        {tab === 'programs'  && <Programs />}
        {tab === 'strength'  && <StrengthScores />}
      </main>
    </div>
  )
}
