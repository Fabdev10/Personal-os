import React, { useEffect, useState } from 'react'
import { get, post, del } from '../services/api'
import { PlusIcon, XMarkIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline/index.js'

const WORKOUT_TYPES = ['Strength', 'Cardio', 'Yoga', 'HIIT', 'Cycling', 'Running', 'Swimming', 'Other']

interface WorkoutSet { reps: number; weight?: number; rpe?: number }
interface Exercise { name: string; sets: WorkoutSet[] }
interface Workout {
  id: string; date: string; type?: string; duration?: number; notes?: string
  exercises: { id: string; name: string; sets: { id: string; reps: number; weight?: number; rpe?: number; setOrder: number }[] }[]
}

const emptyForm = () => ({ date: new Date().toISOString().slice(0, 10), type: 'Strength', duration: 60, notes: '', exercises: [] as Exercise[] })

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [selected, setSelected] = useState<Workout | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm())

  useEffect(() => {
    get('/api/workouts').then(r => setWorkouts(r.workouts || [])).catch(console.error)
  }, [])

  function addExercise() {
    setForm(f => ({ ...f, exercises: [...f.exercises, { name: '', sets: [{ reps: 8, weight: 0, rpe: 7 }] }] }))
  }

  function updateExerciseName(i: number, name: string) {
    setForm(f => { const ex = [...f.exercises]; ex[i] = { ...ex[i], name }; return { ...f, exercises: ex } })
  }

  function addSet(i: number) {
    setForm(f => { const ex = [...f.exercises]; ex[i] = { ...ex[i], sets: [...ex[i].sets, { reps: 8, weight: 0, rpe: 7 }] }; return { ...f, exercises: ex } })
  }

  function updateSet(exI: number, setI: number, field: keyof WorkoutSet, val: number) {
    setForm(f => {
      const ex = [...f.exercises]
      const sets = [...ex[exI].sets]
      sets[setI] = { ...sets[setI], [field]: val }
      ex[exI] = { ...ex[exI], sets }
      return { ...f, exercises: ex }
    })
  }

  function removeExercise(i: number) {
    setForm(f => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await post('/api/workouts', form)
      setWorkouts(prev => [res.workout, ...prev])
      setShowForm(false)
      setForm(emptyForm())
    } catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function remove(id: string) {
    if (!confirm('Delete workout?')) return
    try { await del(`/api/workouts/${id}`); setWorkouts(prev => prev.filter(w => w.id !== id)); setSelected(null) }
    catch (e: any) { alert(e.message) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workouts</h1>
          <p className="page-subtitle">{workouts.length} sessioni registrate</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-new-workout"><PlusIcon />Log Workout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, flex: 1, minHeight: 0 }}>
        {/* List */}
        <div className="card" style={{ overflow: 'auto' }}>
          <div className="card-header"><span className="card-title">Sessions</span>{workouts.length > 0 && <span className="badge">{workouts.length}</span>}</div>
          <div className="entries-list">
            {workouts.length === 0 ? (
              <div className="empty-state" style={{ minHeight: 180 }}>
                <div className="empty-state-title">No workouts yet</div>
                <div className="empty-state-desc">Log your first workout session.</div>
              </div>
            ) : workouts.map(w => (
              <div key={w.id} className={`entry-item${selected?.id === w.id ? ' selected' : ''}`} onClick={() => { setSelected(w); setShowForm(false) }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{w.type || 'Workout'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date(w.date).toLocaleDateString('it-IT', { weekday: 'short', day: '2-digit', month: 'short' })}
                  {w.duration ? ` · ${w.duration} min` : ''}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail / Form */}
        <div className="card" style={{ overflow: 'auto' }}>
          {showForm ? (
            <>
              <div className="card-header">
                <span className="card-title">New Workout</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" onClick={() => { setShowForm(false); setForm(emptyForm()) }} style={{ padding: '6px 12px', fontSize: 13 }}><XMarkIcon />Cancel</button>
                  <button className="btn btn-primary" onClick={save} disabled={saving} style={{ padding: '6px 14px', fontSize: 13 }}><CheckIcon />{saving ? 'Saving…' : 'Save'}</button>
                </div>
              </div>
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="field-label">Date</label>
                    <input type="date" className="text-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="field-label">Type</label>
                    <select className="text-input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ cursor: 'pointer' }}>
                      {WORKOUT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Duration (min)</label>
                    <input type="number" className="text-input" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} min={1} />
                  </div>
                </div>
                <div>
                  <label className="field-label">Notes</label>
                  <input className="text-input" placeholder="Optional notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                </div>

                {/* Exercises */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <label className="field-label" style={{ margin: 0 }}>Exercises</label>
                    <button className="btn btn-ghost" onClick={addExercise} style={{ padding: '4px 10px', fontSize: 12 }}><PlusIcon />Add exercise</button>
                  </div>
                  {form.exercises.map((ex, i) => (
                    <div key={i} style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: 14, marginBottom: 10, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                        <input className="text-input" placeholder="Exercise name" value={ex.name} onChange={e => updateExerciseName(i, e.target.value)} style={{ flex: 1, padding: '7px 12px', fontSize: 13 }} />
                        <button className="icon-btn" onClick={() => removeExercise(i)} style={{ color: 'var(--danger)' }}><TrashIcon /></button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>#</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reps</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Weight (kg)</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>RPE</span>
                      </div>
                      {ex.sets.map((s, si) => (
                        <div key={si} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', minWidth: 20 }}>{si + 1}</span>
                          <input type="number" className="text-input" value={s.reps} min={1} onChange={e => updateSet(i, si, 'reps', +e.target.value)} style={{ padding: '6px 10px', fontSize: 13 }} />
                          <input type="number" className="text-input" value={s.weight ?? ''} min={0} step={0.5} onChange={e => updateSet(i, si, 'weight', +e.target.value)} style={{ padding: '6px 10px', fontSize: 13 }} />
                          <input type="number" className="text-input" value={s.rpe ?? ''} min={1} max={10} onChange={e => updateSet(i, si, 'rpe', +e.target.value)} style={{ padding: '6px 10px', fontSize: 13 }} />
                        </div>
                      ))}
                      <button onClick={() => addSet(i)} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4 }}>+ Add set</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : selected ? (
            <>
              <div className="card-header">
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{selected.type || 'Workout'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {new Date(selected.date).toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                    {selected.duration ? ` · ${selected.duration} min` : ''}
                  </div>
                </div>
                <button className="icon-btn" onClick={() => remove(selected.id)} style={{ color: 'var(--danger)' }} title="Delete"><TrashIcon /></button>
              </div>
              <div style={{ padding: '20px 24px' }}>
                {selected.notes && <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>{selected.notes}</p>}
                {selected.exercises.map(ex => (
                  <div key={ex.id} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{ex.name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: 8 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>#</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reps</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>kg</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>RPE</span>
                      {ex.sets.map((s, i) => (
                        <React.Fragment key={s.id}>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{i + 1}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{s.reps}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.weight ?? '—'}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.rpe ?? '—'}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><div className="empty-state-title">Select a workout</div><div className="empty-state-desc">Pick a session or log a new one.</div></div>
          )}
        </div>
      </div>
    </div>
  )
}
