import React, { useEffect, useState } from 'react'
import { get, post, del } from '../services/api'
import { PlusIcon, XMarkIcon, CheckIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline/index.js'

interface StudySession {
  id: string; date: string; duration: number; subject: string; topic?: string; notes?: string; difficulty?: number
}

const DIFFICULTY_LABELS = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard']
const DIFFICULTY_COLORS = ['', '#5bbf8a', '#a0e1a0', '#f5a623', '#f06b6b', '#c0392b']

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10), duration: 60, subject: '', topic: '', notes: '', difficulty: 3,
})

export default function Study() {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    get('/api/study').then(r => setSessions(r.sessions || [])).catch(console.error)
  }, [])

  async function save() {
    setSaving(true)
    try {
      const res = await post('/api/study', form)
      setSessions(prev => [res.session, ...prev])
      setShowForm(false)
      setForm(emptyForm())
    } catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function remove(id: string) {
    if (!confirm('Delete session?')) return
    try { await del(`/api/study/${id}`); setSessions(prev => prev.filter(s => s.id !== id)) }
    catch (e: any) { alert(e.message) }
  }

  const totalHours = (sessions.reduce((s, se) => s + se.duration, 0) / 60).toFixed(1)
  const subjects = [...new Set(sessions.map(s => s.subject))].filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Study</h1>
          <p className="page-subtitle">{sessions.length} sessioni · {totalHours}h totali</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-new-study"><PlusIcon />Log Session</button>
      </div>

      {/* Stats row */}
      {sessions.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {subjects.map(sub => {
            const count = sessions.filter(s => s.subject === sub).length
            const mins = sessions.filter(s => s.subject === sub).reduce((a, b) => a + b.duration, 0)
            return (
              <div key={sub} style={{ padding: '8px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{count} sessions · {(mins / 60).toFixed(1)}h</span>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {/* New form */}
        {showForm && (
          <div className="card animate-in">
            <div className="card-header">
              <span className="card-title">New Study Session</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => { setShowForm(false); setForm(emptyForm()) }} style={{ padding: '6px 12px', fontSize: 13 }}><XMarkIcon />Cancel</button>
                <button className="btn btn-primary" onClick={save} disabled={saving || !form.subject} style={{ padding: '6px 14px', fontSize: 13 }}><CheckIcon />{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
            <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div>
                <label className="field-label">Date</label>
                <input type="date" className="text-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Subject</label>
                <input className="text-input" placeholder="e.g. Mathematics" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} list="subjects-list" />
                <datalist id="subjects-list">{subjects.map(s => <option key={s} value={s} />)}</datalist>
              </div>
              <div>
                <label className="field-label">Duration (min)</label>
                <input type="number" className="text-input" value={form.duration} min={1} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Topic</label>
                <input className="text-input" placeholder="Specific topic…" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} />
              </div>
              <div>
                <label className="field-label">Difficulty: <strong style={{ color: DIFFICULTY_COLORS[form.difficulty] }}>{DIFFICULTY_LABELS[form.difficulty]}</strong></label>
                <input type="range" min={1} max={5} value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: +e.target.value }))}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
              </div>
              <div>
                <label className="field-label">Notes</label>
                <input className="text-input" placeholder="Optional notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          </div>
        )}

        {/* Sessions list */}
        <div className="card" style={{ flex: 1, overflow: 'auto' }}>
          <div className="card-header"><span className="card-title">Sessions</span>{sessions.length > 0 && <span className="badge">{sessions.length}</span>}</div>
          {sessions.length === 0 ? (
            <div className="empty-state"><div className="empty-state-title">No sessions yet</div><div className="empty-state-desc">Log your first study session.</div></div>
          ) : (
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sessions.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 50 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{Math.round(s.duration / 60 * 10) / 10}h</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.duration}min</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.subject}</span>
                      {s.topic && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {s.topic}</span>}
                      {s.difficulty && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: DIFFICULTY_COLORS[s.difficulty], background: `${DIFFICULTY_COLORS[s.difficulty]}22`, padding: '1px 8px', borderRadius: 999 }}>
                          {DIFFICULTY_LABELS[s.difficulty]}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(s.date).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    {s.notes && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{s.notes}</div>}
                  </div>
                  <button className="icon-btn" onClick={() => remove(s.id)} style={{ color: 'var(--danger)', flexShrink: 0 }} title="Delete"><TrashIcon /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
