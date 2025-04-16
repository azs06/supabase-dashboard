export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          user_id: string
          content: string
          recipients: number
          phone_numbers: string[]
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          recipients: number
          phone_numbers: string[]
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          recipients?: number
          phone_numbers?: string[]
          status?: string
          created_at?: string
        }
      }
    }
  }
}
