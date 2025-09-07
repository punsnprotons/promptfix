import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://snueibsroydrfsrwfzrl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNudWVpYnNyb3lkcmZzcndmenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjg3MjksImV4cCI6MjA3MjgwNDcyOX0.NrETAQvPgDp6rErdUhzSZTCz2JBFbV5YQF_ZV29TirI'

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key (first 20 chars):', supabaseAnonKey.substring(0, 20))

// Server-side client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Browser client with SSR support
export function createSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Database types (will be auto-generated later)
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          system_prompt: string
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          system_prompt: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          system_prompt?: string
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
      }
      evaluation_runs: {
        Row: {
          id: string
          project_id: string
          name: string
          status: string
          results: any
          created_at: string
          updated_at: string
          total_cost: number | null
          total_tokens: number | null
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          status: string
          results?: any
          created_at?: string
          updated_at?: string
          total_cost?: number | null
          total_tokens?: number | null
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          status?: string
          results?: any
          created_at?: string
          updated_at?: string
          total_cost?: number | null
          total_tokens?: number | null
        }
      }
      scenario_suites: {
        Row: {
          id: string
          project_id: string
          name: string
          scenarios: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          scenarios?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          scenarios?: any
          created_at?: string
          updated_at?: string
        }
      }
      prompt_versions: {
        Row: {
          id: string
          project_id: string
          version_number: number
          prompt_text: string
          changes: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          version_number: number
          prompt_text: string
          changes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          version_number?: number
          prompt_text?: string
          changes?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
