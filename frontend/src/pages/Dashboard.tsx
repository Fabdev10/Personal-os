import React, { useEffect, useState } from 'react'
import { get } from '../services/api'
import {
  BookOpenIcon,
  TrophyIcon,
  FireIcon,
  AcademicCapIcon,
  BoltIcon,
} from '@heroicons/react/24/outline/index.js'
import AiInsightsCard from '../components/AiInsightsCard'

const MOOD_EMOJI: Record<string, string> = {
  EXCELLENT: '🤩', GOOD: '😊', NEUTRAL: '😐', BAD: '😔', TERRIBLE: '😣',
}

interface DashData {
  diary: { total: number; thisWeek: number; avgEnergy: number; recentMoods: { mood: string; date: string }[] }
  goals: { active: number; completed: number }
  habits: { streak: number }
  study: { sessions: number; totalMinutes: number; totalHours: number }
  workout: { date: string; type: string | null; duration: number | null } | null
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="card" style={{ padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: color ? `${color}22` : 'var(--accent-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ color: color || 'var(--accent)', width: 22, height: 22, display: 'flex' }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<DashData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get('/api/dashboard').then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="empty-state"><div className="empty-state-title">Loading dashboard…</div></div>
  )

  if (!data) return (
    <div className="empty-state"><div className="empty-state-title">Could not load data</div></div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Il tuo personal OS — tutto in un colpo d'occhio</p>
      </div>

      {/* AI Insights Coach Card */}
      <AiInsightsCard />

      {/* Stat cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard icon={<BookOpenIcon />} label="Diary this week" value={data.diary.thisWeek} sub={`${data.diary.total} total entries`} />
        <StatCard icon={<TrophyIcon />} label="Active goals" value={data.goals.active} sub={`${data.goals.completed} completed`} color="#f5a623" />
        <StatCard icon={<FireIcon />} label="Habit streak" value={`${data.habits.streak}d`} sub="days in a row" color="#f06b6b" />
        <StatCard icon={<AcademicCapIcon />} label="Study this week" value={`${data.study.totalHours}h`} sub={`${data.study.sessions} sessions`} color="#5bbf8a" />
        <StatCard icon={<BoltIcon />} label="Avg energy" value={data.diary.avgEnergy || '—'} sub="out of 5" color="#a78bfa" />
      </div>

      {/* Recent mood + last workout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Mood timeline */}
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Moods</span></div>
          <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.diary.recentMoods.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No diary entries yet</p>
            ) : data.diary.recentMoods.slice(0, 14).map((m, i) => (
              <div key={i} title={`${m.mood} · ${new Date(m.date).toLocaleDateString('it-IT')}`}
                style={{ fontSize: 22, cursor: 'default', transition: 'transform 0.1s', lineHeight: 1 }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.3)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                {MOOD_EMOJI[m.mood] || '😐'}
              </div>
            ))}
          </div>
        </div>

        {/* Last workout */}
        <div className="card">
          <div className="card-header"><span className="card-title">Last Workout</span></div>
          <div style={{ padding: '20px 24px' }}>
            {data.workout ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{data.workout.type || 'Workout'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {new Date(data.workout.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {data.workout.duration ? ` · ${data.workout.duration} min` : ''}
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No workouts logged yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
