export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          meta: Json
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          meta?: Json
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          meta?: Json
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          draft: Json
          id: number
          published: Json | null
          published_at: string | null
          updated_at: string
        }
        Insert: {
          draft?: Json
          id?: number
          published?: Json | null
          published_at?: string | null
          updated_at?: string
        }
        Update: {
          draft?: Json
          id?: number
          published?: Json | null
          published_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          draft: Json
          key: string
          published: Json | null
          published_at: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          draft?: Json
          key: string
          published?: Json | null
          published_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          draft?: Json
          key?: string
          published?: Json | null
          published_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          inquiry_type: string | null
          message: string
          phone: string | null
          status: Database["public"]["Enums"]["lead_status"]
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          inquiry_type?: string | null
          message: string
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          inquiry_type?: string | null
          message?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt: string
          created_at: string
          filename: string
          height: number | null
          id: string
          mime: string
          path: string
          size: number
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt?: string
          created_at?: string
          filename: string
          height?: number | null
          id?: string
          mime: string
          path: string
          size: number
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt?: string
          created_at?: string
          filename?: string
          height?: number | null
          id?: string
          mime?: string
          path?: string
          size?: number
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          draft: Json
          id: string
          is_hidden: boolean
          published: Json | null
          published_at: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          draft?: Json
          id?: string
          is_hidden?: boolean
          published?: Json | null
          published_at?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          draft?: Json
          id?: string
          is_hidden?: boolean
          published?: Json | null
          published_at?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      rfq_requests: {
        Row: {
          additional_notes: string | null
          city: string | null
          company_name: string
          country: string | null
          created_at: string
          email: string
          expected_delivery_date: string | null
          file_urls: Json
          full_name: string
          id: string
          material: string | null
          phone: string
          product_name: string | null
          quantity: string | null
          requirement_type: string
          specifications: string | null
          state: string | null
          status: Database["public"]["Enums"]["lead_status"]
        }
        Insert: {
          additional_notes?: string | null
          city?: string | null
          company_name: string
          country?: string | null
          created_at?: string
          email: string
          expected_delivery_date?: string | null
          file_urls?: Json
          full_name: string
          id?: string
          material?: string | null
          phone: string
          product_name?: string | null
          quantity?: string | null
          requirement_type: string
          specifications?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Update: {
          additional_notes?: string | null
          city?: string | null
          company_name?: string
          country?: string | null
          created_at?: string
          email?: string
          expected_delivery_date?: string | null
          file_urls?: Json
          full_name?: string
          id?: string
          material?: string | null
          phone?: string
          product_name?: string | null
          quantity?: string | null
          requirement_type?: string
          specifications?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
        }
        Relationships: []
      }
      submission_rate: {
        Row: {
          created_at: string
          id: string
          ip: string
          kind: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip: string
          kind: string
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string
          kind?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      any_admin_exists: { Args: never; Returns: boolean }
      claim_first_admin: { Args: never; Returns: boolean }
      discard_content_draft: { Args: { _key: string }; Returns: undefined }
      discard_product_draft: { Args: { _id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          _action: string
          _meta: Json
          _target_id: string
          _target_table: string
        }
        Returns: undefined
      }
      publish_company: { Args: never; Returns: undefined }
      publish_content: { Args: { _key: string }; Returns: undefined }
      publish_product: { Args: { _id: string }; Returns: undefined }
      record_submission: {
        Args: { _ip: string; _kind: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "quoted"
        | "completed"
        | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "quoted",
        "completed",
        "closed",
      ],
    },
  },
} as const
