import { Session } from "@supabase/supabase-js";
import {
	LocalStorage,
	STORAGE_KEYS,
	LocalUserProgress,
	LocalAIConversation,
	LocalBrandPurposeStatement,
	LocalQuestionAttempt,
} from "./local-storage";
import {
	updateUserProgress,
	saveAIConversation,
	saveBrandPurposeStatement,
	recordQuestionAttempt,
} from "./database-helpers";

interface MigrationResult {
	success: boolean;
	migratedItems: {
		progress: number;
		conversations: number;
		statements: number;
		attempts: number;
	};
	errors: string[];
}

export class DataMigrator {
	private session: Session;
	private userId: string;

	constructor(session: Session) {
		this.session = session;
		this.userId = session.user.id;
	}

	async migrateAllLocalData(): Promise<MigrationResult> {
		const result: MigrationResult = {
			success: true,
			migratedItems: {
				progress: 0,
				conversations: 0,
				statements: 0,
				attempts: 0,
			},
			errors: [],
		};

		console.log(`🔄 Starting data migration for user: ${this.userId}`);

		try {
			// Migrate user progress
			await this.migrateProgress(result);
			
			// Migrate AI conversations
			await this.migrateAIConversations(result);
			
			// Migrate brand purpose statements
			await this.migrateBrandStatements(result);
			
			// Migrate question attempts
			await this.migrateQuestionAttempts(result);

			// Clear local storage if migration was successful
			if (result.success && result.errors.length === 0) {
				await this.clearLocalData();
				console.log(`✅ Migration completed successfully. Items migrated:`, result.migratedItems);
			}

		} catch (error) {
			result.success = false;
			result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
			console.error('❌ Migration failed:', error);
		}

		return result;
	}

	private async migrateProgress(result: MigrationResult): Promise<void> {
		try {
			const localProgress = await LocalStorage.getItem<LocalUserProgress>(STORAGE_KEYS.USER_PROGRESS);
			
			for (const progress of localProgress) {
				try {
					await updateUserProgress(
						this.userId,
						progress.cardId,
						{
							status: progress.status,
							score: progress.score,
							total_questions: progress.totalQuestions,
							correct_answers: progress.correctAnswers,
							completed_at: progress.completedAt,
						},
						progress.sectionId,
						progress.questionId
					);
					result.migratedItems.progress++;
				} catch (error) {
					result.errors.push(`Failed to migrate progress ${progress.id}: ${error}`);
				}
			}
		} catch (error) {
			result.errors.push(`Failed to retrieve local progress: ${error}`);
		}
	}

	private async migrateAIConversations(result: MigrationResult): Promise<void> {
		try {
			const localConversations = await LocalStorage.getItem<LocalAIConversation>(STORAGE_KEYS.AI_CONVERSATIONS);
			
			for (const conversation of localConversations) {
				try {
					await saveAIConversation(
						this.userId,
						conversation.cardId,
						conversation.conversationData,
						conversation.currentStep,
						conversation.isCompleted
					);
					result.migratedItems.conversations++;
				} catch (error) {
					result.errors.push(`Failed to migrate conversation ${conversation.id}: ${error}`);
				}
			}
		} catch (error) {
			result.errors.push(`Failed to retrieve local conversations: ${error}`);
		}
	}

	private async migrateBrandStatements(result: MigrationResult): Promise<void> {
		try {
			const localStatements = await LocalStorage.getItem<LocalBrandPurposeStatement>(STORAGE_KEYS.BRAND_PURPOSE_STATEMENTS);
			
			for (const statement of localStatements) {
				try {
					await saveBrandPurposeStatement(
						this.userId,
						statement.statementText,
						statement.audienceScore,
						statement.benefitScore,
						statement.beliefScore,
						statement.impactScore
					);
					result.migratedItems.statements++;
				} catch (error) {
					result.errors.push(`Failed to migrate statement ${statement.id}: ${error}`);
				}
			}
		} catch (error) {
			result.errors.push(`Failed to retrieve local statements: ${error}`);
		}
	}

	private async migrateQuestionAttempts(result: MigrationResult): Promise<void> {
		try {
			const localAttempts = await LocalStorage.getItem<LocalQuestionAttempt>(STORAGE_KEYS.QUESTION_ATTEMPTS);
			
			for (const attempt of localAttempts) {
				try {
					await recordQuestionAttempt(
						this.userId,
						attempt.questionId,
						attempt.selectedAnswerId,
						attempt.openEndedAnswer,
						attempt.isCorrect,
						attempt.pointsEarned
					);
					result.migratedItems.attempts++;
				} catch (error) {
					result.errors.push(`Failed to migrate attempt ${attempt.id}: ${error}`);
				}
			}
		} catch (error) {
			result.errors.push(`Failed to retrieve local attempts: ${error}`);
		}
	}

	private async clearLocalData(): Promise<void> {
		try {
			await LocalStorage.clearAll();
			console.log(`🧹 Local storage cleared after successful migration`);
		} catch (error) {
			console.error('⚠️ Failed to clear local storage after migration:', error);
		}
	}

	// Check if there's local data to migrate
	static async hasLocalData(): Promise<boolean> {
		try {
			const [progress, conversations, statements, attempts] = await Promise.all([
				LocalStorage.getItem(STORAGE_KEYS.USER_PROGRESS),
				LocalStorage.getItem(STORAGE_KEYS.AI_CONVERSATIONS),
				LocalStorage.getItem(STORAGE_KEYS.BRAND_PURPOSE_STATEMENTS),
				LocalStorage.getItem(STORAGE_KEYS.QUESTION_ATTEMPTS),
			]);

			return progress.length > 0 || conversations.length > 0 || statements.length > 0 || attempts.length > 0;
		} catch (error) {
			console.error('Failed to check for local data:', error);
			return false;
		}
	}
} 