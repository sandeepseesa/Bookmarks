export interface Bookmark {
  id: string
  user_id: string
  url: string
  title: string | null
  description: string | null
  favicon_url: string | null
  created_at: string
}

export interface User {
  id: string
  email: string | null
  user_metadata: {
    full_name?: string
    avatar_url?: string
    name?: string
  }
}
