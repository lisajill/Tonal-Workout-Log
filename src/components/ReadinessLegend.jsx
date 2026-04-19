const ENTRIES = [
  { icon: '💀', range: '0–25%',   label: 'Cooked' },
  { icon: '🥵', range: '26–50%',  label: 'Fatigued' },
  { icon: '🌤', range: '51–75%',  label: 'Recovering' },
  { icon: '🌿', range: '76–90%',  label: 'Ready' },
  { icon: '✨', range: '91–100%', label: 'Fresh' },
]

export default function ReadinessLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-5 pt-4 border-t border-surface-3">
      {ENTRIES.map(({ icon, range, label }) => (
        <span key={label} className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span>{icon}</span>
          <span className="text-zinc-600">{range}</span>
          <span>{label}</span>
        </span>
      ))}
    </div>
  )
}
