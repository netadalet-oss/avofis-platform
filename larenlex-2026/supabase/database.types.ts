// Generated from LarenLex Supabase database on 2026-11-12.
// Migration source: Supabase 'larenlex' project; not a public credential or production legal approval.
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ll_audit_events: {
        Row: {
          actor_id: string | null
          details: Json
          entity_id: string
          entity_type: string
          event_key: string
          event_time: string
          id: number
        }
        Insert: {
          actor_id?: string | null
          details?: Json
          entity_id: string
          entity_type: string
          event_key: string
          event_time?: string
          id?: never
        }
        Update: {
          actor_id?: string | null
          details?: Json
          entity_id?: string
          entity_type?: string
          event_key?: string
          event_time?: string
          id?: never
        }
        Relationships: []
      }
      ll_case_assignments: {
        Row: {
          assignment_state: string
          case_id: string
          created_at: string
          id: string
          operator_id: string
        }
        Insert: {
          assignment_state?: string
          case_id: string
          created_at?: string
          id?: string
          operator_id: string
        }
        Update: {
          assignment_state?: string
          case_id?: string
          created_at?: string
          id?: string
          operator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ll_case_assignments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "ll_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      ll_case_documents: {
        Row: {
          case_id: string
          created_at: string
          file_size: number
          id: string
          mime_type: string
          original_name: string
          review_status: string
          sha256: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          case_id: string
          created_at?: string
          file_size: number
          id?: string
          mime_type: string
          original_name: string
          review_status?: string
          sha256: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          case_id?: string
          created_at?: string
          file_size?: number
          id?: string
          mime_type?: string
          original_name?: string
          review_status?: string
          sha256?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "ll_case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "ll_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      ll_cases: {
        Row: {
          applicant_id: string
          country_code: string
          created_at: string
          id: string
          service_id: string
          status: string
          subject: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          applicant_id: string
          country_code: string
          created_at?: string
          id?: string
          service_id: string
          status?: string
          subject: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          country_code?: string
          created_at?: string
          id?: string
          service_id?: string
          status?: string
          subject?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ll_cases_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "ll_services"
            referencedColumns: ["service_id"]
          },
        ]
      }
      ll_employer_profiles: {
        Row: {
          created_at: string
          organization_name: string
          review_status: string
          reviewed_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_name: string
          review_status?: string
          reviewed_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          organization_name?: string
          review_status?: string
          reviewed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ll_jobs: {
        Row: {
          approved_at: string | null
          created_at: string
          description: string
          employer_id: string
          employer_verified: boolean
          id: string
          status: string
          title: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          description: string
          employer_id: string
          employer_verified?: boolean
          id?: string
          status?: string
          title: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          description?: string
          employer_id?: string
          employer_verified?: boolean
          id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ll_jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "ll_employer_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ll_legal_sources: {
        Row: {
          id: string
          official_url: string | null
          public_release: boolean
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          service_id: string | null
          source_sha256: string | null
          source_type: string
          title: string
        }
        Insert: {
          id?: string
          official_url?: string | null
          public_release?: boolean
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_id?: string | null
          source_sha256?: string | null
          source_type: string
          title: string
        }
        Update: {
          id?: string
          official_url?: string | null
          public_release?: boolean
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_id?: string | null
          source_sha256?: string | null
          source_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ll_legal_sources_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "ll_services"
            referencedColumns: ["service_id"]
          },
        ]
      }
      ll_operator_roles: {
        Row: {
          approved_at: string
          approved_by: string | null
          role: string
          user_id: string
        }
        Insert: {
          approved_at?: string
          approved_by?: string | null
          role: string
          user_id: string
        }
        Update: {
          approved_at?: string
          approved_by?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ll_professional_profiles: {
        Row: {
          created_at: string
          service_description: string
          user_id: string
          verification_at: string | null
          verification_status: string
        }
        Insert: {
          created_at?: string
          service_description: string
          user_id: string
          verification_at?: string | null
          verification_status?: string
        }
        Update: {
          created_at?: string
          service_description?: string
          user_id?: string
          verification_at?: string | null
          verification_status?: string
        }
        Relationships: []
      }
      ll_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          preferred_language: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          preferred_language?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          preferred_language?: string
          user_id?: string
        }
        Relationships: []
      }
      ll_proposals: {
        Row: {
          bidder_id: string
          created_at: string
          id: string
          job_id: string
          proposal_body: string
          status: string
        }
        Insert: {
          bidder_id: string
          created_at?: string
          id?: string
          job_id: string
          proposal_body: string
          status?: string
        }
        Update: {
          bidder_id?: string
          created_at?: string
          id?: string
          job_id?: string
          proposal_body?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ll_proposals_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "ll_professional_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ll_proposals_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "ll_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ll_services: {
        Row: {
          created_at: string
          group_id: string
          last_reviewed_at: string | null
          legacy_category: string | null
          legally_approved: boolean
          publication_status: string
          service_id: string
          service_name: string
          source_sha256: string | null
        }
        Insert: {
          created_at?: string
          group_id: string
          last_reviewed_at?: string | null
          legacy_category?: string | null
          legally_approved?: boolean
          publication_status?: string
          service_id: string
          service_name: string
          source_sha256?: string | null
        }
        Update: {
          created_at?: string
          group_id?: string
          last_reviewed_at?: string | null
          legacy_category?: string | null
          legally_approved?: boolean
          publication_status?: string
          service_id?: string
          service_name?: string
          source_sha256?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
