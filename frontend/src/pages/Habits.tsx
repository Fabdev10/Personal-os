import React, { useEffect, useState } from 'react'
import { get, post, del } from '../services/api'
import { PlusIcon, XMarkIcon, CheckIcon, TrashIcon, FireIcon } from '@heroicons/react/24/outline/index.js'

interface HabitCompletion { id: string; date: string; done: boolean }
interface Habit { id: string; name: string; frequency: string; color: string; completions: HabitCompletion[] }

const PRESET_COLORS = [
  '#7c6ef9', '#6366f1', '#3b82f6', '#06b6d4',
  '#14b8a6', '#10b981', '#84cc16', '#f59e0b',
  '#f97316', '#ef4444', '#f43f5e', '#d946ef',
  '#a855f7', '#ec4899'
]

function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function isDone(habit: Habit, dateStr: string): boolean {
  return habit.completions.some(c => c.date.slice(0, 10) === dateStr)
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', frequency: 'daily', color: '#7c6ef9' })
  const last7 = getLast7Days()
  const today = new Date().toISOString().slice(0, 10)

  async function load() {
    try { const r = await get('/api/habits'); setHabits(r.habits || []) } catch (e) { console.error(e) }
  }

  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    try {
      const res = await post('/api/habits', form)
      setHabits(prev => [...prev, res.habit])
      setShowForm(false)
      setForm({ name: '', frequency: 'daily', color: '#7c6ef9' })
    } catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function toggle(habitId: string, date: string) {
    try {
      await post(`/api/habits/${habitId}/toggle`, { date })
      setHabits(prev => prev.map(h => {
        if (h.id !== habitId) return h
        const alreadyDone = isDone(h, date)
        const completions = alreadyDone
          ? h.completions.filter(c => c.date.slice(0, 10) !== date)
          : [...h.completions, { id: `tmp-${date}`, date, done: true }]
        return { ...h, completions }
      }))
    } catch (e: any) { console.error(e) }
  }

  async function remove(id: string) {
    if (!confirm('Delete habit and all completions?')) return
    try { await del(`/api/habits/${id}`); setHabits(prev => prev.filter(h => h.id !== id)) }
    catch (e: any) { alert(e.message) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Habits</h1>
          <p className="page-subtitle">{habits.length} habit tracked · ultimi 7 giorni</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-new-habit"><PlusIcon />New Habit</button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card animate-in">
          <div className="card-header">
            <span className="card-title">New Habit</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ padding: '6px 12px', fontSize: 13 }}><XMarkIcon />Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving || !form.name} style={{ padding: '6px 14px', fontSize: 13 }}><CheckIcon />{saving ? 'Saving…' : 'Create'}</button>
            </div>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <label className="field-label">Habit name</label>
              <input className="text-input" placeholder="e.g. Read 30 minutes" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            </div>
            <div>
              <label className="field-label">Frequency</label>
              <select className="text-input" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} style={{ cursor: 'pointer' }}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="field-label">Color</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', maxWidth: 280 }}>
                {PRESET_COLORS.map(c => (
                  <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                    style={{
                      width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer',
                      outline: form.color === c ? '2px solid var(--text-primary)' : 'none',
                      outlineOffset: 2, transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    title={c}
                  />
                ))}
                <label
                  title="Custom color"
                  style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, red, yellow, green, cyan, blue, magenta, red)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    outline: !PRESET_COLORS.includes(form.color) ? '2px solid var(--text-primary)' : 'none',
                    outlineOffset: 2, transition: 'transform 0.15s ease', position: 'relative'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <input
                    type="color"
                    value={form.color}
                    onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Habit grid */}
      <div className="card" style={{ overflow: 'auto' }}>
        {habits.length === 0 ? (
          <div className="empty-state"><div className="empty-state-title">No habits yet</div><div className="empty-state-desc">Add your first habit to start tracking.</div></div>
        ) : (
          <div style={{ padding: 20 }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '200px repeat(7, 1fr) 40px', gap: 8, marginBottom: 12, alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Habit</div>
              {last7.map(d => {
                const dt = new Date(d)
                const isToday = d === today
                return (
                  <div key={d} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {dt.toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--accent)' : 'var(--text-secondary)' }}>
                      {dt.getDate()}
                    </div>
                  </div>
                )
              })}
              <div />
            </div>

            {/* Habit rows */}
            {habits.map(habit => (
              <div key={habit.id} style={{ display: 'grid', gridTemplateColumns: '200px repeat(7, 1fr) 40px', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: habit.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{habit.name}</span>
                </div>
                {last7.map(d => {
                  const done = isDone(habit, d)
                  return (
                    <div key={d} style={{ display: 'flex', justifyContent: 'center' }}>
                      <div onClick={() => toggle(habit.id, d)}
                        style={{
                          width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                          background: done ? habit.color : 'var(--bg-elevated)',
                          border: done ? 'none' : '2px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s ease',
                          boxShadow: done ? `0 2px 8px ${habit.color}44` : 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                        {done && <CheckIcon style={{ width: 16, height: 16, color: '#fff', strokeWidth: 3 }} />}
                      </div>
                    </div>
                  )
                })}
                <button className="icon-btn" onClick={() => remove(habit.id)} style={{ color: 'var(--danger)', width: 32, height: 32 }} title="Delete">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
