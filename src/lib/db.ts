export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pins: {
        Row: {
          created_at: string
          description: string | null
          emoji: string
          id: number
          ip_address_creator: string | null
          lat: number
          lng: number | null
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          emoji: string
          id?: number
          ip_address_creator?: string | null
          lat: number
          lng?: number | null
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          emoji?: string
          id?: number
          ip_address_creator?: string | null
          lat?: number
          lng?: number | null
          title?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
