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
      plugins: {
        Row: {
          id: string
          name: string
          version: string
          description: string | null
          author: string | null
          authors: string[] | null
          main: string | null
          api_version: string | null
          soft_depend: string[] | null
          depend: string[] | null
          load_before: string[] | null
          prefix: string | null
          website: string | null
          tagline: string | null
          tags: string[] | null
          commands: Json | null
          permissions: Json | null
          items: Json | null
          recipes: Json | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          version?: string
          description?: string | null
          author?: string | null
          authors?: string[] | null
          main?: string | null
          api_version?: string | null
          soft_depend?: string[] | null
          depend?: string[] | null
          load_before?: string[] | null
          prefix?: string | null
          website?: string | null
          tagline?: string | null
          tags?: string[] | null
          commands?: Json | null
          permissions?: Json | null
          items?: Json | null
          recipes?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          version?: string
          description?: string | null
          author?: string | null
          authors?: string[] | null
          main?: string | null
          api_version?: string | null
          soft_depend?: string[] | null
          depend?: string[] | null
          load_before?: string[] | null
          prefix?: string | null
          website?: string | null
          tagline?: string | null
          tags?: string[] | null
          commands?: Json | null
          permissions?: Json | null
          items?: Json | null
          recipes?: Json | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      upsert_plugin: {
        Args: {
          p_json: Json
        }
        Returns: Json
      }
      list_plugins: {
        Args: Record<string, never>
        Returns: Json
      }
      delete_plugin: {
        Args: {
          p_id: string
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}