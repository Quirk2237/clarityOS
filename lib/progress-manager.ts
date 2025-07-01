import { Session } from "@supabase/supabase-js";
import {
  LocalProgressStorage,
  LocalQuestionStorage,
  LocalAIStorage,
  LocalBrandPurposeStorage,
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
    updates: ProgressUpdate,
    sectionId?: string,
    questionId?: string
  ): Promise<any> {
    if (this.isAuthenticated && this.userId) {
      // Save to database
      return await updateUserProgress(
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
    } else {
      // Save to local storage
      return await LocalProgressStorage.updateProgress(
        cardId,
        updates,
        sectionId,
        questionId
      );
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
        console.error('Error getting authenticated card progress:', error);
        return { progress: 0, total: 2, status: 'not_started' };
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
      return await saveAIConversation(
        this.userId,
        cardId,
        conversationData,
        currentStep,
        isCompleted
      );
    } else {
      // Save to local storage
      return await LocalAIStorage.saveConversation(
        cardId,
        conversationData,
        currentStep,
        isCompleted
      );
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
} 