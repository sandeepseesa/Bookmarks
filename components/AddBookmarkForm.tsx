'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bookmark } from '@/lib/types'

interface Props {
  userId: string
  onAdd: (bookmark: Bookmark) => void
}

async function fetchPageMeta(url: string): Promise<{ title: string | null; favicon_url: string | null }> {
  try {
    const hostname = new URL(url).hostname
    const favicon_url = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    const path = new URL(url).pathname
    const segments = path.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1] || ''
    const title = lastSegment
      ? lastSegment.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '')
      : hostname.replace(/^www\./, '')
    return {
      title: title.charAt(0).toUpperCase() + title.slice(1) || null,
      favicon_url,
    }
  } catch {
    return { title: null, favicon_url: null }
  }
}

export default function AddBookmarkForm({ userId, onAdd }: Props) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')

  const normalizeUrl = (raw: string): string => {
    const trimmed = raw.trim()
    if (!trimmed) return trimmed
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    return `https://${trimmed}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const normalized = normalizeUrl(url)
    if (!normalized) return

    try {
      new URL(normalized)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setLoading(true)

    const { title: autoTitle, favicon_url } = await fetchPageMeta(normalized)

    const supabase = createClient()
    const { data, error: dbError } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        url: normalized,
        title: title.trim() || autoTitle,
        favicon_url,
      })
      .select()
      .single()

    setLoading(false)

    if (dbError) {
      setError(dbError.message)
      return
    }

    if (data) {
      onAdd(data as Bookmark)
      setUrl('')
      setTitle('')
      inputRef.current?.focus()
    }
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'rgba(26,22,18,0.8)',
        border: '1px solid rgba(245,166,35,0.12)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 relative">
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#5a4e40' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={e => {
                setUrl(e.target.value)
                if (error) setError(null)
              }}
              placeholder="https://example.com or just paste a URL…"
              className="input-field"
              style={{ paddingLeft: '36px' }}
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="bg-gray-400 btn-primary flex items-center gap-2 whitespace-nowrap sm:w-auto "
            style={{ minWidth: '110px', justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray="31.4"
                    strokeDashoffset="10"
                    strokeLinecap="round"
                  />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
                Add
              </>
            )}
          </button>
        </div>

        {error && (
          <p
            className="mt-2"
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '12px',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {error}
          </p>
        )}
      </form>
    </div>
  )
}
