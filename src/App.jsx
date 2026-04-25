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

      <nav className="border-b border-surface-3 px-4">
        {[TAB_GROUPS.slice(0, 2), TAB_GROUPS.slice(2)].map((rowGroups, ri) => (
          <div key={ri} className={`flex items-center gap-x-0.5 overflow-x-auto ${ri === 0 ? 'pt-2 pb-0.5' : 'pb-2'}`}>
            {rowGroups.map((group, gi) => (
              <div key={group.label} className="flex items-center shrink-0">
                {gi > 0 && <span className="w-px h-3.5 bg-surface-3 mx-2 shrink-0" />}
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-700 pr-1.5 shrink-0 select-none">
                  {group.label}
                </span>
                {group.tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTabAndHash(t.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                      tab === t.id
                        ? 'bg-accent/20 text-accent'
                        : 'text-zinc-500 hover:text-zinc-200 hover:bg-surface-2'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
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
        {tab === 'strength'  && <StrengthScores />}
      </main>
    </div>
  )
}
