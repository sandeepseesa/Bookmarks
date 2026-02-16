'use client'

import { useState } from 'react'
import { Bookmark } from '@/lib/types'

interface Props {
  bookmark: Bookmark
  onDelete: (id: string) => void
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default function BookmarkCard({ bookmark, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [faviconError, setFaviconError] = useState(false)

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000)
      return
    }
    setDeleting(true)
    onDelete(bookmark.id)
  }

  const domain = getDomain(bookmark.url)
  const displayTitle = bookmark.title || domain

  return (
    <div
      className="bookmark-card group"
      style={{
        opacity: deleting ? 0.4 : 1,
        transition: 'all 0.2s ease',
      }}
    >
      <div className="flex items-start gap-4 p-4">
        <div
          className="flex-shrink-0 mt-0.5"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(245,166,35,0.06)',
            border: '1px solid rgba(245,166,35,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {bookmark.favicon_url && !faviconError ? (
            <img
              src={bookmark.favicon_url}
              alt=""
              width={20}
              height={20}
              style={{ objectFit: 'contain' }}
              onError={() => setFaviconError(true)}
            />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                stroke="rgba(245,166,35,0.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group/link"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="font-medium mb-1 truncate"
              style={{
                fontFamily: 'Outfit, system-ui, sans-serif',
                fontSize: '14px',
                color: '#d4c4a8',
                lineHeight: 1.4,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = '#f5a623' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = '#d4c4a8' }}
              suppressHydrationWarning
            >
              {displayTitle}
            </div>
            <div
              className="truncate"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                color: '#5a4e40',
                letterSpacing: '-0.01em',
              }}
              suppressHydrationWarning
            >
              {domain}
            </div>
          </a>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              // color: '#3a2e22',
              color:'#735334',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            {formatDate(bookmark.created_at)}
          </span>

          <div className="flex items-center gap-1">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-150"
              style={{
                color: '#5a4e40',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#f5a623'
                ;(e.currentTarget as HTMLElement).style.background = 'rgba(245,166,35,0.08)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#5a4e40'
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
              aria-label="Open link"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-150"
              style={{
                color: showConfirm ? '#f87171' : '#5a4e40',
                background: showConfirm ? 'rgba(248,113,113,0.1)' : 'transparent',
                border: showConfirm ? '1px solid rgba(248,113,113,0.2)' : '1px solid transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                if (!showConfirm) {
                  (e.currentTarget as HTMLElement).style.color = '#f87171'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.08)'
                }
              }}
              onMouseLeave={e => {
                if (!showConfirm) {
                  (e.currentTarget as HTMLElement).style.color = '#5a4e40'
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }
              }}
              aria-label={showConfirm ? 'Confirm delete' : 'Delete bookmark'}
              title={showConfirm ? 'Click again to confirm' : 'Delete bookmark'}
            >
              {showConfirm ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
