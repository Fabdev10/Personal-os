import React, { useEffect, useState } from 'react'
import { get, post, put, del } from '../services/api'
import {
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  TrashIcon,
  PencilIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TagIcon,
} from '@heroicons/react/24/outline/index.js'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end?: string | null
  allDay: boolean
  type?: string | null
  color?: string | null
  notes?: string | null
}

const EVENT_TYPES = [
  { key: 'PERSONAL', label: 'Personale', defaultColor: '#7c6ef9' },
  { key: 'WORK', label: 'Lavoro', defaultColor: '#3b82f6' },
  { key: 'STUDY', label: 'Studio', defaultColor: '#10b981' },
  { key: 'HEALTH', label: 'Salute & Fit', defaultColor: '#ef4444' },
  { key: 'DEADLINE', label: 'Scadenza', defaultColor: '#f59e0b' },
]

const PRESET_COLORS = [
  '#7c6ef9', '#3b82f6', '#10b981', '#ef4444',
  '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6'
]

export default function Agenda() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  const [form, setForm] = useState({
    title: '',
    startDate: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endDate: new Date().toISOString().slice(0, 10),
    endTime: '10:00',
    allDay: false,
    type: 'PERSONAL',
    color: '#7c6ef9',
    notes: '',
  })

  async function loadEvents() {
    try {
      setLoading(true)
      const res = await get('/api/agenda')
      setEvents(res.events || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  function resetForm() {
    setForm({
      title: '',
      startDate: new Date().toISOString().slice(0, 10),
      startTime: '09:00',
      endDate: new Date().toISOString().slice(0, 10),
      endTime: '10:00',
      allDay: false,
      type: 'PERSONAL',
      color: '#7c6ef9',
      notes: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  function openEdit(ev: CalendarEvent) {
    const startDateObj = new Date(ev.start)
    const endDateObj = ev.end ? new Date(ev.end) : startDateObj

    setForm({
      title: ev.title,
      startDate: startDateObj.toISOString().slice(0, 10),
      startTime: startDateObj.toTimeString().slice(0, 5),
      endDate: endDateObj.toISOString().slice(0, 10),
      endTime: endDateObj.toTimeString().slice(0, 5),
      allDay: ev.allDay,
      type: ev.type || 'PERSONAL',
      color: ev.color || '#7c6ef9',
      notes: ev.notes || '',
    })
    setEditingId(ev.id)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title.trim()) return alert('Inserisci un titolo per l\'impegno')
    setSaving(true)

    try {
      const startDateTime = form.allDay
        ? new Date(`${form.startDate}T00:00:00`)
        : new Date(`${form.startDate}T${form.startTime}:00`)

      const endDateTime = form.allDay
        ? new Date(`${form.endDate}T23:59:59`)
        : new Date(`${form.endDate}T${form.endTime}:00`)

      const payload = {
        title: form.title,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        allDay: form.allDay,
        type: form.type,
        color: form.color,
        notes: form.notes,
      }

      if (editingId) {
        await put(`/api/agenda/${editingId}`, payload)
      } else {
        await post('/api/agenda', payload)
      }

      resetForm()
      loadEvents()
    } catch (err: any) {
      alert(err.message || 'Errore durante il salvataggio')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminare questo impegno?')) return
    try {
      await del(`/api/agenda/${id}`)
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Filter events by selected type
  const filteredEvents = events.filter(e => {
    if (selectedType !== 'ALL' && e.type !== selectedType) return false
    return true
  })

  // Group events by date category
  const todayStr = new Date().toISOString().slice(0, 10)
  const tomorrowObj = new Date()
  tomorrowObj.setDate(tomorrowObj.getDate() + 1)
  const tomorrowStr = tomorrowObj.toISOString().slice(0, 10)

  const todayEvents: CalendarEvent[] = []
  const tomorrowEvents: CalendarEvent[] = []
  const upcomingEvents: CalendarEvent[] = []
  const pastEvents: CalendarEvent[] = []

  filteredEvents.forEach(ev => {
    const evDateStr = new Date(ev.start).toISOString().slice(0, 10)
    if (evDateStr === todayStr) {
      todayEvents.push(ev)
    } else if (evDateStr === tomorrowStr) {
      tomorrowEvents.push(ev)
    } else if (evDateStr > todayStr) {
      upcomingEvents.push(ev)
    } else {
      pastEvents.push(ev)
    }
  })

  // Month navigation helpers
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7 // Monday start

  const eventDatesSet = new Set(
    events.map(e => new Date(e.start).toISOString().slice(0, 10))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda & Impegni</h1>
          <p className="page-subtitle">Organizza appuntamenti, scadenze ed impegni personali</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { resetForm(); setShowForm(true) }}
          id="btn-new-event"
        >
          <PlusIcon /> Nuovo Impegno
        </button>
      </div>

      {/* Category Filter & View Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            className={`btn ${selectedType === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '6px 12px', fontSize: 13 }}
            onClick={() => setSelectedType('ALL')}
          >
            Tutti ({events.length})
          </button>
          {EVENT_TYPES.map(t => {
            const count = events.filter(e => e.type === t.key).length
            return (
              <button
                key={t.key}
                className={`btn ${selectedType === t.key ? 'btn-primary' : 'btn-ghost'}`}
                style={{ padding: '6px 12px', fontSize: 13 }}
                onClick={() => setSelectedType(t.key)}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.defaultColor, display: 'inline-block' }} />
                {t.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Create / Edit Form Card */}
      {showForm && (
        <div className="card animate-in">
          <div className="card-header">
            <span className="card-title">{editingId ? 'Modifica Impegno' : 'Nuovo Impegno'}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost" onClick={resetForm} style={{ padding: '6px 12px', fontSize: 13 }}>
                <XMarkIcon /> Annulla
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '6px 14px', fontSize: 13 }}>
                <CheckIcon /> {saving ? 'Salvataggio…' : 'Salva'}
              </button>
            </div>
          </div>

          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Title */}
            <div>
              <label className="field-label">Titolo Impegno *</label>
              <input
                className="text-input"
                placeholder="es. Riunione di progetto, Visita medica, Consegna report"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                autoFocus
              />
            </div>

            {/* Date & Time Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              <div>
                <label className="field-label">Data Inizio</label>
                <input
                  type="date"
                  className="text-input"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value, endDate: e.target.value }))}
                />
              </div>

              {!form.allDay && (
                <div>
                  <label className="field-label">Ora Inizio</label>
                  <input
                    type="time"
                    className="text-input"
                    value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  />
                </div>
              )}

              {!form.allDay && (
                <div>
                  <label className="field-label">Ora Fine</label>
                  <input
                    type="time"
                    className="text-input"
                    value={form.endTime}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', marginTop: 22 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={form.allDay}
                    onChange={e => setForm(f => ({ ...f, allDay: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  Tutto il giorno
                </label>
              </div>
            </div>

            {/* Category & Color */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="field-label">Categoria</label>
                <select
                  className="text-input"
                  value={form.type}
                  onChange={e => {
                    const selected = EVENT_TYPES.find(t => t.key === e.target.value)
                    setForm(f => ({
                      ...f,
                      type: e.target.value,
                      color: selected ? selected.defaultColor : f.color,
                    }))
                  }}
                >
                  {EVENT_TYPES.map(t => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Colore Etichetta</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                  {PRESET_COLORS.map(c => (
                    <div
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{
                        width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer',
                        outline: form.color === c ? '2px solid var(--text-primary)' : 'none',
                        outlineOffset: 2, transition: 'transform 0.1s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="field-label">Note / Dettagli opzionali</label>
              <textarea
                className="text-input"
                rows={2}
                placeholder="Aggiungi indicazioni, link o dettagli..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                style={{ minHeight: 70 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout: Grid with Calendar & Events */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 }}>
        {/* Mini Calendar Side Card */}
        <div className="card" style={{ height: 'fit-content', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentMonth.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className="icon-btn"
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                style={{ width: 28, height: 28 }}
              >
                <ChevronLeftIcon style={{ width: 14, height: 14 }} />
              </button>
              <button
                className="icon-btn"
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                style={{ width: 28, height: 28 }}
              >
                <ChevronRightIcon style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
            {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
              <div key={d} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', paddingBottom: 4 }}>
                {d}
              </div>
            ))}

            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
              const isToday = dateStr === todayStr
              const hasEvents = eventDatesSet.has(dateStr)

              return (
                <div
                  key={dayNum}
                  style={{
                    height: 32, borderRadius: 8, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', fontSize: 12,
                    cursor: 'default',
                    background: isToday ? 'var(--accent-glow)' : 'transparent',
                    color: isToday ? 'var(--accent)' : 'var(--text-primary)',
                    fontWeight: isToday ? 700 : 400,
                    position: 'relative'
                  }}
                >
                  <span>{dayNum}</span>
                  {hasEvents && (
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', marginTop: 1 }} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Events List Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div className="empty-state"><div className="empty-state-title">Caricamento agenda…</div></div>
          ) : filteredEvents.length === 0 ? (
            <div className="card empty-state">
              <CalendarDaysIcon />
              <div className="empty-state-title">Nessun impegno in programma</div>
              <div className="empty-state-desc">Clicca su "Nuovo Impegno" per aggiungere i tuoi appuntamenti o scadenze.</div>
            </div>
          ) : (
            <>
              {/* Today Section */}
              {todayEvents.length > 0 && (
                <EventGroupSection title="Oggi" badgeColor="var(--accent)" events={todayEvents} onEdit={openEdit} onDelete={handleDelete} />
              )}

              {/* Tomorrow Section */}
              {tomorrowEvents.length > 0 && (
                <EventGroupSection title="Domani" badgeColor="#3b82f6" events={tomorrowEvents} onEdit={openEdit} onDelete={handleDelete} />
              )}

              {/* Upcoming Section */}
              {upcomingEvents.length > 0 && (
                <EventGroupSection title="Prossimi Impegni" badgeColor="#10b981" events={upcomingEvents} onEdit={openEdit} onDelete={handleDelete} />
              )}

              {/* Past Section */}
              {pastEvents.length > 0 && (
                <EventGroupSection title="Completati / Passati" badgeColor="var(--text-muted)" events={pastEvents} onEdit={openEdit} onDelete={handleDelete} isPast />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function EventGroupSection({
  title, badgeColor, events, onEdit, onDelete, isPast
}: {
  title: string
  badgeColor: string
  events: CalendarEvent[]
  onEdit: (ev: CalendarEvent) => void
  onDelete: (id: string) => void
  isPast?: boolean
}) {
  return (
    <div className="card" style={{ opacity: isPast ? 0.75 : 1 }}>
      <div className="card-header" style={{ padding: '12px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: badgeColor }} />
          <span className="card-title" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
          <span className="badge" style={{ fontSize: 10 }}>{events.length}</span>
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {events.map(ev => {
          const startDate = new Date(ev.start)
          const typeInfo = EVENT_TYPES.find(t => t.key === ev.type)
          const timeLabel = ev.allDay
            ? 'Tutto il giorno'
            : startDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) +
              (ev.end ? ` - ${new Date(ev.end).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}` : '')

          const dateLabel = startDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })

          return (
            <div
              key={ev.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 10, background: 'var(--bg-elevated)',
                borderLeft: `4px solid ${ev.color || 'var(--accent)'}`, gap: 12,
                transition: 'transform 0.1s ease',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.title}</span>
                  {typeInfo && (
                    <span className="badge" style={{ fontSize: 10, background: `${ev.color || 'var(--accent)'}22`, color: ev.color || 'var(--accent)', border: `1px solid ${ev.color || 'var(--accent)'}44` }}>
                      {typeInfo.label}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CalendarDaysIcon style={{ width: 14, height: 14 }} /> {dateLabel}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ClockIcon style={{ width: 14, height: 14 }} /> {timeLabel}
                  </span>
                </div>

                {ev.notes && (
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0', fontStyle: 'italic' }}>
                    {ev.notes}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button className="icon-btn" onClick={() => onEdit(ev)} title="Modifica" style={{ width: 30, height: 30 }}>
                  <PencilIcon style={{ width: 14, height: 14 }} />
                </button>
                <button className="icon-btn" onClick={() => onDelete(ev.id)} title="Elimina" style={{ width: 30, height: 30, color: 'var(--danger)' }}>
                  <TrashIcon style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
