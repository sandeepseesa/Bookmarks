'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bookmark, User } from '@/lib/types'
import AddBookmarkForm from './AddBookmarkForm'
import BookmarkCard from './BookmarkCard'

interface Props {
  user: User
  initialBookmarks: Bookmark[]
}

export default function BookmarksDashboard({ user, initialBookmarks }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const supabase = createClient()

  useEffect(() => {
    let channelRef: ReturnType<typeof supabase.channel> | null = null

  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) supabase.realtime.setAuth(session.access_token)

     channelRef = supabase
      .channel(`bookmarks-${user.id}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
        },
        (payload) => {
          console.log('realtime event:', payload)
  
          if (payload.eventType === 'INSERT') {
            setBookmarks(prev => {
              if (prev.some(b => b.id === (payload.new as Bookmark).id)) return prev
              return [payload.new as Bookmark, ...prev]
            })
          } else if (payload.eventType === 'DELETE') {
            setBookmarks(prev => prev.filter(b => b.id !== (payload.old as Bookmark).id))
          } else if (payload.eventType === 'UPDATE') {
            setBookmarks(prev =>
              prev.map(b => b.id === (payload.new as Bookmark).id ? payload.new as Bookmark : b)
            )
          }
        }
      )
      .subscribe((status, err) => {
        console.log('Realtime:', status, err)
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected')
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setRealtimeStatus('error')
      })
  })
  
    return () => { channelRef?.unsubscribe() }
  }, [user.id])

  const handleAdd = useCallback((bookmark: Bookmark) => {
    setBookmarks(prev => {
      if (prev.some(b => b.id === bookmark.id)) return prev
      return [bookmark, ...prev]
    })
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data) setBookmarks(data as Bookmark[])
    }
  }, [user.id, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'there'

  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(245,166,35,0.05) 0%, transparent 60%)`,
        }}
      />

      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(15,13,11,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(245,166,35,0.08)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
       
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(245,166,35,0.12)',
                border: '1px solid rgba(245,166,35,0.2)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 4C5 3.44772 5.44772 3 6 3H18C18.5523 3 19 3.44772 19 4V21L12 17.5L5 21V4Z"
                  stroke="#f5a623"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '18px',
                fontWeight: 700,
                color: '#f0e8d8',
                letterSpacing: '-0.01em',
              }}
            >
              Inkmark
            </span>

            <div className="flex items-center gap-1.5 ml-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: realtimeStatus === 'connected' ? '#4ade80'
                    : realtimeStatus === 'error' ? '#f87171'
                    : '#f5a623',
                  boxShadow: realtimeStatus === 'connected'
                    ? '0 0 6px rgba(74,222,128,0.6)'
                    : realtimeStatus === 'error'
                    ? '0 0 6px rgba(248,113,113,0.6)'
                    : '0 0 6px rgba(245,166,35,0.6)',
                  animation: realtimeStatus === 'connected' ? 'pulseDot 2s ease-in-out infinite' : 'none',
                }}
              />
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  color: realtimeStatus === 'connected' ? '#4ade80'
                    : realtimeStatus === 'error' ? '#f87171'
                    : '#f5a623',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {realtimeStatus === 'connected' ? 'live'
                  : realtimeStatus === 'error' ? 'offline'
                  : 'sync'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-7 h-7 rounded-full"
                  style={{ border: '1.5px solid rgba(245,166,35,0.3)' }}
                />
              )}
              <span
                style={{
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  fontSize: '13px',
                  color: '#8a7a66',
                }}
              >
                {displayName}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all duration-150"
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '13px',
                color: '#8a7a66',
                border: '1px solid rgba(245,166,35,0.1)',
                background: 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#f5a623'
                e.currentTarget.style.borderColor = 'rgba(245,166,35,0.3)'
                e.currentTarget.style.background = 'rgba(245,166,35,0.06)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#8a7a66'
                e.currentTarget.style.borderColor = 'rgba(245,166,35,0.1)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 relative z-10">
        <div
          className="mb-8"
          style={{ animation: 'fadeUp 0.5s ease-out forwards' }}
        >
          <h2
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: 700,
              color: '#f0e8d8',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '4px',
            }}
          >
            Your Bookmarks
          </h2>
          <p
            style={{
              fontFamily: 'Outfit, system-ui, sans-serif',
              fontSize: '14px',
              color: '#5a4e40',
            }}
          >
            {bookmarks.length === 0
              ? 'No bookmarks yet — add your first one below'
              : `${bookmarks.length} bookmark${bookmarks.length === 1 ? '' : 's'} saved`}
          </p>
        </div>

        <div
          className="mb-8"
          style={{ animation: 'fadeUp 0.5s ease-out 0.1s forwards' }}
        >
          <AddBookmarkForm userId={user.id} onAdd={handleAdd} />
        </div>

        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div
              className="text-center py-20 rounded-xl"
              style={{
                border: '1px dashed rgba(245,166,35,0.12)',
                animation: 'fadeIn 0.5s ease-out 0.2s forwards',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.1)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 4C5 3.44772 5.44772 3 6 3H18C18.5523 3 19 3.44772 19 4V21L12 17.5L5 21V4Z"
                    stroke="rgba(245,166,35,0.5)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '15px',
                  color: '#5a4e40',
                }}
              >
                Nothing saved yet
              </p>
            </div>
          ) : (
            bookmarks.map((bookmark, index) => (
              <div
                key={bookmark.id}
                style={{
                  animation: `fadeUp 0.4s ease-out ${Math.min(index * 0.06, 0.5)}s forwards`,
                }}
              >
                <BookmarkCard
                  bookmark={bookmark}
                  onDelete={handleDelete}
                />
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
