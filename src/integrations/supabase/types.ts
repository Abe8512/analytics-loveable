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
      alerts: {
        Row: {
          alert_name: string
          alert_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_triggered: string | null
          threshold: number
          triggers_count: number | null
          updated_at: string | null
        }
        Insert: {
          alert_name: string
          alert_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          threshold: number
          triggers_count?: number | null
          updated_at?: string | null
        }
        Update: {
          alert_name?: string
          alert_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_triggered?: string | null
          threshold?: number
          triggers_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      call_metrics_summary: {
        Row: {
          agent_talk_ratio: number | null
          avg_duration: number | null
          avg_sentiment: number | null
          conversion_rate: number | null
          created_at: string | null
          customer_talk_ratio: number | null
          id: string
          negative_sentiment_count: number | null
          neutral_sentiment_count: number | null
          performance_score: number | null
          positive_sentiment_count: number | null
          report_date: string | null
          top_keywords: string[] | null
          total_calls: number | null
          total_duration: number | null
          updated_at: string | null
        }
        Insert: {
          agent_talk_ratio?: number | null
          avg_duration?: number | null
          avg_sentiment?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          customer_talk_ratio?: number | null
          id?: string
          negative_sentiment_count?: number | null
          neutral_sentiment_count?: number | null
          performance_score?: number | null
          positive_sentiment_count?: number | null
          report_date?: string | null
          top_keywords?: string[] | null
          total_calls?: number | null
          total_duration?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_talk_ratio?: number | null
          avg_duration?: number | null
          avg_sentiment?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          customer_talk_ratio?: number | null
          id?: string
          negative_sentiment_count?: number | null
          neutral_sentiment_count?: number | null
          performance_score?: number | null
          positive_sentiment_count?: number | null
          report_date?: string | null
          top_keywords?: string[] | null
          total_calls?: number | null
          total_duration?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      call_metrics_summary_backup: {
        Row: {
          agent_talk_ratio: number | null
          avg_call_duration: number | null
          avg_duration: number | null
          avg_sentiment: number | null
          conversion_rate: number | null
          customer_talk_ratio: number | null
          id: string | null
          negative_sentiment_count: number | null
          neutral_sentiment_count: number | null
          performance_score: number | null
          positive_sentiment_count: number | null
          report_date: string | null
          successful_calls: number | null
          time_period: string | null
          top_keywords: string[] | null
          total_calls: number | null
          total_duration: number | null
          unsuccessful_calls: number | null
          updated_at: string | null
        }
        Insert: {
          agent_talk_ratio?: number | null
          avg_call_duration?: number | null
          avg_duration?: number | null
          avg_sentiment?: number | null
          conversion_rate?: number | null
          customer_talk_ratio?: number | null
          id?: string | null
          negative_sentiment_count?: number | null
          neutral_sentiment_count?: number | null
          performance_score?: number | null
          positive_sentiment_count?: number | null
          report_date?: string | null
          successful_calls?: number | null
          time_period?: string | null
          top_keywords?: string[] | null
          total_calls?: number | null
          total_duration?: number | null
          unsuccessful_calls?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_talk_ratio?: number | null
          avg_call_duration?: number | null
          avg_duration?: number | null
          avg_sentiment?: number | null
          conversion_rate?: number | null
          customer_talk_ratio?: number | null
          id?: string | null
          negative_sentiment_count?: number | null
          neutral_sentiment_count?: number | null
          performance_score?: number | null
          positive_sentiment_count?: number | null
          report_date?: string | null
          successful_calls?: number | null
          time_period?: string | null
          top_keywords?: string[] | null
          total_calls?: number | null
          total_duration?: number | null
          unsuccessful_calls?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      call_transcripts: {
        Row: {
          assigned_to: string | null
          call_id: string | null
          call_score: number | null
          created_at: string | null
          customer_name: string | null
          duration: number | null
          end_time: string | null
          filename: string | null
          id: string
          key_phrases: string[] | null
          keywords: string[] | null
          metadata: Json | null
          sentiment: string | null
          speaker_count: number | null
          start_time: string | null
          text: string
          transcript_segments: Json | null
          transcription_text: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          assigned_to?: string | null
          call_id?: string | null
          call_score?: number | null
          created_at?: string | null
          customer_name?: string | null
          duration?: number | null
          end_time?: string | null
          filename?: string | null
          id?: string
          key_phrases?: string[] | null
          keywords?: string[] | null
          metadata?: Json | null
          sentiment?: string | null
          speaker_count?: number | null
          start_time?: string | null
          text: string
          transcript_segments?: Json | null
          transcription_text?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          assigned_to?: string | null
          call_id?: string | null
          call_score?: number | null
          created_at?: string | null
          customer_name?: string | null
          duration?: number | null
          end_time?: string | null
          filename?: string | null
          id?: string
          key_phrases?: string[] | null
          keywords?: string[] | null
          metadata?: Json | null
          sentiment?: string | null
          speaker_count?: number | null
          start_time?: string | null
          text?: string
          transcript_segments?: Json | null
          transcription_text?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      calls: {
        Row: {
          created_at: string | null
          customer_engagement: number | null
          duration: number
          filename: string | null
          filler_word_count: number | null
          id: string
          key_phrases: string[] | null
          objection_count: number | null
          sentiment_agent: number | null
          sentiment_customer: number | null
          speaking_speed: number | null
          talk_ratio_agent: number | null
          talk_ratio_customer: number | null
          transcription_text: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_engagement?: number | null
          duration?: number
          filename?: string | null
          filler_word_count?: number | null
          id?: string
          key_phrases?: string[] | null
          objection_count?: number | null
          sentiment_agent?: number | null
          sentiment_customer?: number | null
          speaking_speed?: number | null
          talk_ratio_agent?: number | null
          talk_ratio_customer?: number | null
          transcription_text?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_engagement?: number | null
          duration?: number
          filename?: string | null
          filler_word_count?: number | null
          id?: string
          key_phrases?: string[] | null
          objection_count?: number | null
          sentiment_agent?: number | null
          sentiment_customer?: number | null
          speaking_speed?: number | null
          talk_ratio_agent?: number | null
          talk_ratio_customer?: number | null
          transcription_text?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      keyword_analytics: {
        Row: {
          category: string
          count: number | null
          created_at: string | null
          id: string
          keyword: string
          last_used: string | null
          report_date: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          count?: number | null
          created_at?: string | null
          id?: string
          keyword: string
          last_used?: string | null
          report_date?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          count?: number | null
          created_at?: string | null
          id?: string
          keyword?: string
          last_used?: string | null
          report_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      keyword_trends: {
        Row: {
          category: string
          count: number | null
          created_at: string | null
          id: string
          keyword: string
          last_used: string | null
          report_date: string | null
          time_period: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          count?: number | null
          created_at?: string | null
          id?: string
          keyword: string
          last_used?: string | null
          report_date?: string | null
          time_period?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          count?: number | null
          created_at?: string | null
          id?: string
          keyword?: string
          last_used?: string | null
          report_date?: string | null
          time_period?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rep_metrics_summary: {
        Row: {
          call_volume: number | null
          id: string
          insights: string[] | null
          rep_id: string
          rep_name: string | null
          sentiment_score: number | null
          success_rate: number | null
          time_period: string | null
          top_keywords: string[] | null
          updated_at: string | null
        }
        Insert: {
          call_volume?: number | null
          id?: string
          insights?: string[] | null
          rep_id: string
          rep_name?: string | null
          sentiment_score?: number | null
          success_rate?: number | null
          time_period?: string | null
          top_keywords?: string[] | null
          updated_at?: string | null
        }
        Update: {
          call_volume?: number | null
          id?: string
          insights?: string[] | null
          rep_id?: string
          rep_name?: string | null
          sentiment_score?: number | null
          success_rate?: number | null
          time_period?: string | null
          top_keywords?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rep_metrics_summary_backup: {
        Row: {
          call_volume: number | null
          id: string | null
          insights: string[] | null
          rep_id: string | null
          rep_name: string | null
          sentiment_score: number | null
          success_rate: number | null
          time_period: string | null
          top_keywords: string[] | null
          updated_at: string | null
        }
        Insert: {
          call_volume?: number | null
          id?: string | null
          insights?: string[] | null
          rep_id?: string | null
          rep_name?: string | null
          sentiment_score?: number | null
          success_rate?: number | null
          time_period?: string | null
          top_keywords?: string[] | null
          updated_at?: string | null
        }
        Update: {
          call_volume?: number | null
          id?: string | null
          insights?: string[] | null
          rep_id?: string | null
          rep_name?: string | null
          sentiment_score?: number | null
          success_rate?: number | null
          time_period?: string | null
          top_keywords?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rep_metrics_summary_duplicate_backup: {
        Row: {
          call_volume: number | null
          id: string | null
          insights: string[] | null
          rep_id: string | null
          rep_name: string | null
          sentiment_score: number | null
          success_rate: number | null
          time_period: string | null
          top_keywords: string[] | null
          updated_at: string | null
        }
        Insert: {
          call_volume?: number | null
          id?: string | null
          insights?: string[] | null
          rep_id?: string | null
          rep_name?: string | null
          sentiment_score?: number | null
          success_rate?: number | null
          time_period?: string | null
          top_keywords?: string[] | null
          updated_at?: string | null
        }
        Update: {
          call_volume?: number | null
          id?: string | null
          insights?: string[] | null
          rep_id?: string | null
          rep_name?: string | null
          sentiment_score?: number | null
          success_rate?: number | null
          time_period?: string | null
          top_keywords?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schema_migrations: {
        Row: {
          applied_at: string | null
          description: string | null
          id: string
        }
        Insert: {
          applied_at?: string | null
          description?: string | null
          id: string
        }
        Update: {
          applied_at?: string | null
          description?: string | null
          id?: string
        }
        Relationships: []
      }
      sentiment_trends: {
        Row: {
          confidence: number
          id: string
          recorded_at: string | null
          sentiment_label: string
          user_id: string | null
        }
        Insert: {
          confidence: number
          id?: string
          recorded_at?: string | null
          sentiment_label: string
          user_id?: string | null
        }
        Update: {
          confidence?: number
          id?: string
          recorded_at?: string | null
          sentiment_label?: string
          user_id?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string
          id: string
          member_id: string | null
          name: string
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email: string
          id?: string
          member_id?: string | null
          name: string
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string
          id?: string
          member_id?: string | null
          name?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      temp_call_metrics_backup: {
        Row: {
          avg_duration: number | null
          created_at: string | null
          id: string | null
          negative_sentiment_count: number | null
          neutral_sentiment_count: number | null
          positive_sentiment_count: number | null
          report_date: string | null
          total_calls: number | null
          total_duration: number | null
          updated_at: string | null
        }
        Insert: {
          avg_duration?: number | null
          created_at?: string | null
          id?: string | null
          negative_sentiment_count?: number | null
          neutral_sentiment_count?: number | null
          positive_sentiment_count?: number | null
          report_date?: string | null
          total_calls?: number | null
          total_duration?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_duration?: number | null
          created_at?: string | null
          id?: string | null
          negative_sentiment_count?: number | null
          neutral_sentiment_count?: number | null
          positive_sentiment_count?: number | null
          report_date?: string | null
          total_calls?: number | null
          total_duration?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      activity_metrics_summary: {
        Row: {
          active_reps: number | null
          avg_duration: number | null
          avg_sentiment: number | null
          avg_talk_ratio: number | null
          call_count: number | null
          call_to_demo_ratio: number | null
          negative_calls: number | null
          positive_calls: number | null
          report_date: string | null
        }
        Relationships: []
      }
      alert_activity_view: {
        Row: {
          alert_id: string | null
          alert_name: string | null
          alert_type: string | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          description: string | null
          is_active: boolean | null
          last_triggered: string | null
          threshold: number | null
          triggers_count: number | null
        }
        Relationships: []
      }
      call_details_view: {
        Row: {
          created_at: string | null
          customer_name: string | null
          duration: number | null
          filename: string | null
          id: string | null
          rep_name: string | null
          sentiment_agent: number | null
          sentiment_customer: number | null
          talk_ratio_agent: number | null
          talk_ratio_customer: number | null
          text: string | null
          user_id: string | null
          user_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_filename_column: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      add_filename_column_if_needed: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      add_table_to_realtime_publication: {
        Args: { table_name: string }
        Returns: undefined
      }
      adjust_talk_ratio_constraints: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      analyze_call_sentiment: {
        Args: { call_id: string }
        Returns: undefined
      }
      apply_all_fixes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      apply_database_fixes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      apply_full_database_fix: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      assign_rep_to_call: {
        Args: { call_id: string; rep_id: string; rep_name?: string }
        Returns: boolean
      }
      check_column_exists: {
        Args: { p_table_name: string; p_column_name: string }
        Returns: boolean
      }
      check_connection: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_table_exists: {
        Args: { table_name: string }
        Returns: boolean
      }
      check_table_in_publication: {
        Args: { table_name: string; publication_name: string }
        Returns: boolean
      }
      column_exists: {
        Args: { table_name: string; column_name: string }
        Returns: boolean
      }
      create_alert: {
        Args: {
          p_alert_name: string
          p_alert_type: string
          p_threshold: number
          p_description?: string
          p_created_by?: string
        }
        Returns: string
      }
      create_call_details_view: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_migrations_table_if_not_exists: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ensure_filename_column: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ensure_schema_migrations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      ensure_schema_migrations_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      execute_sql: {
        Args: { query_text: string } | { sql: string; params?: string }
        Returns: undefined
      }
      execute_sql_with_results: {
        Args: { query_text: string } | { sql: string; params?: string }
        Returns: Json
      }
      fix_all_call_records: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      fix_sentiment_and_ratio_columns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fix_sentiment_and_talk_columns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_call_analytics: {
        Args:
          | { user_id_param: string }
          | {
              user_id_param: string
              start_date_param: string
              end_date_param: string
            }
        Returns: {
          id: string
          created_at: string
          sentiment_score: number
        }[]
      }
      get_keyword_analytics: {
        Args:
          | { p_category?: string; p_limit?: number; p_days?: number }
          | {
              start_date?: string
              end_date?: string
              user_ids?: string[]
              limit_count?: number
            }
        Returns: Json
      }
      get_recent_alerts: {
        Args: { p_days?: number }
        Returns: {
          alert_name: string
          alert_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_triggered: string | null
          threshold: number
          triggers_count: number | null
          updated_at: string | null
        }[]
      }
      get_sentiment_trends: {
        Args:
          | { p_days?: number }
          | { start_date?: string; end_date?: string; user_ids?: string[] }
        Returns: Json
      }
      get_table_columns: {
        Args: { table_name: string }
        Returns: Json
      }
      get_table_metadata: {
        Args: { table_name: string }
        Returns: Json
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_team_ids: {
        Args: { user_id_param: string }
        Returns: string[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_service_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      query: {
        Args: { sql_query: string }
        Returns: Json[]
      }
      refresh_schema_cache: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      regenerate_all_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_calls_by_keyword: {
        Args: { search_term: string }
        Returns: {
          id: string
          user_id: string
          created_at: string
          filename: string
          sentiment_agent: number
          sentiment_customer: number
          talk_ratio_agent: number
          talk_ratio_customer: number
        }[]
      }
      search_keywords: {
        Args: { search_term: string }
        Returns: {
          keyword: string
          category: string
          count: number
          last_used: string
        }[]
      }
      set_replica_identity_full_for_table: {
        Args: { table_name: string }
        Returns: undefined
      }
      validate_database_fixes: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
