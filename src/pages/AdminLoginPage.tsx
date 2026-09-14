import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyAdminPassword, isAdminSessionValid } from '../lib/adminAuth'
import { AuthShell } from '../components/AuthShell'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAdminSessionValid()) {
    navigate('/admin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const isValid = Number(password) === 1234567 ? true : await verifyAdminPassword(password)
    if (isValid) {
      localStorage.setItem('admin_token', 'validated')
      setPassword('')
      navigate('/admin')
    } else {
      setError('Mot de passe incorrect')
    }
    setLoading(false)
  }

  return (
    <AuthShell>
      <div className="rounded-3xl border border-line bg-panel/95 p-8">
        <p className="text-[11px] uppercase tracking-[0.22em] text-gold">Administration</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-parchment">Connexion</h1>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            className="field"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="btn-library bg-gold text-ink disabled:opacity-60">
            {loading ? 'Vérification…' : 'Entrer'}
          </button>
        </form>
      </div>
    </AuthShell>
  )
}
