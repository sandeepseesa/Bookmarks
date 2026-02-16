'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginButton() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 rounded-xl transition-all duration-200"
      style={{
        background: loading ? 'rgba(245,166,35,0.1)' : '#f5a623',
        color: loading ? '#f5a623' : '#0f0d0b',
        fontFamily: 'Outfit, system-ui, sans-serif',
        fontWeight: 600,
        fontSize: '15px',
        padding: '14px 24px',
        border: loading ? '1px solid rgba(245,166,35,0.3)' : '1px solid transparent',
        cursor: loading ? 'wait' : 'pointer',
        letterSpacing: '0.01em',
        boxShadow: loading ? 'none' : '0 4px 24px rgba(245,166,35,0.25)',
        transform: 'translateY(0)',
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.background = '#f7b840'
          e.currentTarget.style.boxShadow = '0 6px 32px rgba(245,166,35,0.35)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        if (!loading) {
          e.currentTarget.style.background = '#f5a623'
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(245,166,35,0.25)'
          e.currentTarget.style.transform = 'translateY(0)'
        }
      }}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin"
            width="18"
            height="18"
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
          <span>Connecting…</span>
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#1a1612"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#1a1612"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#1a1612"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#1a1612"
            />
          </svg>
          <span>Continue with Google</span>
        </>
      )}
    </button>
  )
}
