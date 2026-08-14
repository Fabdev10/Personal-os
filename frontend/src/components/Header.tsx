import React from 'react'
import { MagnifyingGlassIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'

export default function Header(){
  const [dark, setDark] = React.useState(false)
  React.useEffect(()=>{
    if(dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  },[dark])

  return (
    <header className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-transparent">
      <div className="flex items-center gap-3">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Search (Ctrl+K)" className="pl-10 pr-3 py-2 rounded border bg-white dark:bg-gray-800" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={()=>setDark(!dark)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          {dark ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
        </button>
        <div className="px-3 py-1 border rounded">you@example.com</div>
      </div>
    </header>
  )
}
