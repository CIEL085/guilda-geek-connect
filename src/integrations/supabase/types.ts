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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          id: string
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      demo_orders: {
        Row: {
          buyer_id: string
          conversation_id: string | null
          created_at: string | null
          id: string
          product_id: string
          receipt_id: string
          status: string | null
          total_price: number
        }
        Insert: {
          buyer_id: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          receipt_id: string
          status?: string | null
          total_price: number
        }
        Update: {
          buyer_id?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          receipt_id?: string
          status?: string | null
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "demo_orders_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "seller_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          liked: boolean
          matched_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liked: boolean
          matched_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liked?: boolean
          matched_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          fandom: string | null
          id: string
          image_url: string | null
          is_official: boolean | null
          name: string
          price: number
          seller_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          fandom?: string | null
          id?: string
          image_url?: string | null
          is_official?: boolean | null
          name: string
          price: number
          seller_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          fandom?: string | null
          id?: string
          image_url?: string | null
          is_official?: boolean | null
          name?: string
          price?: number
          seller_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profile_photos: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          photo_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          photo_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          photo_url?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          age_max: number | null
          age_min: number | null
          bio: string | null
          city: string | null
          created_at: string
          display_name: string
          email_verified: boolean | null
          gender: string | null
          gender_preference: string | null
          id: string
          interests: string[] | null
          latitude: number | null
          longitude: number | null
          max_distance: number | null
          updated_at: string
          user_id: string
          vendor_status: string | null
          verification_token: string | null
        }
        Insert: {
          age?: number | null
          age_max?: number | null
          age_min?: number | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name: string
          email_verified?: boolean | null
          gender?: string | null
          gender_preference?: string | null
          id?: string
          interests?: string[] | null
          latitude?: number | null
          longitude?: number | null
          max_distance?: number | null
          updated_at?: string
          user_id: string
          vendor_status?: string | null
          verification_token?: string | null
        }
        Update: {
          age?: number | null
          age_max?: number | null
          age_min?: number | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          email_verified?: boolean | null
          gender?: string | null
          gender_preference?: string | null
          id?: string
          interests?: string[] | null
          latitude?: number | null
          longitude?: number | null
          max_distance?: number | null
          updated_at?: string
          user_id?: string
          vendor_status?: string | null
          verification_token?: string | null
        }
        Relationships: []
      }
      seller_conversations: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          negotiated_price: number | null
          product_id: string
          seller_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          negotiated_price?: number | null
          product_id: string
          seller_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          negotiated_price?: number | null
          product_id?: string
          seller_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          message_type: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          message_type?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "seller_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "otaku" | "vendedor"
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
      app_role: ["otaku", "vendedor"],
    },
  },
} as const
