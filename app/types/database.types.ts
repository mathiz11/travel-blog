export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string
          slug: string
          title: string
          summary: string
          thumbnail_url: string
          destination: string
          country: string
          trip_date: string | null
          tags: string[]
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          summary?: string
          thumbnail_url?: string
          destination?: string
          country?: string
          trip_date?: string | null
          tags?: string[]
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          summary?: string
          thumbnail_url?: string
          destination?: string
          country?: string
          trip_date?: string | null
          tags?: string[]
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience types — extended with `blocks` (JSONB column added via SQL migration)
export type Trip = Database['public']['Tables']['trips']['Row'] & { blocks?: unknown }
export type TripInsert = Database['public']['Tables']['trips']['Insert'] & { blocks?: unknown }
export type TripUpdate = Database['public']['Tables']['trips']['Update'] & { blocks?: unknown }
