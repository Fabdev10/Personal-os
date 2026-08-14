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
      <h2 className="text-xl font-semibold mb-4">Diary</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="mb-4">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" />
            <textarea value={content} onChange={e=>setContent(e.target.value)} rows={8} className="w-full p-2 border rounded mt-2" placeholder="Write your entry in Markdown..." />
            <button onClick={create} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Create</button>
          </div>
          <div>
            <h3 className="font-medium mb-2">Entries</h3>
            <ul>
              {entries.map(e => (
                <li key={e.id} className="mb-2 p-2 border rounded"><div className="font-semibold">{e.title}</div><div className="text-xs text-gray-500">{new Date(e.date).toLocaleString()}</div></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-span-2">
          <h3 className="font-medium mb-2">Preview</h3>
          <div className="p-4 border rounded bg-white dark:bg-gray-800">
            <ReactMarkdown>{content || 'Nothing to preview'}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}
