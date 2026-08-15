import React from 'react'
import {
  HomeIcon, BookOpenIcon, SparklesIcon, TrophyIcon,
  BoltIcon, AcademicCapIcon, CalendarDaysIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline/index.js'
import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Dashboard',    icon: HomeIcon,         to: '/' },
  { label: 'Agenda',       icon: CalendarDaysIcon, to: '/agenda' },
  { label: 'Diary',        icon: BookOpenIcon,     to: '/diary' },
  { label: 'Goals',        icon: TrophyIcon,       to: '/goals' },
  { label: 'Workouts',     icon: BoltIcon,         to: '/workouts' },
  { label: 'Study',        icon: AcademicCapIcon,  to: '/study' },
  { label: 'Habits',       icon: SparklesIcon,     to: '/habits' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span className="sidebar-logo-text">Personal OS</span>
      </div>

      {/* Nav */}
      <div className="nav-section-label">Navigation</div>
      {NAV_ITEMS.map(({ label, icon: Icon, to }) => {
        const isActive = location.pathname === to
        return (
          <Link key={label} to={to} className={`nav-item${isActive ? ' active' : ''}`}>
            <Icon />
            <span>{label}</span>
          </Link>
        )
      })}

      <div style={{ flex: 1 }} />
      <div className="divider" />
      <div style={{ padding: '8px 10px', fontSize: '12px', color: 'var(--text-muted)' }}>
        v0.1.0 · Personal OS
      </div>
    </aside>
  )
}
