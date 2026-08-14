import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './styles.css'
import Diary from './pages/Diary'
import Layout from './components/Layout'

function App(){
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Personal OS</h1>
          <nav className="space-x-4">
            <Link to="/">Dashboard</Link>
            <Link to="/diary">Diary</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<div>Dashboard (work in progress)</div>} />
          <Route path="/diary" element={<Layout><Diary /></Layout>} />
        </Routes>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
