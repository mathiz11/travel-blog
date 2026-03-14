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
          cover_image_url: string
          destination: string
          country: string
          trip_date: string | null
          content: string
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
          cover_image_url?: string
          destination?: string
          country?: string
          trip_date?: string | null
          content?: string
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
          cover_image_url?: string
          destination?: string
          country?: string
          trip_date?: string | null
          content?: string
          tags?: string[]
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      trip_images: {
        Row: {
          id: string
          trip_id: string
          cloudinary_public_id: string
          caption: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          cloudinary_public_id: string
          caption?: string
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          cloudinary_public_id?: string
          caption?: string
          position?: number
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience types
export type Trip = Database['public']['Tables']['trips']['Row']
export type TripInsert = Database['public']['Tables']['trips']['Insert']
export type TripUpdate = Database['public']['Tables']['trips']['Update']

export type TripImage = Database['public']['Tables']['trip_images']['Row']
export type TripImageInsert = Database['public']['Tables']['trip_images']['Insert']
export type TripImageUpdate = Database['public']['Tables']['trip_images']['Update']
