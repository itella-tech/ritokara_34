export interface Database {
  public: {
    Tables: {
      pdf_files: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          file_path: string
          is_public: boolean
          display_order: number
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string
          file_path: string
          is_public?: boolean
          display_order?: number
          metadata?: Json
        }
      }
      audio_files: {
        Row: {
          id: string
          created_at: string
          pdf_page_id: string
          language: string
          file_path: string
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          pdf_page_id: string
          language: string
          file_path: string
          metadata?: Json
        }
      }
      pdf_pages: {
        Row: {
          id: string
          created_at: string
          pdf_file_id: string
          page_number: number
          image_path: string
        }
        Insert: {
          id?: string
          created_at?: string
          pdf_file_id: string
          page_number: number
          image_path: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}