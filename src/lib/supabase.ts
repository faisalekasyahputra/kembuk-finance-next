import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pdvvjfydlucotahmqagf.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdnZqZnlkbHVjb3RhaG1xYWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNDU4MzAsImV4cCI6MjA3OTYyMTgzMH0.dy1QDbPU2JyMgv9cmf5oIH76nFavzgaO_-a2MMUZijw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
