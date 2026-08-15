import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  PlusIcon, BookOpenIcon, XMarkIcon, CheckIcon, TrashIcon, PencilIcon,
} from '@heroicons/react/24/outline/index.js'
import { get, post, put, del } from '../services/api'

interface Entry {
  id: string; title: string; content: string; date: string; mood: string; energy: number
}

const MOODS = [
  { value: 'EXCELLENT', emoji: '🤩', label: 'Excellent' },
  { value: 'GOOD',      emoji: '😊', label: 'Good' },
  { value: 'NEUTRAL',   emoji: '😐', label: 'Neutral' },
  { value: 'BAD',       emoji: '😔', label: 'Bad' },
  { value: 'TERRIBLE',  emoji: '😣', label: 'Terrible' },
]

type Mode = 'view' | 'new' | 'edit'

const emptyForm = () => ({ title: '', content: '', mood: 'GOOD', energy: 3 })

export default function Diary() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [selected, setSelected] = useState<Entry | null>(null)
  const [mode, setMode] = useState<Mode>('view')
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const res = await get('/api/diary')
      const list: Entry[] = res.entries || []
      setEntries(list)
      if (list.length > 0 && !selected) setSelected(list[0])
    } catch (e) { console.error(e) }
  }

  useEffect(() => { load() }, [])

  function openNew() { setMode('new'); setForm(emptyForm()); setSelected(null) }
  function cancelForm() { setMode('view'); if (entries.length > 0 && !selected) setSelected(entries[0]) }
  function openEdit(e: Entry) { setMode('edit'); setForm({ title: e.title, content: e.content, mood: e.mood, energy: e.energy }); setSelected(e) }

  async function save() {
    setSaving(true)
    try {
      if (mode === 'new') {
        const res = await post('/api/diary', form)
        const entry = res.entry
        setEntries(prev => [entry, ...prev])
        setSelected(entry)
      } else if (mode === 'edit' && selected) {
        const res = await put(`/api/diary/${selected.id}`, form)
        const entry = res.entry
        setEntries(prev => prev.map(e => e.id === entry.id ? entry : e))
        setSelected(entry)
      }
      setMode('view')
      setForm(emptyForm())
    } catch (e: any) { alert(e.message) } finally { setSaving(false) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this entry?')) return
    try {
      await del(`/api/diary/${id}`)
      const next = entries.filter(e => e.id !== id)
      setEntries(next)
      setSelected(next[0] ?? null)
      setMode('view')
    } catch (e: any) { alert(e.message) }
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  const moodOf = (m: string) => MOODS.find(x => x.value === m)

  const isForm = mode === 'new' || mode === 'edit'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Diary</h1>
          <p className="page-subtitle">{entries.length} {entries.length === 1 ? 'entry' : 'entries'} · pensieri, riflessioni, idee</p>
        </div>
        <button className="btn btn-primary" onClick={openNew} id="btn-new-entry"><PlusIcon />New Entry</button>
      </div>

      <div className="diary-layout" style={{ flex: 1, minHeight: 0 }}>
        {/* ── Left: entry list ── */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="card-header">
            <span className="card-title">Entries</span>
            {entries.length > 0 && <span className="badge">{entries.length}</span>}
          </div>
          <div className="entries-list" style={{ flex: 1, overflowY: 'auto' }}>
            {isForm && mode === 'new' && (
              <div className="entry-item selected animate-in">
                <div className="entry-item-title" style={{ color: 'var(--accent)' }}>{form.title || 'New Entry…'}</div>
                <div className="entry-item-date">Just now</div>
              </div>
            )}
            {entries.length === 0 && mode !== 'new' ? (
              <div className="empty-state">
                <BookOpenIcon />
                <div className="empty-state-title">No entries yet</div>
                <div className="empty-state-desc">Click "New Entry" to write your first entry.</div>
              </div>
            ) : entries.map(e => (
              <div key={e.id}
                className={`entry-item${selected?.id === e.id && !isForm ? ' selected' : isForm && mode === 'edit' && selected?.id === e.id ? ' selected' : ''} animate-in`}
                onClick={() => { setSelected(e); if (mode !== 'edit' || selected?.id !== e.id) setMode('view') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="entry-item-title">{e.title || 'Untitled'}</div>
                  <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{moodOf(e.mood)?.emoji || '😐'}</span>
                </div>
                <div className="entry-item-date">{fmt(e.date)} · {fmtTime(e.date)}</div>
                <div className="entry-item-preview">{e.content || '—'}</div>
                <div style={{ marginTop: 5, display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i <= e.energy ? 'var(--accent)' : 'var(--border)' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: editor or viewer ── */}
        {isForm ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="card-header">
              <span className="card-title">{mode === 'new' ? 'New Entry' : 'Edit Entry'}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" onClick={cancelForm} id="btn-cancel" style={{ padding: '6px 12px', fontSize: 13 }}><XMarkIcon />Discard</button>
                <button className="btn btn-primary" onClick={save} disabled={saving} id="btn-save" style={{ padding: '6px 14px', fontSize: 13 }}>
                  <CheckIcon />{saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
            <div style={{ padding: '20px 24px', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="field-label" htmlFor="entry-title">Title</label>
                <input id="entry-title" className="text-input" placeholder="Give this entry a title…"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>

              {/* Mood picker */}
              <div>
                <label className="field-label">Mood</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {MOODS.map(m => (
                    <button key={m.value} onClick={() => setForm(f => ({ ...f, mood: m.value }))}
                      title={m.label}
                      style={{
                        fontSize: 24, lineHeight: 1, padding: '6px 10px', borderRadius: 8, border: '2px solid',
                        borderColor: form.mood === m.value ? 'var(--accent)' : 'transparent',
                        background: form.mood === m.value ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        transform: form.mood === m.value ? 'scale(1.15)' : 'scale(1)',
                      }}>
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy slider */}
              <div>
                <label className="field-label">
                  Energy level: <strong style={{ color: 'var(--accent)' }}>{form.energy}/5</strong>
                </label>
                <input type="range" min={1} max={5} value={form.energy}
                  onChange={e => setForm(f => ({ ...f, energy: +e.target.value }))}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }} />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className="field-label" htmlFor="entry-content">Content · Markdown supported</label>
                <textarea id="entry-content" className="text-input"
                  placeholder="Write your thoughts here… Markdown is supported."
                  value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  style={{ flex: 1, resize: 'none', minHeight: '200px' }} />
              </div>
            </div>
          </div>
        ) : selected ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{moodOf(selected.mood)?.emoji || '😐'}</span>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{selected.title || 'Untitled'}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {fmt(selected.date)} at {fmtTime(selected.date)}
                  {' · '}Energy: {selected.energy}/5
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="icon-btn" onClick={() => openEdit(selected)} title="Edit"><PencilIcon /></button>
                <button className="icon-btn" onClick={() => remove(selected.id)} style={{ color: 'var(--danger)' }} title="Delete"><TrashIcon /></button>
              </div>
            </div>
            <div className="markdown-preview" style={{ flex: 1, overflowY: 'auto' }}>
              <ReactMarkdown>{selected.content || '*No content.*'}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <BookOpenIcon />
              <div className="empty-state-title">Select an entry</div>
              <div className="empty-state-desc">Pick an entry from the list or create a new one.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
