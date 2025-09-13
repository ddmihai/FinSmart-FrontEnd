export default function Progress({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0))
  return (
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
      <div className={`h-2 rounded-full ${pct >= 100 ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

