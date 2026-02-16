# Inkmark — Smart Bookmark Manager

A private, real-time bookmark manager built with Next.js 14 (App Router), Supabase, and Tailwind CSS.

**Live URL:** 

---

## Features

- 🔐 **Google OAuth only** — no email/password accounts
- 🔒 **Private bookmarks** — Row-Level Security ensures users only see their own data
- ⚡ **Real-time sync** — Supabase Realtime pushes changes to all open tabs instantly, shows live or offline or in sync 
- 🗑️ **Delete with confirmation** — two-click delete to prevent accidents
- 🌐 **Favicon auto-fetch** — Google S2 API pulls favicons for visual identification
- 📱 **Responsive design** — works on mobile and desktop

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Auth | Supabase Auth + Google OAuth |
| Database | Supabase PostgreSQL |
| Real-time | Supabase Realtime (Postgres CDC) |
| Styling | Tailwind CSS + custom CSS properties |
| Deployment | Vercel |

---

## Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/yourusername/smart-bookmarks
cd smart-bookmarks
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **SQL Editor** and run the migration below

### 3. Run the database migration

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  title       TEXT,
  favicon_url TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast user queries
CREATE INDEX bookmarks_user_id_idx ON bookmarks(user_id);

-- Enable Row-Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can only insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can only delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for the bookmarks table
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

### 4. Configure Google OAuth in Supabase

1. Go to **Authentication → Providers → Google** in your Supabase dashboard
2. Enable Google provider
3. Set up a Google Cloud OAuth 2.0 client:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project (or use existing)
   - Enable the **Google+ API** or **Google Identity API**
   - Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add Authorized redirect URIs:
     - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
     - `http://localhost:3000/api/auth/callback` (for local dev)
4. Copy the Client ID and Client Secret back into Supabase → Google provider settings

### 5. Set environment variables

```bash
cp .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Find these in Supabase: **Settings → API → Project URL , anon key**

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment on Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/smart-bookmarks.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### 3. Update OAuth redirect URIs

After deploying, add your Vercel URL to:
- Google Cloud Console → Authorized redirect URIs: `https://yourdomain.vercel.app/api/auth/callback`
- Supabase → Authentication → URL Configuration → Redirect URLs: `https://yourdomain.vercel.app/**`

---

## Problems Encountered & Solutions

### Problem 1: Google favicon CORS

**Issue** SQL syntax error on running the migration threw syntax error at "UUID"
**Solution** Supabase SQL Editor requires CREATE EXTENSION IF NOT EXISTS "pgcrypto"; along creating the table.

---

### Problem 2: Google favicon

**Issue:** Fetching page metadata (title, favicon) client-side is blocked by CORS for most websites. A full server-side scraper would require a separate API route or external service.

**Solution:** For the favicon, we use Google's public S2 favicon service (`https://www.google.com/s2/favicons?domain=...`), which works without CORS issues. For the title, we derive a human-readable string from the URL path (e.g., `/blog/my-article` → "My article"). This avoids the need for any server-side scraping infrastructure while still providing useful visual context.

---

### Problem 3: Row-Level Security blocking realtime

**Issue:** Supabase Realtime requires RLS policies to be set correctly, or the real-time channel won't receive events even if the subscription connects.

**Solution:** Ensure the `bookmarks` table has a `SELECT` policy that allows `auth.uid() = user_id`, and that `supabase_realtime` publication includes the table. The client-side filter (`filter: 'user_id=eq.${userId}'`) further narrows events, but the RLS policy is what actually controls server-side access.


## Project Structure

```
smart-bookmarks/
├── app/
│   ├── api/auth/callback/route.ts  # OAuth exchange handler
│   ├── dashboard/page.tsx           # Protected dashboard (server)
│   ├── globals.css                  # Global styles + CSS variables
│   ├── layout.tsx                   # Root layout with fonts
│   └── page.tsx                     # Login page (server)
├── components/
│   ├── AddBookmarkForm.tsx           # URL input form (client)
│   ├── BookmarkCard.tsx              # Individual bookmark (client)
│   ├── BookmarksDashboard.tsx        # Main dashboard with RT (client)
│   └── LoginButton.tsx               # Google OAuth trigger (client)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Browser Supabase client
│   │   └── server.ts                # Server Supabase client
│   └── types.ts                     # TypeScript interfaces
├── middleware.ts                     # Auth route protection
├── next.config.js
├── tailwind.config.ts
└── README.md
```

