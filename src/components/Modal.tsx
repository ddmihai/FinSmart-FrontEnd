import React from 'react'

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="card p-4 w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-sm underline">Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}

