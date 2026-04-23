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
      contract_courses: {
        Row: {
          campus: string | null
          course_name: string
          end_date: string | null
          id: string
          is_regular: boolean | null
          sf_id: string
          start_date: string | null
          status: string
          student_id: string | null
          student_line_id: string | null
          student_name: string | null
        }
        Insert: {
          campus?: string | null
          course_name: string
          end_date?: string | null
          id?: string
          is_regular?: boolean | null
          sf_id: string
          start_date?: string | null
          status: string
          student_id?: string | null
          student_line_id?: string | null
          student_name?: string | null
        }
        Update: {
          campus?: string | null
          course_name?: string
          end_date?: string | null
          id?: string
          is_regular?: boolean | null
          sf_id?: string
          start_date?: string | null
          status?: string
          student_id?: string | null
          student_line_id?: string | null
          student_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_courses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["sf_id"]
          },
        ]
      }
      counseling_form_settings: {
        Row: {
          description: string | null
          field_id: string
          field_type:
            | Database["public"]["Enums"]["counseling_field_type"]
            | null
          is_required: boolean | null
          label: string
          options: Json | null
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          field_id: string
          field_type?:
            | Database["public"]["Enums"]["counseling_field_type"]
            | null
          is_required?: boolean | null
          label: string
          options?: Json | null
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          field_id?: string
          field_type?:
            | Database["public"]["Enums"]["counseling_field_type"]
            | null
          is_required?: boolean | null
          label?: string
          options?: Json | null
          sort_order?: number | null
        }
        Relationships: []
      }
      counseling_forms: {
        Row: {
          created_at: string | null
          details: Json
          id: string
          status: string | null
          student_id: string | null
        }
        Insert: {
          created_at?: string | null
          details: Json
          id?: string
          status?: string | null
          student_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json
          id?: string
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "counseling_forms_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_requests: {
        Row: {
          id: string
          created_at: string | null
          student_sf_id: string
          contract_course_sf_id: string
          student_line_id: string | null
          start_date: string
          end_date: string
          total_weeks: number | null
          sb_weeks: number | null
          effective_weeks: number | null
          new_end_date: string | null
          reason: string | null
          status: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          student_sf_id: string
          contract_course_sf_id: string
          student_line_id?: string | null
          start_date: string
          end_date: string
          total_weeks?: number | null
          sb_weeks?: number | null
          effective_weeks?: number | null
          new_end_date?: string | null
          reason?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          student_sf_id?: string
          contract_course_sf_id?: string
          student_line_id?: string | null
          start_date?: string
          end_date?: string
          total_weeks?: number | null
          sb_weeks?: number | null
          effective_weeks?: number | null
          new_end_date?: string | null
          reason?: string | null
          status?: string | null
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          id: string
          created_at: string | null
          student_sf_id: string
          contract_course_sf_id: string
          student_line_id: string | null
          start_date: string
          end_date: string
          total_weeks: number | null
          sb_weeks: number | null
          effective_weeks: number | null
          new_end_date: string | null
          payment_method: string | null
          reason: string | null
          status: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          student_sf_id: string
          contract_course_sf_id: string
          student_line_id?: string | null
          start_date: string
          end_date: string
          total_weeks?: number | null
          sb_weeks?: number | null
          effective_weeks?: number | null
          new_end_date?: string | null
          payment_method?: string | null
          reason?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          student_sf_id?: string
          contract_course_sf_id?: string
          student_line_id?: string | null
          start_date?: string
          end_date?: string
          total_weeks?: number | null
          sb_weeks?: number | null
          effective_weeks?: number | null
          new_end_date?: string | null
          payment_method?: string | null
          reason?: string | null
          status?: string | null
        }
        Relationships: []
      }
      school_breaks: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          campus: string | null
          course: string | null
          email: string | null
          full_name: string | null
          level: string | null
          line_id: string
          purpose: string | null
          sf_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          campus?: string | null
          course?: string | null
          email?: string | null
          full_name?: string | null
          level?: string | null
          line_id: string
          purpose?: string | null
          sf_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          campus?: string | null
          course?: string | null
          email?: string | null
          full_name?: string | null
          level?: string | null
          line_id?: string
          purpose?: string | null
          sf_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          campus: string | null
          course_name: string | null
          current_course_end_date: string | null
          email: string | null
          english_level: string | null
          full_name: string | null
          goal_score: string | null
          id: string
          line_id: string
          sf_id: string | null
          starting_score: string | null
          status: string | null
          target_score: string | null
          updated_at: string | null
        }
        Insert: {
          campus?: string | null
          course_name?: string | null
          current_course_end_date?: string | null
          email?: string | null
          english_level?: string | null
          full_name?: string | null
          goal_score?: string | null
          id?: string
          line_id: string
          sf_id?: string | null
          starting_score?: string | null
          status?: string | null
          target_score?: string | null
          updated_at?: string | null
        }
        Update: {
          campus?: string | null
          course_name?: string | null
          current_course_end_date?: string | null
          email?: string | null
          english_level?: string | null
          full_name?: string | null
          goal_score?: string | null
          id?: string
          line_id?: string
          sf_id?: string | null
          starting_score?: string | null
          status?: string | null
          target_score?: string | null
          updated_at?: string | null
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
      counseling_field_type:
        | "ラジオボタン"
        | "チェックボックス"
        | "プルダウン"
        | "テキスト"
        | "テキストエリア"
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
      counseling_field_type: [
        "ラジオボタン",
        "チェックボックス",
        "プルダウン",
        "テキスト",
        "テキストエリア",
      ],
    },
  },
} as const
