import { Session } from "@supabase/supabase-js";
import {
  LocalProgressStorage,
  LocalQuestionStorage,
  LocalAIStorage,
  LocalBrandPurposeStorage,
  CardCacheStorage,
  LocalUserProgress,
  LocalQuestionAttempt,
  LocalAIConversation,
  LocalBrandPurposeStatement,
} from "./local-storage";
import {
  updateUserProgress,
  recordQuestionAttempt,
  saveAIConversation,
  saveBrandPurposeStatement,
  getUserProgress,
  getAIConversation,
  getCurrentBrandPurposeStatement,
  getAllCardsWithProgress,
  getCardProgress,
  checkAndUpdateCardCompletion,
  getActiveCards
} from "./database-helpers";
import { Database } from "./database.types";

type Tables = Database["public"]["Tables"];

export interface ProgressUpdate {
  status?: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  completedAt?: string;
  questionId?: string;
}

export interface CardWithProgress {
  id: string;
  name: string;
  slug: string;
  description: string;
  order_index: number;
  image_url: string | null;
  color: string | null;
  progress: number;
  total: number;
  status: string;
  card_status?: "open" | "coming_soon";
  card_sections: { id: any; type: any; }[];
}

export class ProgressManager {
  private isAuthenticated: boolean;
  private userId?: string;

  constructor(session?: Session | null) {
    this.isAuthenticated = !!session?.user;
    this.userId = session?.user?.id;
  }

  // Progress Operations
  async updateProgress(
    cardId: string,
    updates: Partial<LocalUserProgress>,
    sectionId?: string,
    questionId?: string
  ): Promise<any> {
    if (this.isAuthenticated && this.userId) {
      // Save to database
      const result = await updateUserProgress(
        this.userId,
        cardId,
        {
          status: updates.status,
          score: updates.score,
          total_questions: updates.totalQuestions,
          correct_answers: updates.correctAnswers,
          completed_at: updates.completedAt,
          question_id: updates.questionId,
        },
        sectionId,
        questionId
      );

      // Check if card should be marked as completed
      if (updates.status === 'completed') {
        await checkAndUpdateCardCompletion(this.userId, cardId);
      }

      // IMPORTANT: Clear cache when progress is updated so UI shows fresh data
      await this.clearCardsCache();

      return result;
    } else {
      // Save to local storage
      const result = await LocalProgressStorage.updateProgress(
        cardId,
        updates,
        sectionId,
        questionId
      );

      // Also clear cache for unauthenticated users
      await this.clearCardsCache();

      return result;
    }
  }

  async getProgress(cardId?: string): Promise<any> {
    if (this.isAuthenticated && this.userId) {
      return await getUserProgress(this.userId, cardId);
    } else {
      const localProgress = await LocalProgressStorage.getProgress(cardId);
      return { data: localProgress, error: null };
    }
  }

  async getCardProgress(cardId: string): Promise<{
    progress: number;
    total: number;
    status: string;
  }> {
    if (this.isAuthenticated && this.userId) {
      // For authenticated users, we need to get the card slug first
      // This is a simplified approach - in practice you might want to cache this
      try {
        const progressData = await getCardProgress(this.userId, cardId);
        return progressData;
      } catch (error) {
        // Handle error silently
        return { progress: 0, total: 0, status: "not_started" };
      }
    } else {
      return await LocalProgressStorage.getCardProgress(cardId);
    }
  }

  async getAllCardsWithProgress(): Promise<CardWithProgress[]> {
    if (this.isAuthenticated && this.userId) {
      const { data, error } = await getAllCardsWithProgress(this.userId);
      if (error) {
        console.error('Error getting cards with progress:', error);
        return [];
      }
      return data || [];
    } else {
      // For unauthenticated users, get local progress
      const localProgress = await LocalProgressStorage.getProgress();
      
      // Group progress by card and calculate totals
      const cardProgressMap = new Map<string, {
        progress: number;
        total: number;
        status: string;
      }>();

      for (const progress of localProgress) {
        const existing = cardProgressMap.get(progress.cardId) || {
          progress: 0,
          total: 2, // Assume 2 sections per card
          status: 'not_started'
        };

        if (progress.status === 'completed') {
          existing.progress += 1;
        }

        if (existing.progress > 0 && existing.progress < existing.total) {
          existing.status = 'in_progress';
        } else if (existing.progress === existing.total) {
          existing.status = 'completed';
        }

        cardProgressMap.set(progress.cardId, existing);
      }

      // Convert to the expected format
      // Note: This would need to be merged with actual card data from the database
      // For now, return empty array as cards are fetched separately
      return [];
    }
  }

