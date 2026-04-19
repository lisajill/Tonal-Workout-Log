import { useState } from 'react'
import Overview from './components/Overview.jsx'
import SessionLog from './components/SessionLog.jsx'
import SessionDetail from './components/SessionDetail.jsx'
import PRTracker from './components/PRTracker.jsx'
import MuscleHeatmap from './components/MuscleHeatmap.jsx'
import Charts from './components/Charts.jsx'
import BodyMaps from './components/BodyMaps.jsx'
import sessions from './data/sessions.json'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'log',      label: 'Session Log' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'prs',      label: 'PRs' },
  { id: 'bodymaps', label: 'Body Maps' },
  { id: 'heatmap',  label: 'Muscle Readiness' },
  { id: 'charts',   label: 'Charts' },
]

export default function App() {
  const [tab, setTab] = useState('overview')
  const [activeSession, setActiveSession] = useState(null)

  function openSession(date) {
    setActiveSession(date)
    setTab('sessions')
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
            onClick={() => setTab(t.id)}
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
        {tab === 'sessions'  && <SessionDetail sessions={sessions} initialDate={activeSession} />}
        {tab === 'prs'       && <PRTracker     sessions={sessions} />}
        {tab === 'bodymaps'  && <BodyMaps      sessions={sessions} />}
        {tab === 'heatmap'   && <MuscleHeatmap sessions={sessions} />}
        {tab === 'charts'    && <Charts        sessions={sessions} />}
      </main>
    </div>
  )
}
