import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage Keys
export const STORAGE_KEYS = {
  USER_PROGRESS: 'canopy_user_progress',
  QUESTION_ATTEMPTS: 'canopy_question_attempts',
  AI_CONVERSATIONS: 'canopy_ai_conversations',
  BRAND_PURPOSE_STATEMENTS: 'canopy_brand_purpose_statements',
  ONBOARDING_RESPONSES: 'canopy_onboarding_responses',
  USER_SESSIONS: 'canopy_user_sessions',
  SYNC_QUEUE: 'canopy_sync_queue',
  CARDS_CACHE: 'canopy_cards_cache',
};

// Local Data Types
export interface LocalUserProgress {
  id: string;
  cardId: string;
  sectionId?: string;
  questionId?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalQuestionAttempt {
  id: string;
  questionId: string;
  selectedAnswerId?: string;
  openEndedAnswer?: string;
  isCorrect?: boolean;
  pointsEarned: number;
  attemptNumber: number;
  createdAt: string;
}

export interface LocalAIConversation {
  id: string;
  cardId: string;
  conversationData: any;
  currentStep: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocalBrandPurposeStatement {
  id: string;
  statementText: string;
  audienceScore: number;
  benefitScore: number;
  beliefScore: number;
  impactScore: number;
  version: number;
  isCurrent: boolean;
  createdAt: string;
}

export interface LocalOnboardingResponse {
  id: string;
  goal: string;
  goalOtherText?: string;
  businessStage: string;
  businessStageOtherText?: string;
  completedAt: string;
}

export interface LocalCardCache {
  cards: any[];
  cachedAt: string;
  expiresAt: string;
}

// Local Storage Manager
export class LocalStorage {
  static async getItem<T>(key: string): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting ${key} from local storage:`, error);
      return [];
    }
  }

  static async setItem<T>(key: string, data: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting ${key} in local storage:`, error);
      throw error;
    }
  }

  static async addItem<T extends { id: string }>(key: string, item: T): Promise<void> {
    try {
      const existingData = await this.getItem<T>(key);
      const updatedData = [...existingData, item];
      await this.setItem(key, updatedData);
    } catch (error) {
      console.error(`Error adding item to ${key}:`, error);
      throw error;
    }
  }

  static async updateItem<T extends { id: string }>(
    key: string, 
    id: string, 
    updates: Partial<T>
  ): Promise<void> {
    try {
      const existingData = await this.getItem<T>(key);
      const itemIndex = existingData.findIndex(item => item.id === id);
      
      if (itemIndex >= 0) {
        existingData[itemIndex] = { ...existingData[itemIndex], ...updates };
      } else {
        // If item doesn't exist, create it
        const newItem = { id, ...updates } as T;
        existingData.push(newItem);
      }
      
      await this.setItem(key, existingData);
    } catch (error) {
      console.error(`Error updating item in ${key}:`, error);
      throw error;
    }
  }

  static async removeItem<T extends { id: string }>(key: string, id: string): Promise<void> {
    try {
      const existingData = await this.getItem<T>(key);
      const filteredData = existingData.filter(item => item.id !== id);
      await this.setItem(key, filteredData);
    } catch (error) {
      console.error(`Error removing item from ${key}:`, error);
      throw error;
    }
  }

  static async clearAll(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing all local storage:', error);
      throw error;
    }
  }

  static async generateId(): Promise<string> {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Helper functions for specific data types
export const LocalProgressStorage = {
  async getProgress(cardId?: string): Promise<LocalUserProgress[]> {
    const allProgress = await LocalStorage.getItem<LocalUserProgress>(STORAGE_KEYS.USER_PROGRESS);
    return cardId ? allProgress.filter(p => p.cardId === cardId) : allProgress;
  },

  async updateProgress(
    cardId: string,
    updates: Partial<LocalUserProgress>,
    sectionId?: string,
    questionId?: string
  ): Promise<LocalUserProgress> {
    const progressId = `${cardId}_${sectionId || 'main'}`;
    const now = new Date().toISOString();
    
    const progressUpdate: LocalUserProgress = {
      id: progressId,
      cardId,
      sectionId,
      questionId,
      status: 'not_started',
      createdAt: now,
      updatedAt: now,
      ...updates,
    };

    await LocalStorage.updateItem(STORAGE_KEYS.USER_PROGRESS, progressId, progressUpdate);
    return progressUpdate;
  },

  async getCardProgress(cardId: string): Promise<{
    progress: number;
    total: number;
    status: string;
  }> {
    const cardProgress = await this.getProgress(cardId);
    const completedSections = cardProgress.filter(p => p.status === 'completed').length;
    
    // For now, assume each card has educational and guided sections
    const totalSections = 2;
    
    let status = 'not_started';
    if (completedSections > 0 && completedSections < totalSections) {
      status = 'in_progress';
    } else if (completedSections === totalSections) {
      status = 'completed';
    }

    return {
      progress: completedSections,
      total: totalSections,
      status,
    };
  },

  async clearCardProgress(cardId: string): Promise<void> {
    const allProgress = await LocalStorage.getItem<LocalUserProgress>(STORAGE_KEYS.USER_PROGRESS);
    const filteredProgress = allProgress.filter(p => p.cardId !== cardId);
    await LocalStorage.setItem(STORAGE_KEYS.USER_PROGRESS, filteredProgress);
  },
};

export const LocalQuestionStorage = {
  async recordAttempt(
    questionId: string,
    selectedAnswerId?: string,
    openEndedAnswer?: string,
    isCorrect?: boolean,
    pointsEarned: number = 0
  ): Promise<LocalQuestionAttempt> {
    const id = await LocalStorage.generateId();
    const attempt: LocalQuestionAttempt = {
      id,
      questionId,
      selectedAnswerId,
      openEndedAnswer,
      isCorrect,
      pointsEarned,
      attemptNumber: 1, // TODO: Calculate actual attempt number
      createdAt: new Date().toISOString(),
    };

    await LocalStorage.addItem(STORAGE_KEYS.QUESTION_ATTEMPTS, attempt);
    return attempt;
  },

  async getAttempts(questionId?: string): Promise<LocalQuestionAttempt[]> {
    const allAttempts = await LocalStorage.getItem<LocalQuestionAttempt>(STORAGE_KEYS.QUESTION_ATTEMPTS);
    return questionId ? allAttempts.filter(a => a.questionId === questionId) : allAttempts;
  },

  async clearCardQuestionAttempts(cardId: string): Promise<void> {
    // For now, we need to get card data to find question IDs
    // This is a simplified approach - in a real app you might want to store cardId with attempts
    const allAttempts = await LocalStorage.getItem<LocalQuestionAttempt>(STORAGE_KEYS.QUESTION_ATTEMPTS);
    // For now, we'll clear all attempts as we don't have card relationship in attempts
    // In a real implementation, you'd want to store cardId with attempts or look up questions
    await LocalStorage.setItem(STORAGE_KEYS.QUESTION_ATTEMPTS, []);
  },
};

export const LocalAIStorage = {
  async saveConversation(
    cardId: string,
    conversationData: any,
    currentStep: string,
    isCompleted: boolean = false
  ): Promise<LocalAIConversation> {
    const id = `ai_${cardId}`;
    const now = new Date().toISOString();
    
    const conversation: LocalAIConversation = {
      id,
      cardId,
      conversationData,
      currentStep,
      isCompleted,
      createdAt: now,
      updatedAt: now,
    };

    await LocalStorage.updateItem(STORAGE_KEYS.AI_CONVERSATIONS, id, conversation);
    return conversation;
  },

  async getConversation(cardId: string): Promise<LocalAIConversation | null> {
    const conversations = await LocalStorage.getItem<LocalAIConversation>(STORAGE_KEYS.AI_CONVERSATIONS);
    return conversations.find(c => c.cardId === cardId) || null;
  },

  async clearCardAIConversations(cardId: string): Promise<void> {
    const allConversations = await LocalStorage.getItem<LocalAIConversation>(STORAGE_KEYS.AI_CONVERSATIONS);
    const filteredConversations = allConversations.filter(c => c.cardId !== cardId);
    await LocalStorage.setItem(STORAGE_KEYS.AI_CONVERSATIONS, filteredConversations);
  },
};

export const LocalBrandPurposeStorage = {
  async saveStatement(
    statementText: string,
    audienceScore: number,
    benefitScore: number,
    beliefScore: number,
    impactScore: number
  ): Promise<LocalBrandPurposeStatement> {
    const id = await LocalStorage.generateId();
    const statement: LocalBrandPurposeStatement = {
      id,
      statementText,
      audienceScore,
      benefitScore,
      beliefScore,
      impactScore,
      version: 1,
      isCurrent: true,
      createdAt: new Date().toISOString(),
    };

    // Mark other statements as not current
    const existingStatements = await LocalStorage.getItem<LocalBrandPurposeStatement>(STORAGE_KEYS.BRAND_PURPOSE_STATEMENTS);
    const updatedStatements = existingStatements.map(s => ({ ...s, isCurrent: false }));
    updatedStatements.push(statement);
    
    await LocalStorage.setItem(STORAGE_KEYS.BRAND_PURPOSE_STATEMENTS, updatedStatements);
    return statement;
  },

  async getCurrentStatement(): Promise<LocalBrandPurposeStatement | null> {
    const statements = await LocalStorage.getItem<LocalBrandPurposeStatement>(STORAGE_KEYS.BRAND_PURPOSE_STATEMENTS);
    return statements.find(s => s.isCurrent) || null;
  },
};

export const CardCacheStorage = {
  // Cache expires after 5 minutes
  CACHE_DURATION_MS: 5 * 60 * 1000,

  async getCachedCards(): Promise<any[] | null> {
    try {
      const cacheData = await AsyncStorage.getItem(STORAGE_KEYS.CARDS_CACHE);
      if (!cacheData) return null;

      const cache: LocalCardCache = JSON.parse(cacheData);
      const now = new Date().getTime();
      const expiresAt = new Date(cache.expiresAt).getTime();

      // Check if cache is expired
      if (now > expiresAt) {
        console.log('🕒 Card cache expired, removing...');
        await AsyncStorage.removeItem(STORAGE_KEYS.CARDS_CACHE);
        return null;
      }

      console.log('✅ Loading cards from cache');
      return cache.cards;
    } catch (error) {
      console.error('Error getting cached cards:', error);
      return null;
    }
  },

  async setCachedCards(cards: any[]): Promise<void> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.CACHE_DURATION_MS);

      const cache: LocalCardCache = {
        cards,
        cachedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.CARDS_CACHE, JSON.stringify(cache));
      console.log('💾 Cards cached successfully');
    } catch (error) {
      console.error('Error caching cards:', error);
      throw error;
    }
  },

  async isCacheValid(): Promise<boolean> {
    try {
      const cacheData = await AsyncStorage.getItem(STORAGE_KEYS.CARDS_CACHE);
      if (!cacheData) return false;

      const cache: LocalCardCache = JSON.parse(cacheData);
      const now = new Date().getTime();
      const expiresAt = new Date(cache.expiresAt).getTime();

      return now <= expiresAt;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  },

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CARDS_CACHE);
      console.log('🗑 Card cache cleared');
    } catch (error) {
      console.error('Error clearing card cache:', error);
      throw error;
    }
  },
}; 