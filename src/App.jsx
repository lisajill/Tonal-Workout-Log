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
import sessions from './data/sessions.json'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'log',      label: 'Session Log' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'prs',      label: 'PRs' },
  { id: 'bodymaps', label: 'Body Maps' },
  { id: 'matrix',   label: 'Muscle Matrix' },
  { id: 'heatmap',  label: 'Muscle Readiness' },
  { id: 'charts',   label: 'Charts' },
  { id: 'programs', label: 'Programs' },
]

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

      <nav className="flex gap-1 border-b border-surface-3 px-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTabAndHash(t.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'border-b-2 border-accent text-accent'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
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
      </main>
    </div>
  )
}
