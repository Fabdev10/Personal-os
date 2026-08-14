import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { get, post } from '../services/api'

export default function Diary(){
  const [entries, setEntries] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  async function load(){
    try{ const res = await get('/api/diary'); setEntries(res.entries || []) }catch(e){console.error(e)}
  }

  useEffect(()=>{ load() }, [])

  async function create(){
    try{
      const res = await post('/api/diary', { title, content })
      setTitle('')
      setContent('')
      setEntries(prev => [res.entry, ...prev])
    }catch(e:any){ alert(e.message) }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Diary</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="mb-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded mb-2 bg-transparent" />
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={8} className="w-full p-2 border rounded mt-2 bg-transparent" placeholder="Write your entry in Markdown..." />
            <div className="flex justify-end mt-2">
              <button onClick={create} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-medium mb-2">Recent Entries</h3>
            <ul className="space-y-3">
              {entries.map(e => (
                <li key={e.id} className="p-3 bg-white dark:bg-gray-800 rounded shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{e.title || 'Untitled'}</div>
                    <div className="text-xs text-gray-500">{new Date(e.date).toLocaleString()}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3"><ReactMarkdown>{e.content || ''}</ReactMarkdown></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-span-2">
          <h3 className="font-medium mb-2">Preview</h3>
          <div className="p-4 border rounded bg-white dark:bg-gray-800 min-h-[300px] shadow">
            <ReactMarkdown>{content || 'Nothing to preview'}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
