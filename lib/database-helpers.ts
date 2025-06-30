import { supabase } from '@/config/supabase'
import { Database } from './database.types'

type Tables = Database['public']['Tables']

// Export the supabase client for direct use
export { supabase }

// Helper function to get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// User Profile Operations
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

export async function createUserProfile(
  userId: string,
  email: string,
  name?: string,
  companyName?: string
) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      name: name || null,
      company_name: companyName || null,
      subscription_status: 'free',
    })
    .select()
    .single()
  
  return { data, error }
}

export async function ensureUserProfile(userId: string, email: string) {
  // Check if profile exists
  const { data: existingProfile, error: getError } = await getUserProfile(userId)
  
  if (getError && getError.code !== 'PGRST116') {
    // If error is not "not found", return the error
    return { data: null, error: getError }
  }
  
  if (existingProfile) {
    // Profile already exists
    return { data: existingProfile, error: null }
  }
  
  // Create profile if it doesn't exist
  return await createUserProfile(userId, email)
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<Tables['profiles']['Update']>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return { data, error }
}

// Onboarding Operations
export async function saveOnboardingResponse(
  userId: string,
  goal: Tables['onboarding_responses']['Insert']['goal'],
  goalOtherText: string | null,
  businessStage: Tables['onboarding_responses']['Insert']['business_stage'],
  businessStageOtherText: string | null
) {
  const { data, error } = await supabase
    .from('onboarding_responses')
    .upsert({
      user_id: userId,
      goal,
      goal_other_text: goalOtherText,
      business_stage: businessStage,
      business_stage_other_text: businessStageOtherText,
      completed_at: new Date().toISOString()
    })
    .select()
    .single()
  
  return { data, error }
}

export async function getOnboardingResponse(userId: string) {
  const { data, error } = await supabase
    .from('onboarding_responses')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

// Cards and Content Operations
export async function getActiveCards() {
  const { data, error } = await supabase
    .from('cards')
    .select(`
      *,
      card_sections (
        *,
        questions (
          *,
          answer_choices (*)
        )
      )
    `)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('order_index')
  
  return { data, error }
}

export async function getCard(slug: string) {
  const { data, error } = await supabase
    .from('cards')
    .select(`
      *,
      card_sections (
        *,
        questions (
          *,
          answer_choices (*)
        )
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .single()
  
  return { data, error }
}

// Progress Tracking Operations
export async function getUserProgress(userId: string, cardId?: string) {
  let query = supabase
    .from('user_progress')
    .select(`
      *,
      cards (name, slug),
      card_sections (name, type),
      questions (question_text)
    `)
    .eq('user_id', userId)
  
  if (cardId) {
    query = query.eq('card_id', cardId)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  return { data, error }
}

export async function updateUserProgress(
  userId: string,
  cardId: string,
  updates: Partial<Tables['user_progress']['Update']>,
  sectionId?: string,
  questionId?: string
) {
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      card_id: cardId,
      section_id: sectionId,
      question_id: questionId,
      ...updates
    })
    .select()
    .single()
  
  return { data, error }
}

// Question Attempts Operations
export async function recordQuestionAttempt(
  userId: string,
  questionId: string,
  selectedAnswerId?: string,
  openEndedAnswer?: string,
  isCorrect?: boolean,
  pointsEarned: number = 0
) {
  const { data, error } = await supabase
    .from('question_attempts')
    .insert({
      user_id: userId,
      question_id: questionId,
      selected_answer_id: selectedAnswerId,
      open_ended_answer: openEndedAnswer,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      attempt_number: 1 // TODO: Calculate actual attempt number
    })
    .select()
    .single()
  
  return { data, error }
}

// AI Conversations Operations
export async function saveAIConversation(
  userId: string,
  cardId: string,
  conversationData: any,
  currentStep: string,
  isCompleted: boolean = false
) {
  const { data, error } = await supabase
    .from('ai_conversations')
    .upsert({
      user_id: userId,
      card_id: cardId,
      conversation_data: conversationData,
      current_step: currentStep,
      is_completed: isCompleted
    })
    .select()
    .single()
  
  return { data, error }
}

export async function getAIConversation(userId: string, cardId: string) {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .single()
  
  return { data, error }
}

// Brand Purpose Statements Operations
export async function saveBrandPurposeStatement(
  userId: string,
  statementText: string,
  audienceScore: number,
  benefitScore: number,
  beliefScore: number,
  impactScore: number
) {
  const { data, error } = await supabase
    .from('brand_purpose_statements')
    .insert({
      user_id: userId,
      statement_text: statementText,
      audience_score: audienceScore,
      benefit_score: benefitScore,
      belief_score: beliefScore,
      impact_score: impactScore,
      is_current: true
    })
    .select()
    .single()
  
  return { data, error }
}

export async function getCurrentBrandPurposeStatement(userId: string) {
  const { data, error } = await supabase
    .from('brand_purpose_statements')
    .select('*')
    .eq('user_id', userId)
    .eq('is_current', true)
    .single()
  
  return { data, error }
}

// Session Tracking Operations
export async function startUserSession(userId: string, sessionStart: string = new Date().toISOString()) {
  const { data, error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      session_start: sessionStart
    })
    .select()
    .single()
  
  return { data, error }
}

export async function endUserSession(
  sessionId: string,
  sessionEnd: string = new Date().toISOString(),
  cardsVisited?: string[],
  actionsTaken?: any
) {
  const { data, error } = await supabase
    .from('user_sessions')
    .update({
      session_end: sessionEnd,
      cards_visited: cardsVisited,
      actions_taken: actionsTaken
    })
    .eq('id', sessionId)
    .select()
    .single()
  
  return { data, error }
}

// Achievements Operations
export async function awardAchievement(
  userId: string,
  achievementType: Tables['achievements']['Insert']['achievement_type'],
  achievementData: any = {}
) {
  const { data, error } = await supabase
    .from('achievements')
    .insert({
      user_id: userId,
      achievement_type: achievementType,
      achievement_data: achievementData
    })
    .select()
    .single()
  
  return { data, error }
}

export async function getUserAchievements(userId: string) {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
  
  return { data, error }
}

/**
 * Check if a user has completed onboarding
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('onboarding_responses')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
} 