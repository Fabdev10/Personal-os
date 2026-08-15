import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline/index.js'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, username || undefined)
      navigate('/login')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <div className="auth-logo">
          <div className="sidebar-logo-icon" style={{ width: 44, height: 44, borderRadius: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Personal OS</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Create your account</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div>
            <label className="field-label" htmlFor="reg-email">Email</label>
            <div style={{ position: 'relative' }}>
              <EnvelopeIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input id="reg-email" type="email" className="text-input" style={{ paddingLeft: 38 }}
                placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="reg-username">Username <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
            <div style={{ position: 'relative' }}>
              <UserIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input id="reg-username" type="text" className="text-input" style={{ paddingLeft: 38 }}
                placeholder="fabio" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <LockClosedIcon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
              <input id="reg-password" type="password" className="text-input" style={{ paddingLeft: 38 }}
                placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
