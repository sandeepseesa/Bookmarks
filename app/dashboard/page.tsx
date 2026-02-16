import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Bookmark } from '@/lib/types'
import BookmarksDashboard from '@/components/BookmarksDashboard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <BookmarksDashboard
      user={{
        id: user.id,
        email: user.email ?? null,
        user_metadata: user.user_metadata,
      }}
      initialBookmarks={(bookmarks ?? []) as Bookmark[]}
    />
  )
}
