import React, { useEffect, useState } from 'react'
import { get, post, put, del } from '../services/api'
import { PlusIcon, XMarkIcon, CheckIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline/index.js'

const CATEGORIES = ['PERSONAL', 'CAREER', 'FITNESS', 'STUDY', 'FINANCE', 'PROJECTS', 'OTHER']
const STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED']
const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: '#5a5a72', IN_PROGRESS: '#7c6ef9', COMPLETED: '#5bbf8a', PAUSED: '#f5a623', CANCELLED: '#f06b6b',
}
const CAT_EMOJI: Record<string, string> = {
  PERSONAL: '🌱', CAREER: '💼', FITNESS: '💪', STUDY: '📚', FINANCE: '💰', PROJECTS: '🚀', OTHER: '⭐',
}

interface Milestone { id: string; title: string; done: boolean; dueDate?: string }
interface Goal {
  id: string; title: string; description?: string; category: string; priority: number
  status: string; progress: number; deadline?: string; milestones: Milestone[]
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [selected, setSelected] = useState<Goal | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msInput, setMsInput] = useState('')
  const [form, setForm] = useState({ title: '', description: '', category: 'PERSONAL', priority: 3, status: 'NOT_STARTED', deadline: '' })

  async function load() {
    try { const res = await get('/api/goals'); setGoals(res.goals || []) } catch (e) { console.error(e) }
  }

  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    try {
      const res = await post('/api/goals', form)
      setGoals(prev => [res.goal, ...prev])
      setShowForm(false)
      setForm({ title: '', description: '', category: 'PERSONAL', priority: 3, status: 'NOT_STARTED', deadline: '' })
    } catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function changeStatus(goal: Goal, status: string) {
    try {
      const res = await put(`/api/goals/${goal.id}`, { status })
      setGoals(prev => prev.map(g => g.id === goal.id ? res.goal : g))
      if (selected?.id === goal.id) setSelected(res.goal)
    } catch (e: any) { alert(e.message) }
  }

  async function removeGoal(id: string) {
    if (!confirm('Delete this goal?')) return
    try { await del(`/api/goals/${id}`); setGoals(prev => prev.filter(g => g.id !== id)); setSelected(null) }
    catch (e: any) { alert(e.message) }
  }

  async function addMilestone() {
    if (!selected || !msInput.trim()) return
    try {
      const res = await post(`/api/goals/${selected.id}/milestones`, { title: msInput })
      const updated = { ...selected, milestones: [...selected.milestones, res.milestone] }
      setSelected(updated)
      setGoals(prev => prev.map(g => g.id === selected.id ? updated : g))
      setMsInput('')
    } catch (e: any) { alert(e.message) }
  }

  async function toggleMilestone(msId: string) {
    if (!selected) return
    try {
      await post(`/api/goals/${selected.id}/milestones/${msId}/toggle`, {})
      await load()
      const fresh = await get('/api/goals')
      const freshGoal = (fresh.goals as Goal[]).find(g => g.id === selected.id)
      if (freshGoal) setSelected(freshGoal)
    } catch (e: any) { alert(e.message) }
  }

  const grouped = CATEGORIES.map(cat => ({ cat, items: goals.filter(g => g.category === cat) })).filter(g => g.items.length > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="page-subtitle">{goals.length} obiettivi · {goals.filter(g => g.status === 'COMPLETED').length} completati</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-new-goal"><PlusIcon />New Goal</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, flex: 1, minHeight: 0 }}>
        {/* Left: goal list */}
        <div className="card" style={{ overflow: 'auto' }}>
          {showForm && (
            <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }} className="animate-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="text-input" placeholder="Goal title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <input className="text-input" placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <select className="text-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ cursor: 'pointer' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
                  </select>
                  <select className="text-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ cursor: 'pointer' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="field-label">Priority (1–5)</label>
                    <input type="number" min={1} max={5} className="text-input" value={form.priority} onChange={e => setForm({ ...form, priority: +e.target.value })} />
                  </div>
                  <div>
                    <label className="field-label">Deadline</label>
                    <input type="date" className="text-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ padding: '6px 12px', fontSize: 13 }}><XMarkIcon />Cancel</button>
                  <button className="btn btn-primary" onClick={save} disabled={saving || !form.title} style={{ padding: '6px 14px', fontSize: 13 }}><CheckIcon />{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </div>
            </div>
          )}

          {goals.length === 0 && !showForm ? (
            <div className="empty-state"><div className="empty-state-title">No goals yet</div><div className="empty-state-desc">Create your first goal to start tracking progress.</div></div>
          ) : (
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {grouped.map(({ cat, items }) => (
                <div key={cat}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    {CAT_EMOJI[cat]} {cat}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {items.map(goal => (
                      <div key={goal.id}
                        className={`entry-item${selected?.id === goal.id ? ' selected' : ''}`}
                        onClick={() => setSelected(goal)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{goal.title}</div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLORS[goal.status], background: `${STATUS_COLORS[goal.status]}22`, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                            {goal.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {goal.description && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{goal.description}</div>}
                        {/* Progress bar */}
                        <div style={{ marginTop: 8, height: 4, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${goal.progress}%`, background: STATUS_COLORS[goal.status], borderRadius: 4, transition: 'width 0.3s ease' }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{Math.round(goal.progress)}% · {goal.milestones.filter(m => m.done).length}/{goal.milestones.length} milestones</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: detail panel */}
        <div className="card" style={{ overflow: 'auto' }}>
          {selected ? (
            <>
              <div className="card-header">
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{selected.title}</div>
                  {selected.deadline && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Due {new Date(selected.deadline).toLocaleDateString('it-IT')}</div>}
                </div>
                <button className="icon-btn" onClick={() => removeGoal(selected.id)} style={{ color: 'var(--danger)' }} title="Delete"><TrashIcon /></button>
              </div>
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Status change */}
                <div>
                  <label className="field-label">Status</label>
                  <select className="text-input" value={selected.status}
                    onChange={e => changeStatus(selected, e.target.value)} style={{ cursor: 'pointer' }}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label className="field-label" style={{ margin: 0 }}>Progress</label>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{Math.round(selected.progress)}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${selected.progress}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <label className="field-label">Milestones</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                    {selected.milestones.map(ms => (
                      <div key={ms.id} onClick={() => toggleMilestone(ms.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 6, cursor: 'pointer', background: ms.done ? 'var(--accent-glow)' : 'var(--bg-elevated)', transition: 'all 0.15s' }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, border: ms.done ? 'none' : '2px solid var(--border)', background: ms.done ? 'var(--accent)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {ms.done && <CheckIcon style={{ width: 12, height: 12, color: '#fff' }} />}
                        </div>
                        <span style={{ fontSize: 13, color: ms.done ? 'var(--accent)' : 'var(--text-primary)', textDecoration: ms.done ? 'line-through' : 'none', opacity: ms.done ? 0.7 : 1 }}>
                          {ms.title}
                        </span>
                      </div>
                    ))}
                    {selected.milestones.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No milestones yet</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="text-input" placeholder="Add milestone…" value={msInput}
                      onChange={e => setMsInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addMilestone()}
                      style={{ flex: 1, padding: '7px 12px', fontSize: 13 }} />
                    <button className="btn btn-primary" onClick={addMilestone} style={{ padding: '7px 12px', fontSize: 13 }}><PlusIcon /></button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state"><div className="empty-state-title">Select a goal</div><div className="empty-state-desc">Click a goal to view details and manage milestones.</div></div>
          )}
        </div>
      </div>
    </div>
  )
}
