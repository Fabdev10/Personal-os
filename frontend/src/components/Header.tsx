import React from 'react'
import { MagnifyingGlassIcon, BellIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline/index.js'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Header() {
  const { user, logout } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const initials = (user?.username || user?.email || '?')[0].toUpperCase()

  return (
    <header className="topbar">
      {/* Search */}
      <div className="search-bar">
        <MagnifyingGlassIcon className="search-bar-icon" />
        <input placeholder="Search entries… (Ctrl+K)" id="global-search" />
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        <button
          className="icon-btn"
          title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          id="btn-theme-toggle"
          onClick={toggleTheme}
        >
          {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <button className="icon-btn" title="Notifications" id="btn-notifications">
          <BellIcon />
        </button>

        <div className="avatar-chip" id="user-menu">
          <div className="avatar-chip-dot">{initials}</div>
          <span>{user?.username || user?.email?.split('@')[0] || 'user'}</span>
        </div>

        <button className="icon-btn" title="Logout" id="btn-logout" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
          <ArrowRightOnRectangleIcon />
        </button>
      </div>
    </header>
  )
}
