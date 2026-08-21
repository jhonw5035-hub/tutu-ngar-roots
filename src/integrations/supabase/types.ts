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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          destination_label: string | null
          destination_lat: number | null
          destination_lng: number | null
          group_id: string | null
          id: string
          is_bot: boolean
          minority_gender_note: boolean
          passenger_gender: Database["public"]["Enums"]["gender_type"] | null
          passenger_id: string
          passenger_name: string | null
          pickup_label: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          requested_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination_label?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          group_id?: string | null
          id?: string
          is_bot?: boolean
          minority_gender_note?: boolean
          passenger_gender?: Database["public"]["Enums"]["gender_type"] | null
          passenger_id: string
          passenger_name?: string | null
          pickup_label?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          requested_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination_label?: string | null
          destination_lat?: number | null
          destination_lng?: number | null
          group_id?: string | null
          id?: string
          is_bot?: boolean
          minority_gender_note?: boolean
          passenger_gender?: Database["public"]["Enums"]["gender_type"] | null
          passenger_id?: string
          passenger_name?: string | null
          pickup_label?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          requested_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "trip_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          booking_id: string | null
          category: string
          created_at: string
          details: string | null
          driver_id: string | null
          id: string
          passenger_id: string
          status: string
          target_type: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          category?: string
          created_at?: string
          details?: string | null
          driver_id?: string | null
          id?: string
          passenger_id: string
          status?: string
          target_type?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          category?: string
          created_at?: string
          details?: string | null
          driver_id?: string | null
          id?: string
          passenger_id?: string
          status?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_status: {
        Row: {
          current_lat: number | null
          current_lng: number | null
          driver_id: string
          is_online: boolean
          updated_at: string
        }
        Insert: {
          current_lat?: number | null
          current_lng?: number | null
          driver_id: string
          is_online?: boolean
          updated_at?: string
        }
        Update: {
          current_lat?: number | null
          current_lng?: number | null
          driver_id?: string
          is_online?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_status_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          full_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_bot: boolean
          phone: string | null
          photo_url: string | null
          plate_number: string | null
          seat_capacity: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id: string
          is_bot?: boolean
          phone?: string | null
          photo_url?: string | null
          plate_number?: string | null
          seat_capacity?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          id?: string
          is_bot?: boolean
          phone?: string | null
          photo_url?: string | null
          plate_number?: string | null
          seat_capacity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_group_members: {
        Row: {
          booking_id: string
          created_at: string
          drop_label: string | null
          drop_lat: number | null
          drop_lng: number | null
          drop_order: number | null
          group_id: string
          id: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          drop_label?: string | null
          drop_lat?: number | null
          drop_lng?: number | null
          drop_order?: number | null
          group_id: string
          id?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          drop_label?: string | null
          drop_lat?: number | null
          drop_lng?: number | null
          drop_order?: number | null
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_group_members_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "trip_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_group_messages: {
        Row: {
          created_at: string
          group_id: string
          id: string
          is_system_message: boolean
          message: string
          sender_id: string | null
          sender_name: string | null
          sender_role: string | null
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          is_system_message?: boolean
          message: string
          sender_id?: string | null
          sender_name?: string | null
          sender_role?: string | null
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          is_system_message?: boolean
          message?: string
          sender_id?: string | null
          sender_name?: string | null
          sender_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "trip_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_group_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_groups: {
        Row: {
          corridor_label: string | null
          created_at: string
          driver_id: string | null
          eta_to_pickup: string | null
          id: string
          pickup_lat: number | null
          pickup_lng: number | null
          pickup_point_label: string | null
          status: string
          updated_at: string
        }
        Insert: {
          corridor_label?: string | null
          created_at?: string
          driver_id?: string | null
          eta_to_pickup?: string | null
          id?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_point_label?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          corridor_label?: string | null
          created_at?: string
          driver_id?: string | null
          eta_to_pickup?: string | null
          id?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_point_label?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_groups_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_group_driver: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      shares_group_with_driver: {
        Args: { _driver_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "passenger" | "driver" | "admin"
      gender_type: "male" | "female" | "other"
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
      app_role: ["passenger", "driver", "admin"],
      gender_type: ["male", "female", "other"],
    },
  },
} as const
