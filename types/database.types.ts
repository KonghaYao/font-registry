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
      assets: {
        Row: {
          assets_name: string
          created_at: string
          download_url: string
          id: number
          is_published: boolean
          size: number
          style: Json | null
          user_id: string | null
          version_id: number
        }
        Insert: {
          assets_name: string
          created_at?: string
          download_url: string
          id?: number
          is_published?: boolean
          size?: number
          style?: Json | null
          user_id?: string | null
          version_id: number
        }
        Update: {
          assets_name?: string
          created_at?: string
          download_url?: string
          id?: number
          is_published?: boolean
          size?: number
          style?: Json | null
          user_id?: string | null
          version_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "assets_package_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "versions"
            referencedColumns: ["id"]
          },
        ]
      }
      authors: {
        Row: {
          avatar: string | null
          created_at: string
          id: number
          is_user: string | null
          link: string | null
          name: string
          name_cn: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          id?: number
          is_user?: string | null
          link?: string | null
          name: string
          name_cn?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string
          id?: number
          is_user?: string | null
          link?: string | null
          name?: string
          name_cn?: string | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          author: number | null
          created_at: string
          description: string | null
          from: string | null
          homepage: string | null
          id: number
          is_published: boolean
          keywords: string[]
          latest: string
          license: string | null
          name: string
          name_cn: string | null
          readme: string | null
          style: Json | null
          user_id: string
        }
        Insert: {
          author?: number | null
          created_at?: string
          description?: string | null
          from?: string | null
          homepage?: string | null
          id?: number
          is_published?: boolean
          keywords: string[]
          latest: string
          license?: string | null
          name: string
          name_cn?: string | null
          readme?: string | null
          style?: Json | null
          user_id: string
        }
        Update: {
          author?: number | null
          created_at?: string
          description?: string | null
          from?: string | null
          homepage?: string | null
          id?: number
          is_published?: boolean
          keywords?: string[]
          latest?: string
          license?: string | null
          name?: string
          name_cn?: string | null
          readme?: string | null
          style?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      versions: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_deleted: boolean
          package_id: number | null
          user_id: string
          version: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          is_deleted?: boolean
          package_id?: number | null
          user_id: string
          version?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          is_deleted?: boolean
          package_id?: number | null
          user_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "versions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_permission: "all"
      app_role: "admin" | "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
