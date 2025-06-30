export interface Database {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					email: string;
					name: string | null;
					company_name: string | null;
					subscription_status: "free" | "premium" | "cancelled";
					created_at: string;
					updated_at: string;
					deleted_at: string | null;
				};
				Insert: {
					id: string;
					email: string;
					name?: string | null;
					company_name?: string | null;
					subscription_status?: "free" | "premium" | "cancelled";
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
				Update: {
					id?: string;
					email?: string;
					name?: string | null;
					company_name?: string | null;
					subscription_status?: "free" | "premium" | "cancelled";
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
			};
			onboarding_responses: {
				Row: {
					id: string;
					user_id: string;
					goal:
						| "get_clarity"
						| "build_confidence"
						| "explain_what_i_do"
						| "boost_career"
						| "other";
					goal_other_text: string | null;
					business_stage:
						| "conceptualizing"
						| "just_launched"
						| "one_to_five_years"
						| "industry_pro"
						| "local_household_name";
					business_stage_other_text: string | null;
					completed_at: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					goal:
						| "get_clarity"
						| "build_confidence"
						| "explain_what_i_do"
						| "boost_career"
						| "other";
					goal_other_text?: string | null;
					business_stage:
						| "conceptualizing"
						| "just_launched"
						| "one_to_five_years"
						| "industry_pro"
						| "local_household_name";
					business_stage_other_text?: string | null;
					completed_at?: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					goal?:
						| "get_clarity"
						| "build_confidence"
						| "explain_what_i_do"
						| "boost_career"
						| "other";
					goal_other_text?: string | null;
					business_stage?:
						| "conceptualizing"
						| "just_launched"
						| "one_to_five_years"
						| "industry_pro"
						| "local_household_name";
					business_stage_other_text?: string | null;
					completed_at?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			cards: {
				Row: {
					id: string;
					name: string;
					slug: string;
					description: string | null;
					order_index: number;
					is_active: boolean;
					image_url: string | null;
					created_at: string;
					updated_at: string;
					deleted_at: string | null;
				};
				Insert: {
					id?: string;
					name: string;
					slug: string;
					description?: string | null;
					order_index: number;
					is_active?: boolean;
					image_url?: string | null;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
				Update: {
					id?: string;
					name?: string;
					slug?: string;
					description?: string | null;
					order_index?: number;
					is_active?: boolean;
					image_url?: string | null;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
			};
			card_sections: {
				Row: {
					id: string;
					card_id: string;
					name: string;
					type: "educational" | "guided";
					order_index: number;
					is_active: boolean;
					created_at: string;
					updated_at: string;
					deleted_at: string | null;
				};
				Insert: {
					id?: string;
					card_id: string;
					name: string;
					type: "educational" | "guided";
					order_index: number;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
				Update: {
					id?: string;
					card_id?: string;
					name?: string;
					type?: "educational" | "guided";
					order_index?: number;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
			};
			questions: {
				Row: {
					id: string;
					section_id: string;
					question_text: string;
					question_type: "multiple_choice" | "open_ended";
					order_index: number;
					is_active: boolean;
					created_at: string;
					updated_at: string;
					deleted_at: string | null;
				};
				Insert: {
					id?: string;
					section_id: string;
					question_text: string;
					question_type: "multiple_choice" | "open_ended";
					order_index: number;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
				Update: {
					id?: string;
					section_id?: string;
					question_text?: string;
					question_type?: "multiple_choice" | "open_ended";
					order_index?: number;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
			};
			answer_choices: {
				Row: {
					id: string;
					question_id: string;
					choice_text: string;
					is_correct: boolean;
					order_index: number;
					created_at: string;
					updated_at: string;
					deleted_at: string | null;
				};
				Insert: {
					id?: string;
					question_id: string;
					choice_text: string;
					is_correct?: boolean;
					order_index: number;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
				Update: {
					id?: string;
					question_id?: string;
					choice_text?: string;
					is_correct?: boolean;
					order_index?: number;
					created_at?: string;
					updated_at?: string;
					deleted_at?: string | null;
				};
			};
			user_progress: {
				Row: {
					id: string;
					user_id: string;
					card_id: string;
					section_id: string | null;
					question_id: string | null;
					status: "not_started" | "in_progress" | "completed";
					score: number | null;
					total_questions: number | null;
					correct_answers: number | null;
					started_at: string | null;
					completed_at: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					card_id: string;
					section_id?: string | null;
					question_id?: string | null;
					status?: "not_started" | "in_progress" | "completed";
					score?: number | null;
					total_questions?: number | null;
					correct_answers?: number | null;
					started_at?: string | null;
					completed_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					card_id?: string;
					section_id?: string | null;
					question_id?: string | null;
					status?: "not_started" | "in_progress" | "completed";
					score?: number | null;
					total_questions?: number | null;
					correct_answers?: number | null;
					started_at?: string | null;
					completed_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			question_attempts: {
				Row: {
					id: string;
					user_id: string;
					question_id: string;
					selected_answer_id: string | null;
					open_ended_answer: string | null;
					is_correct: boolean | null;
					points_earned: number;
					attempt_number: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					question_id: string;
					selected_answer_id?: string | null;
					open_ended_answer?: string | null;
					is_correct?: boolean | null;
					points_earned?: number;
					attempt_number?: number;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					question_id?: string;
					selected_answer_id?: string | null;
					open_ended_answer?: string | null;
					is_correct?: boolean | null;
					points_earned?: number;
					attempt_number?: number;
					created_at?: string;
				};
			};
			ai_conversations: {
				Row: {
					id: string;
					user_id: string;
					card_id: string;
					conversation_data: Json;
					current_step: string;
					is_completed: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					card_id: string;
					conversation_data?: Json;
					current_step?: string;
					is_completed?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					card_id?: string;
					conversation_data?: Json;
					current_step?: string;
					is_completed?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			brand_purpose_statements: {
				Row: {
					id: string;
					user_id: string;
					statement_text: string;
					version: number;
					audience_score: number;
					benefit_score: number;
					belief_score: number;
					impact_score: number;
					total_score: number;
					is_current: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					statement_text: string;
					version?: number;
					audience_score: number;
					benefit_score: number;
					belief_score: number;
					impact_score: number;
					total_score: number;
					is_current?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					statement_text?: string;
					version?: number;
					audience_score?: number;
					benefit_score?: number;
					belief_score?: number;
					impact_score?: number;
					total_score?: number;
					is_current?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			user_sessions: {
				Row: {
					id: string;
					user_id: string;
					session_start: string;
					session_end: string | null;
					total_time_seconds: number | null;
					cards_visited: string[] | null;
					actions_taken: Json | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					session_start: string;
					session_end?: string | null;
					total_time_seconds?: number | null;
					cards_visited?: string[] | null;
					actions_taken?: Json | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					session_start?: string;
					session_end?: string | null;
					total_time_seconds?: number | null;
					cards_visited?: string[] | null;
					actions_taken?: Json | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			achievements: {
				Row: {
					id: string;
					user_id: string;
					achievement_type:
						| "card_completed"
						| "perfect_score"
						| "streak"
						| "fast_learner";
					achievement_data: Json;
					earned_at: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					achievement_type:
						| "card_completed"
						| "perfect_score"
						| "streak"
						| "fast_learner";
					achievement_data?: Json;
					earned_at?: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					achievement_type?:
						| "card_completed"
						| "perfect_score"
						| "streak"
						| "fast_learner";
					achievement_data?: Json;
					earned_at?: string;
					created_at?: string;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}

export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];