  /**
   * Gets cards with caching support - loads from cache immediately, fetches fresh data in background
   * Returns: { cards: CardWithProgress[], fromCache: boolean }
   */
  async getAllCardsWithCaching(): Promise<{ 
    cards: CardWithProgress[], 
    fromCache: boolean 
  }> {
    try {
      // Check for cached cards first
      const cachedCards = await CardCacheStorage.getCachedCards();
      if (cachedCards && cachedCards.length > 0) {
        return { cards: cachedCards, fromCache: true };
      }

      // If no cache, fetch from appropriate source
      if (this.userId) {
        // Authenticated user - get cards with progress from database
        const { data: cards, error } = await getAllCardsWithProgress(this.userId);
        if (error) {
          return { cards: [], fromCache: false };
        }
        
        // Cache the results for future use
        await CardCacheStorage.setCachedCards(cards || []);
        return { cards: cards || [], fromCache: false };
      } else {
        // Unauthenticated user - fetch cards and merge with local progress
        const cards = await this.fetchAndCacheCards();
        return { cards, fromCache: false };
      }
    } catch (error) {
      console.error('Error in getAllCardsWithCaching:', error);
      return { cards: [], fromCache: false };
    }
  }

  /**
   * Fetches fresh cards from database and caches them
   */
  private async fetchAndCacheCards(): Promise<CardWithProgress[]> {
    try {
      let rawCards: any[] = [];

      if (this.isAuthenticated && this.userId) {
        // Authenticated user - get cards with progress from database
        console.log('Fetching cards for authenticated user:', this.userId);
        const { data, error } = await getAllCardsWithProgress(this.userId);
        if (error) {
          console.error('Error getting authenticated cards:', error);
          return [];
        }
        rawCards = data || [];
        console.log('Authenticated cards fetched:', rawCards.length);
        
        // Cache the raw cards data for future use
        await CardCacheStorage.setCachedCards(rawCards);
        return rawCards;
      } else {
        // Unauthenticated user - get cards from database and merge with local progress
        console.log('Fetching cards for unauthenticated user');
        const { data, error } = await getActiveCards();
        if (error) {
          console.error('Error getting cards:', error);
          return [];
        }
        
        rawCards = data || [];
        console.log('Unauthenticated cards fetched:', rawCards.length, 'cards:', rawCards.map(c => ({ name: c.name, status: c.status })));
        
        // Cache the raw cards
        await CardCacheStorage.setCachedCards(rawCards);
        
        // Merge with local progress
        const cardsWithProgress = await this.mergeCardsWithProgress(rawCards);
        console.log('Cards after merging progress:', cardsWithProgress.length);
        return cardsWithProgress;
      }
    } catch (error) {
      console.error('Error fetching and caching cards:', error);
      return [];
    }
  }

  /**
   * Merges raw cards data with local progress for unauthenticated users
   */
  private async mergeCardsWithProgress(rawCards: any[]): Promise<CardWithProgress[]> {
    if (this.isAuthenticated) {
      // For authenticated users, cards already have progress
      console.log('Authenticated user - returning cards as-is');
      return rawCards;
    }

    console.log('Merging local progress for unauthenticated user. Raw cards:', rawCards.length);

    // For unauthenticated users, merge with local progress
    const cardsWithProgress: CardWithProgress[] = [];

    for (const card of rawCards) {
      const localProgress = await this.getCardProgress(card.id);
      console.log(`Card ${card.name}: progress=${localProgress.progress}, total=${localProgress.total}, status=${localProgress.status}`);
      
      cardsWithProgress.push({
        id: card.id,
        name: card.name,
        slug: card.slug,
        description: card.description,
        order_index: card.order_index,
        image_url: card.image_url,
        color: card.color,
        progress: localProgress.progress,
        total: localProgress.total,
        status: localProgress.status,
        card_status: card.status, // Map database 'status' to 'card_status' for UI
        card_sections: card.card_sections || [],
      });
    }

    console.log('Final merged cards:', cardsWithProgress.length);
    return cardsWithProgress;
  }

  /**
   * Refreshes cards in background without blocking UI
   */
  private refreshCardsInBackground(): void {
    // Don't await this - let it run in background
    this.fetchAndCacheCards().catch(error => {
      console.error('Background card refresh failed:', error);
    });
  }

  // Question Attempt Operations
  async recordQuestionAttempt(
    questionId: string,
    selectedAnswerId?: string,
    openEndedAnswer?: string,
    isCorrect?: boolean,
    pointsEarned: number = 0
  ): Promise<any> {
    if (this.isAuthenticated && this.userId) {
      // Save to database
      return await recordQuestionAttempt(
        this.userId,
        questionId,
        selectedAnswerId,
        openEndedAnswer,
        isCorrect,
        pointsEarned
      );
    } else {
      // Save to local storage
      return await LocalQuestionStorage.recordAttempt(
        questionId,
        selectedAnswerId,
        openEndedAnswer,
        isCorrect,
        pointsEarned
      );
    }
  }

