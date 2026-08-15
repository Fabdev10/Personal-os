import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Diary from './pages/Diary'
import Goals from './pages/Goals'
import Workouts from './pages/Workouts'
import Study from './pages/Study'
import Habits from './pages/Habits'
import Agenda from './pages/Agenda'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)', color: 'var(--text-muted)', fontSize: 14 }}>
      Loading…
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={
        <RequireAuth>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/diary" element={<Diary />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/study" element={<Study />} />
              <Route path="/habits" element={<Habits />} />
            </Routes>
          </Layout>
        </RequireAuth>
      } />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
)
