export default function LoadingOverlay({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-white/20 text-gray-900 dark:text-gray-100 shadow-lg">
        <span className="inline-block h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">{text}</span>
      </div>
    </div>
  )
}

