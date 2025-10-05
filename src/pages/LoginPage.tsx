import React, { useState } from 'react'
import { useAuth } from '@/lib/AuthProvide'
import { useLocation, useNavigate, type Location } from 'react-router-dom'

type FromState = { from?: Location } | null

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as Location & { state: FromState }
  const from = location.state?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen grid place-items-center bg-muted/20 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow p-6">
        <h1 className="text-xl font-semibold mb-2">Entrar en StockFlow</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Usa el usuario general de la tienda.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm block mb-2">Email</label>
            <input
              type="email"
              className="w-full rounded-md border px-3 py-2"
              placeholder="asicslasrozas@tienda.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div>
            <label className="text-sm block mb-2">Contraseña</label>
            <input
              type="password"
              className="w-full rounded-md border px-3 py-2"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black text-white py-2 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-xs text-muted-foreground">
          La sesión queda guardada hasta que cierres sesión o borres datos.
        </div>
      </div>
    </div>
  )
}
