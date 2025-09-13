import { useEffect, useState } from 'react'
import api, { apiBaseUrl, getDiagnostics } from '../lib/api'

export default function Diagnostics() {
  const [server, setServer] = useState<any>(null)
  const [client, setClient] = useState<any>({
    apiBaseUrl,
    location: typeof window !== 'undefined' ? window.location.href : ''
  })
  const [test, setTest] = useState<{ endpoint: string; status?: number; ok?: boolean; error?: string; body?: any } | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const d = await getDiagnostics()
        setServer(d)
      } catch (e: any) {
        setServer({ error: e?.message || 'Failed to fetch diagnostics' })
      }
    })()
  }, [])

  const runProtectedTest = async () => {
    setTest({ endpoint: '/api/accounts' })
    try {
      const r = await api.get('/api/accounts')
      setTest({ endpoint: '/api/accounts', status: r.status, ok: true, body: r.data })
    } catch (e: any) {
      setTest({ endpoint: '/api/accounts', status: e?.response?.status, ok: false, error: e?.response?.data?.error || e?.message })
    }
  }

  const copy = async (obj: any) => {
    try { await navigator.clipboard.writeText(JSON.stringify(obj, null, 2)); alert('Copied'); } catch {}
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Diagnostics</h1>

      <div className="card p-4">
        <h2 className="font-semibold mb-2">Client</h2>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(client, null, 2)}</pre>
        <button className="btn mt-2" onClick={() => copy(client)}>Copy</button>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-2">Server (/api/diagnostics)</h2>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(server, null, 2)}</pre>
        <div className="mt-2 flex gap-2">
          <button className="btn" onClick={async ()=>{ try { const d = await getDiagnostics(); setServer(d) } catch (e: any) { setServer({ error: e?.message }) } }}>Refresh</button>
          <button className="btn" onClick={() => copy(server)}>Copy</button>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-2">Protected Request Test</h2>
        <p className="text-sm opacity-80">Checks Authorization header + CSRF working against /api/accounts.</p>
        <div className="mt-2 flex gap-2">
          <button className="btn" onClick={runProtectedTest}>Run test</button>
          {test && <button className="btn" onClick={() => copy(test)}>Copy result</button>}
        </div>
        {test && (
          <div className="mt-2">
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(test, null, 2)}</pre>
            {!test.ok && <div className="text-sm text-red-600">If status is 401: ensure you are logged in and that refresh succeeded on reload. Check /api/diagnostics for hasRefreshToken=true and access token presence.</div>}
          </div>
        )}
      </div>
    </div>
  )
}

