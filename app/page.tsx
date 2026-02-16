import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginButton from '@/components/LoginButton'

// export default function Home() {
//   return <h1 style={{ color: 'red', fontSize: '40px' }}>HELLO</h1>
// }

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,166,35,0.06) 0%, transparent 60%),
            // radial-gradient(ellipse 60% 40% at 80% 80%, rgba(245,166,35,0.04) 0%, transparent 50%)
          `
        }}
      />

      {/* Decorative lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,166,35,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,166,35,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">
        {/* Logo mark */}
        <div
          className="mb-8"
          style={{ animation: 'fadeUp 0.6s ease-out forwards' }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'rgba(245,166,35,0.12)',
              border: '1px solid rgba(245,166,35,0.2)',
              boxShadow: '0 0 40px rgba(245,166,35,0.1)',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 4C5 3.44772 5.44772 3 6 3H18C18.5523 3 19 3.44772 19 4V21L12 17.5L5 21V4Z"
                stroke="#f5a623"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 8H15M9 11.5H13"
                stroke="#f5a623"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontSize: 'clamp(36px, 8vw, 52px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              color: '#f0e8d8',
              marginBottom: '4px',
            }}
          >
            Inkmark
          </h1>
          <p
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontStyle: 'italic',
              fontSize: '15px',
              color: '#8a7a66',
              letterSpacing: '0.03em',
            }}
          >
            Your private bookmark collection
          </p>
        </div>

        {/* Feature list */}
        <div
          className="mb-10 w-full"
          style={{
            animation: 'fadeUp 0.6s ease-out 0.15s forwards',
            
          }}
        >
          <div
            className="rounded-xl p-6"
            style={{
              background: 'rgba(26,22,18,0.8)',
              border: '1px solid rgba(245,166,35,0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="grid grid-cols-1 gap-3 text-left">
              {[
                { icon: '🔒', text: 'Private to you — nobody else can see your bookmarks' },
                { icon: '⚡', text: 'Real-time sync across all your open tabs' },
                { icon: '🌐', text: 'Auto-fetches page titles and favicons' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span style={{ fontSize: '16px', lineHeight: '1.6', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Outfit, system-ui, sans-serif',
                      fontSize: '14px',
                      color: '#b0a090',
                      lineHeight: '1.6',
                    }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Login button */}
        <div
          style={{
            animation: 'fadeUp 0.6s ease-out 0.3s forwards',
            width: '100%',
          }}
        >
          <LoginButton />
        </div>

        <p
          style={{
            animation: 'fadeUp 0.6s ease-out 0.45s forwards',
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontSize: '12px',
            color: '#5a4e40',
            marginTop: '20px',
          }}
        >
          No password required. Sign in with your Google account.
        </p>
      </div>
    </main>
  )
}
