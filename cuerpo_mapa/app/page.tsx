'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [notes, setNotes] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase.from('postcards').select('*')
      if (error) console.error('Error:', error)
      else setNotes(data)
    }
    loadData()
  }, [])

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Notes from Supabase</h1>
      <ul>
        {notes.map((n) => (
          <li key={n.id} className="mb-2 border-b pb-1">
            <strong>{n.title || 'Untitled'}</strong>: {n.content}
          </li>
        ))}
      </ul>
    </main>
  )
}
