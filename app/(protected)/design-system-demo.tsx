import React, { useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	AchievementBadge,
	AchievementGrid,
} from "@/components/ui/achievement-badge";
import {
	StreakCounter,
	StreakMilestones,
} from "@/components/ui/streak-counter";
import { HeartsDisplay, HeartsStatus } from "@/components/ui/hearts-display";

export default function DesignSystemDemo() {
	const [hearts, setHearts] = useState(4);
	const [streak, setStreak] = useState(7);
	const [progress, setProgress] = useState(65);
	const [isCompleted, setIsCompleted] = useState(false);

	const achievements = [
		{
			id: "first-lesson",
			icon: "🎯",
			title: "First Step",
			description: "Complete first lesson",
			unlocked: true,
		},
		{
			id: "streak-3",
			icon: "🔥",
			title: "Getting Started",
			description: "3 day streak",
			unlocked: true,
		},
		{
			id: "streak-7",
			icon: "⚡",
			title: "Committed",
			description: "7 day streak",
			unlocked: true,
		},
		{
			id: "streak-30",
			icon: "🏆",
			title: "Dedicated",
			description: "30 day streak",
			unlocked: false,
		},
	];

	const handleCompleteLesson = () => {
		setProgress(100);
		setIsCompleted(true);
		setTimeout(() => {
			setProgress(0);
			setIsCompleted(false);
		}, 2000);
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView
				className="flex-1 px-4 py-6"
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View className="mb-6">
					<Text className="text-h1 font-bold text-foreground text-center">
						🌿 Design System Demo
					</Text>
					<Text className="text-body text-muted-foreground text-center mt-2">
						Clean, modern design system
					</Text>
				</View>

				{/* Enhanced Button Showcase */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Button Components
					</Text>

					<View className="gap-3">
						{/* Primary Buttons */}
						<View className="flex-row gap-2">
							<Button
								className="flex-1 bg-brand-primary"
								onPress={() => console.log("Primary pressed")}
							>
								<Text>Primary</Text>
							</Button>
							<Button
								className="flex-1 bg-brand-secondary"
								onPress={() => console.log("Secondary pressed")}
							>
								<Text>Secondary</Text>
							</Button>
						</View>

						{/* Action Buttons */}
						<View className="flex-row gap-2">
							<Button
								className="flex-1 bg-brand-success"
								onPress={() => console.log("Success pressed")}
							>
								<Text>Success</Text>
							</Button>
							<Button
								className="flex-1 bg-brand-warning"
								onPress={() => console.log("Warning pressed")}
							>
								<Text>Warning</Text>
							</Button>
						</View>

						{/* Outline Buttons */}
						<View className="flex-row gap-2">
							<Button
								variant="outline"
								className="flex-1"
								onPress={() => console.log("Outline pressed")}
							>
								<Text>Outline</Text>
							</Button>
							<Button
								variant="secondary"
								className="flex-1"
								onPress={() => console.log("Ghost pressed")}
							>
								<Text>Ghost</Text>
							</Button>
						</View>

						{/* Interactive Button */}
						<Button
							className="bg-brand-primary"
							onPress={() => setHearts(Math.min(5, hearts + 1))}
						>
							<Text>Get More Hearts</Text>
						</Button>
					</View>
				</View>

				{/* Progress Components */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Progress Components
					</Text>

					<View className="gap-4">
						<View>
							<View className="flex-row justify-between mb-2">
								<Text className="text-body-small text-muted-foreground">
									Current Progress
								</Text>
								<Text className="text-body-small text-muted-foreground">
									{progress}%
								</Text>
							</View>
							<Progress
								value={progress}
								max={100}
								className="h-3 bg-muted"
								showLabel={false}
							/>
						</View>

						<View className="flex-row gap-2">
							<Button
								variant="outline"
								className="flex-1"
								onPress={() => setProgress(Math.max(0, progress - 10))}
							>
								<Text>-10%</Text>
							</Button>
							<Button
								variant="outline"
								className="flex-1"
								onPress={() => setProgress(Math.min(100, progress + 10))}
							>
								<Text>+10%</Text>
							</Button>
							<Button
								className="flex-1 bg-brand-primary"
								onPress={handleCompleteLesson}
							>
								<Text>Complete</Text>
							</Button>
						</View>

						{/* Different progress styles */}
						<View className="gap-2">
							<Progress
								value={75}
								max={100}
								className="h-2 bg-muted"
								showLabel={true}
							/>
							<Progress
								value={40}
								max={100}
								className="h-4 bg-muted"
								showLabel={true}
							/>
							<Progress
								value={90}
								max={100}
								className="h-6 bg-muted"
								showLabel={true}
							/>
						</View>
					</View>
				</View>

				{/* Gamification Elements */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Gamification Elements
					</Text>

					<View className="gap-4">
						{/* Streak Counter */}
						<StreakCounter
							count={streak}
							isActive={streak > 0}
							className="self-start"
							onPress={() => setStreak(streak + 1)}
						/>

						{/* Hearts */}
						<View className="flex-row items-center gap-2">
							<HeartsDisplay
								current={hearts}
								total={5}
								size="sm"
								onPress={() => setHearts(Math.max(0, hearts - 1))}
							/>
							<Text className="text-body-small text-muted-foreground">
								{hearts}/5 Hearts
							</Text>
						</View>

						{/* Combined Progress with Label */}
						<Progress
							value={progress}
							max={100}
							className="h-4 bg-muted"
							showLabel={true}
						/>
					</View>
				</View>

				{/* Achievements Section */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Achievements
					</Text>

					<AchievementGrid
						achievements={achievements}
						columns={4}
						onAchievementPress={(id) => console.log("Pressed achievement:", id)}
					/>
				</View>

				{/* Different Progress Bars */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Progress Variations
					</Text>

					<View className="gap-3">
						<Progress
							value={25}
							max={100}
							className="h-2 bg-muted"
							showLabel={true}
						/>
						<Progress
							value={50}
							max={100}
							className="h-3 bg-muted"
							showLabel={true}
						/>
						<Progress
							value={75}
							max={100}
							className="h-4 bg-muted"
							showLabel={true}
							label="Learning Progress"
						/>
					</View>
				</View>

				{/* Streak Milestones */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Streak Milestones
					</Text>

					<StreakMilestones
						currentStreak={streak}
						milestones={[3, 7, 14, 30, 50, 100]}
					/>
				</View>

				{/* Hearts Status */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<HeartsStatus
						current={hearts}
						total={5}
						minutesUntilRefill={hearts < 5 ? 45 : undefined}
						onGetMoreHearts={() => setHearts(5)}
					/>
				</View>

				{/* Interactive Controls */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Interactive Controls
					</Text>

					<View className="gap-3">
						<View className="flex-row gap-2">
							<Button
								variant="outline"
								className="flex-1"
								onPress={() => setHearts(Math.max(0, hearts - 1))}
							>
								<Text>Lose Heart</Text>
							</Button>
							<Button
								variant="outline"
								className="flex-1"
								onPress={() => setHearts(Math.min(5, hearts + 1))}
							>
								<Text>Gain Heart</Text>
							</Button>
						</View>

						<View className="flex-row gap-2">
							<Button
								variant="outline"
								className="flex-1"
								onPress={() => setStreak(Math.max(0, streak - 1))}
							>
								<Text>Break Streak</Text>
							</Button>
							<Button
								className="flex-1 bg-brand-primary"
								onPress={() => setStreak(streak + 1)}
							>
								<Text>Extend Streak</Text>
							</Button>
						</View>

						<Button
							className="bg-brand-success"
							onPress={() => {
								setHearts(5);
								setStreak(streak + 1);
								setProgress(100);
								setTimeout(() => setProgress(0), 1000);
							}}
						>
							<Text>Complete Perfect Lesson</Text>
						</Button>
					</View>
				</View>

				{/* Color Palette */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Color Palette
					</Text>

					<View className="gap-3">
						<View className="flex-row gap-2">
							<View className="bg-brand-primary w-12 h-12 rounded-lg" />
							<View className="bg-brand-secondary w-12 h-12 rounded-lg" />
							<View className="bg-brand-success w-12 h-12 rounded-lg" />
							<View className="bg-brand-warning w-12 h-12 rounded-lg" />
							<View className="bg-brand-error w-12 h-12 rounded-lg" />
							<View className="bg-brand-purple w-12 h-12 rounded-lg" />
						</View>
						<Text className="text-sm text-muted-foreground">
							Primary • Secondary • Success • Warning • Error • Purple
						</Text>
					</View>
				</View>

				{/* Typography Demo */}
				<View className="bg-card rounded-xl p-4 mb-8 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Typography Scale
					</Text>

					<View className="gap-2">
						<Text className="text-display font-bold text-foreground">
							Display Text
						</Text>
						<Text className="text-h1 font-bold text-foreground">Heading 1</Text>
						<Text className="text-h2 font-semibold text-foreground">
							Heading 2
						</Text>
						<Text className="text-h3 font-semibold text-foreground">
							Heading 3
						</Text>
						<Text className="text-body text-foreground">
							Body text - Clean, modern design system
						</Text>
						<Text className="text-body-small text-muted-foreground">
							Small body text
						</Text>
						<Text className="text-caption text-muted-foreground">
							Caption text
						</Text>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
