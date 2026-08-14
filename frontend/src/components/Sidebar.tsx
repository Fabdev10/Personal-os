import React from 'react'
import { HomeIcon, BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

export default function Sidebar(){
  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4">
      <div className="mb-6">
        <div className="text-lg font-semibold">Personal OS</div>
      </div>
      <nav className="space-y-2">
        <Link to="/" className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <HomeIcon className="w-5 h-5" /> <span>Dashboard</span>
        </Link>
        <Link to="/diary" className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <BookOpenIcon className="w-5 h-5" /> <span>Diary</span>
        </Link>
        <Link to="#" className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <SparklesIcon className="w-5 h-5" /> <span>Quick Actions</span>
        </Link>
      </nav>
    </aside>
  )
}