  // AI Conversation Operations
  async saveAIConversation(
    cardId: string,
    conversationData: any,
    currentStep: string,
    isCompleted: boolean = false
  ): Promise<any> {
    if (this.isAuthenticated && this.userId) {
      // Save to database
      const result = await saveAIConversation(
        this.userId,
        cardId,
        conversationData,
        currentStep,
        isCompleted
      );
      
      // Clear cache when conversation state changes, especially when completed
      if (isCompleted) {
        await this.clearCardsCache();
      }
      
      return result;
    } else {
      // Save to local storage
      const result = await LocalAIStorage.saveConversation(
        cardId,
        conversationData,
        currentStep,
        isCompleted
      );
      
      // Clear cache for local storage too when completed
      if (isCompleted) {
        await this.clearCardsCache();
      }
      
      return result;
    }
  }

  async getAIConversation(cardId: string): Promise<any> {
    if (this.isAuthenticated && this.userId) {
      return await getAIConversation(this.userId, cardId);
    } else {
      const conversation = await LocalAIStorage.getConversation(cardId);
      return { data: conversation, error: null };
    }
  }

  // Brand Purpose Operations
  async saveBrandPurposeStatement(
    statementText: string,
    audienceScore: number,
    benefitScore: number,
    beliefScore: number,
    impactScore: number
  ): Promise<any> {
    if (this.isAuthenticated && this.userId) {
      // Save to database
      return await saveBrandPurposeStatement(
        this.userId,
        statementText,
        audienceScore,
        benefitScore,
        beliefScore,
        impactScore
      );
    } else {
      // Save to local storage
      return await LocalBrandPurposeStorage.saveStatement(
        statementText,
        audienceScore,
        benefitScore,
        beliefScore,
        impactScore
      );
    }
  }

  async getCurrentBrandPurposeStatement(): Promise<any> {
    if (this.isAuthenticated && this.userId) {
      return await getCurrentBrandPurposeStatement(this.userId);
    } else {
      const statement = await LocalBrandPurposeStorage.getCurrentStatement();
      return { data: statement, error: null };
    }
  }

  // Utility methods
  // Reset Progress Operations
  async resetCardProgress(cardId: string): Promise<void> {
    if (this.isAuthenticated && this.userId) {
      // Reset in database - import functions dynamically to avoid circular imports
      const {
        deleteUserProgress,
        deleteQuestionAttemptsForCard,
        deleteAIConversation,
      } = await import('./database-helpers');
      
      try {
        // Delete all progress for this card
        await deleteUserProgress(this.userId, cardId);
        await deleteQuestionAttemptsForCard(this.userId, cardId);
        await deleteAIConversation(this.userId, cardId);
        
        // Clear cache so UI shows updated (reset) progress
        await this.clearCardsCache();
      } catch (error) {
        console.error('Error resetting card progress in database:', error);
        throw error;
      }
    } else {
      // Reset in local storage
      try {
        await LocalProgressStorage.clearCardProgress(cardId);
        await LocalQuestionStorage.clearCardQuestionAttempts(cardId);
        await LocalAIStorage.clearCardAIConversations(cardId);
        
        // Clear cache for local storage too
        await this.clearCardsCache();
      } catch (error) {
        console.error('Error resetting card progress in local storage:', error);
        throw error;
      }
    }
  }

  isOfflineMode(): boolean {
    return !this.isAuthenticated;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  private async clearCardsCache(): Promise<void> {
    try {
      await CardCacheStorage.clearCache();
    } catch (error) {
      console.error('Error clearing cards cache:', error);
      // Don't throw - cache clearing failure shouldn't break the app
    }
  }

  /**
   * Forces fresh data retrieval bypassing cache - use when you need up-to-date progress
   */
  async getAllCardsWithFreshData(): Promise<CardWithProgress[]> {
    try {
      // Clear cache first to ensure fresh data
      await this.clearCardsCache();
      
      if (this.isAuthenticated && this.userId) {
        const { data, error } = await getAllCardsWithProgress(this.userId);
        if (error) {
          console.error('Error getting fresh cards with progress:', error);
          return [];
        }
        
        // Cache the fresh data for future use
        await CardCacheStorage.setCachedCards(data || []);
        return data || [];
      } else {
        // For unauthenticated users, fetch cards and merge with local progress
        return await this.fetchAndCacheCards();
      }
    } catch (error) {
      console.error('Error getting fresh cards data:', error);
      return [];
    }
  }
} 