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
      achievements: {
        Row: {
          achievement_data: Json
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          created_at: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_data?: Json
          achievement_type: Database["public"]["Enums"]["achievement_type"]
          created_at?: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_data?: Json
          achievement_type?: Database["public"]["Enums"]["achievement_type"]
          created_at?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          card_id: string
          conversation_data: Json
          created_at: string
          current_step: string
          id: string
          is_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          conversation_data?: Json
          created_at?: string
          current_step?: string
          id?: string
          is_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          conversation_data?: Json
          created_at?: string
          current_step?: string
          id?: string
          is_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      answer_choices: {
        Row: {
          choice_text: string
          created_at: string
          deleted_at: string | null
          icon: string | null
          id: string
          is_correct: boolean
          order_index: number
          question_id: string
          updated_at: string
        }
        Insert: {
          choice_text: string
          created_at?: string
          deleted_at?: string | null
          icon?: string | null
          id?: string
          is_correct?: boolean
          order_index: number
          question_id: string
          updated_at?: string
        }
        Update: {
          choice_text?: string
          created_at?: string
          deleted_at?: string | null
          icon?: string | null
          id?: string
          is_correct?: boolean
          order_index?: number
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_choices_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_purpose_statements: {
        Row: {
          audience_score: number
          belief_score: number
          benefit_score: number
          created_at: string
          id: string
          impact_score: number
          is_current: boolean
          statement_text: string
          total_score: number | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          audience_score: number
          belief_score: number
          benefit_score: number
          created_at?: string
          id?: string
          impact_score: number
          is_current?: boolean
          statement_text: string
          total_score?: number | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          audience_score?: number
          belief_score?: number
          benefit_score?: number
          created_at?: string
          id?: string
          impact_score?: number
          is_current?: boolean
          statement_text?: string
          total_score?: number | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "brand_purpose_statements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      card_sections: {
        Row: {
          card_id: string
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          name: string
          order_index: number
          type: Database["public"]["Enums"]["section_type"]
          updated_at: string
        }
        Insert: {
          card_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          order_index: number
          type: Database["public"]["Enums"]["section_type"]
          updated_at?: string
        }
        Update: {
          card_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          type?: Database["public"]["Enums"]["section_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_sections_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          color: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          initial_question: string | null
          is_active: boolean
          name: string
          order_index: number
          slug: string
          status: Database["public"]["Enums"]["card_status"]
          system_prompt: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          initial_question?: string | null
          is_active?: boolean
          name: string
          order_index: number
          slug: string
          status?: Database["public"]["Enums"]["card_status"]
          system_prompt?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          initial_question?: string | null
          is_active?: boolean
          name?: string
          order_index?: number
          slug?: string
          status?: Database["public"]["Enums"]["card_status"]
          system_prompt?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      onboarding_responses: {
        Row: {
          business_stage: Database["public"]["Enums"]["business_stage"]
          business_stage_other_text: string | null
          completed_at: string
          created_at: string
          goal: Database["public"]["Enums"]["goal_type"]
          goal_other_text: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_stage: Database["public"]["Enums"]["business_stage"]
          business_stage_other_text?: string | null
          completed_at?: string
          created_at?: string
          goal: Database["public"]["Enums"]["goal_type"]
          goal_other_text?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_stage?: Database["public"]["Enums"]["business_stage"]
          business_stage_other_text?: string | null
          completed_at?: string
          created_at?: string
          goal?: Database["public"]["Enums"]["goal_type"]
          goal_other_text?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          deleted_at: string | null
          email: string
          id: string
          name: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          id?: string
          name?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          id?: string
          name?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          attempt_number: number
          created_at: string
          id: string
          is_correct: boolean | null
          open_ended_answer: string | null
          points_earned: number
          question_id: string
          selected_answer_id: string | null
          user_id: string
        }
        Insert: {
          attempt_number?: number
          created_at?: string
          id?: string
          is_correct?: boolean | null
          open_ended_answer?: string | null
          points_earned?: number
          question_id: string
          selected_answer_id?: string | null
          user_id: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          id?: string
          is_correct?: boolean | null
          open_ended_answer?: string | null
          points_earned?: number
          question_id?: string
          selected_answer_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_selected_answer_id_fkey"
            columns: ["selected_answer_id"]
            isOneToOne: false
            referencedRelation: "answer_choices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_active: boolean
          order_index: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          section_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          order_index: number
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          section_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          section_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "card_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          card_id: string
          completed_at: string | null
          correct_answers: number | null
          created_at: string
          id: string
          question_id: string | null
          score: number | null
          section_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["progress_status"]
          total_questions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          question_id?: string | null
          score?: number | null
          section_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["progress_status"]
          total_questions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string
          id?: string
          question_id?: string | null
          score?: number | null
          section_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["progress_status"]
          total_questions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "card_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          actions_taken: Json
          cards_visited: string[] | null
          created_at: string
          id: string
          session_end: string | null
          session_start: string
          total_time_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actions_taken?: Json
          cards_visited?: string[] | null
          created_at?: string
          id?: string
          session_end?: string | null
          session_start?: string
          total_time_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actions_taken?: Json
          cards_visited?: string[] | null
          created_at?: string
          id?: string
          session_end?: string | null
          session_start?: string
          total_time_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      achievement_type:
        | "card_completed"
        | "perfect_score"
        | "streak"
        | "fast_learner"
      business_stage:
        | "conceptualizing"
        | "just_launched"
        | "one_to_five_years"
        | "industry_pro"
        | "local_household_name"
      card_status: "open" | "coming_soon" | "completed"
      goal_type:
        | "get_clarity"
        | "build_confidence"
        | "explain_what_i_do"
        | "boost_career"
        | "other"
      progress_status: "not_started" | "in_progress" | "completed"
      question_type: "multiple_choice" | "open_ended"
      section_type: "educational" | "guided"
      subscription_status: "free" | "premium" | "cancelled"
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
    Enums: {
      achievement_type: [
        "card_completed",
        "perfect_score",
        "streak",
        "fast_learner",
      ],
      business_stage: [
        "conceptualizing",
        "just_launched",
        "one_to_five_years",
        "industry_pro",
        "local_household_name",
      ],
      card_status: ["open", "coming_soon", "completed"],
      goal_type: [
        "get_clarity",
        "build_confidence",
        "explain_what_i_do",
        "boost_career",
        "other",
      ],
      progress_status: ["not_started", "in_progress", "completed"],
      question_type: ["multiple_choice", "open_ended"],
      section_type: ["educational", "guided"],
      subscription_status: ["free", "premium", "cancelled"],
    },
  },
} as const
