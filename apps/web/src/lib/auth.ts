import { createClient } from '@supabase/supabase-js'

// Uses the new sb_publishable_ key format (replaces legacy anon JWT key)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
)
