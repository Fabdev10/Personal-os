import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

function App(){
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold">Personal OS</h1>
        <p className="mt-4">Benvenuto — dashboard in costruzione.</p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
