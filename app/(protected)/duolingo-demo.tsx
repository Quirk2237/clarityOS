import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Progress, XPProgress } from "@/components/ui/progress";
import {
	AchievementBadge,
	AchievementGrid,
} from "@/components/ui/achievement-badge";
import {
	StreakCounter,
	StreakMilestones,
} from "@/components/ui/streak-counter";
import { HeartsDisplay, HeartsStatus } from "@/components/ui/hearts-display";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useColorScheme } from "@/lib/useColorScheme";

export default function DuolingoDemo() {
	const [hearts, setHearts] = useState(4);
	const [streak, setStreak] = useState(7);
	const [xp, setXP] = useState(450);
	const [level, setLevel] = useState(5);
	const [progress, setProgress] = useState(75);
	const { colorScheme, toggleColorScheme } = useColorScheme();

	const achievements = [
		{
			id: "first-lesson",
			icon: "🎯",
			title: "First Steps",
			description: "Complete your first lesson",
			unlocked: true,
		},
		{
			id: "streak-3",
			icon: "🔥",
			title: "On Fire",
			description: "3 day streak",
			unlocked: true,
		},
		{
			id: "streak-7",
			icon: "⚡",
			title: "Lightning",
			description: "7 day streak",
			unlocked: true,
		},
		{
			id: "streak-30",
			icon: "🏆",
			title: "Champion",
			description: "30 day streak",
			unlocked: false,
			progress: 7,
			maxProgress: 30,
		},
		{
			id: "perfectionist",
			icon: "💎",
			title: "Perfectionist",
			description: "100% accuracy",
			unlocked: false,
		},
		{
			id: "scholar",
			icon: "📚",
			title: "Scholar",
			description: "50 lessons completed",
			unlocked: false,
			progress: 23,
			maxProgress: 50,
		},
	];

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView
				className="flex-1 px-4 py-6"
				showsVerticalScrollIndicator={false}
			>
				{/* Header with Theme Toggle */}
				<View className="mb-6">
					<View className="flex-row justify-between items-center mb-2">
						<Text className="text-h1 font-bold text-foreground">
							🦉 Duolingo Design System
						</Text>
						<Pressable
							onPress={toggleColorScheme}
							className="bg-card border-2 border-border rounded-xl p-2 active:scale-95"
						>
							<Text className="text-2xl">
								{colorScheme === "dark" ? "☀️" : "🌙"}
							</Text>
						</Pressable>
					</View>
					<Text className="text-body text-muted-foreground text-center">
						Interactive components showcase •{" "}
						{colorScheme === "dark" ? "Dark" : "Light"} mode
					</Text>
				</View>

				{/* Enhanced Button Showcase */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Enhanced Button System
					</Text>

					<View className="gap-4">
						{/* Primary Buttons */}
						<View>
							<Text className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
								Primary Actions
							</Text>
							<View className="gap-3">
								<Button variant="default" size="default">
									<Text>Continue Learning</Text>
								</Button>

								<Button variant="secondary" size="default">
									<Text>Practice Mode</Text>
								</Button>

								<Button variant="success" size="default">
									<Text>Lesson Complete!</Text>
								</Button>
							</View>
						</View>

						{/* Secondary Actions */}
						<View>
							<Text className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
								Secondary Actions
							</Text>
							<View className="gap-3">
								<Button variant="warning" size="default">
									<Text>Get More Hearts</Text>
								</Button>

								<Button variant="destructive" size="default">
									<Text>End Session</Text>
								</Button>

								<Button variant="outline" size="default">
									<Text>Skip Lesson</Text>
								</Button>

								<Button variant="ghost" size="default">
									<Text>Settings</Text>
								</Button>
							</View>
						</View>

						{/* Size Variations */}
						<View>
							<Text className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
								Size Variations
							</Text>
							<View className="gap-3">
								<View className="flex-row gap-2">
									<Button variant="default" size="sm" className="flex-1">
										<Text>Small</Text>
									</Button>
									<Button variant="secondary" size="default" className="flex-1">
										<Text>Default</Text>
									</Button>
									<Button variant="success" size="lg" className="flex-1">
										<Text>Large</Text>
									</Button>
								</View>
							</View>
						</View>

						{/* Contrast Demonstration */}
						<View>
							<Text className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
								Contrast & Accessibility
							</Text>
							<View className="bg-muted rounded-lg p-3 gap-2">
								<Text className="text-xs text-muted-foreground mb-1">
									All buttons meet WCAG contrast requirements in both themes
								</Text>
								<View className="flex-row gap-2 flex-wrap">
									<Button variant="default" size="sm">
										<Text>Default</Text>
									</Button>
									<Button variant="secondary" size="sm">
										<Text>Secondary</Text>
									</Button>
									<Button variant="outline" size="sm">
										<Text>Outline</Text>
									</Button>
									<Button variant="ghost" size="sm">
										<Text>Ghost</Text>
									</Button>
								</View>
							</View>
						</View>
					</View>
				</View>

				{/* User Stats Section */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Your Progress
					</Text>

					<View className="flex-row justify-between items-center mb-4">
						{/* XP Progress */}
						<View className="items-center">
							<XPProgress
								currentXP={xp}
								xpToNext={500}
								level={level}
								size={80}
							/>
							<Text className="text-sm text-muted-foreground mt-2">
								{xp}/500 XP
							</Text>
						</View>

						{/* Streak Counter */}
						<StreakCounter
							count={streak}
							isActive={true}
							size="md"
							onPress={() => setStreak(streak + 1)}
						/>

						{/* Hearts */}
						<View className="items-center">
							<HeartsDisplay
								current={hearts}
								total={5}
								size="md"
								onPress={() => setHearts(Math.max(0, hearts - 1))}
							/>
							<Text className="text-sm text-muted-foreground mt-2">
								{hearts}/5 Hearts
							</Text>
						</View>
					</View>

					{/* Overall Progress */}
					<Progress
						value={progress}
						max={100}
						showLabel={true}
						label="Daily Goal"
						className="mb-2"
					/>
				</View>

				{/* Achievements Section */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Achievements
					</Text>

					<AchievementGrid
						achievements={achievements}
						columns={3}
						onAchievementPress={(id) => console.log("Pressed achievement:", id)}
					/>
				</View>

				{/* Progress Elements */}
				<View className="bg-card rounded-xl p-4 mb-6 shadow-md border-2 border-border">
					<Text className="text-h3 font-semibold text-card-foreground mb-4">
						Progress Indicators
					</Text>

					<View className="gap-4">
						<Progress
							value={85}
							max={100}
							showLabel={true}
							label="Lesson Progress"
							variant="default"
						/>

						<Progress
							value={65}
							max={100}
							showLabel={true}
							label="Weekly Goal"
							variant="success"
							size="lg"
						/>

						<Progress
							value={30}
							max={100}
							showLabel={true}
							label="Hearts Refill"
							variant="error"
							size="sm"
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
						milestones={[3, 7, 14, 30, 100]}
					/>
				</View>

				{/* Hearts Status */}
				<View className="mb-6">
					<HeartsStatus
						current={hearts}
						total={5}
						minutesUntilRefill={hearts < 5 ? 45 : undefined}
						onGetMoreHearts={() => setHearts(5)}
					/>
				</View>

				{/* Interactive Demo Controls */}
				<View className="bg-accent rounded-xl p-4 mb-6 border-2 border-border">
					<Text className="text-h3 font-semibold text-accent-foreground mb-4">
						Interactive Demo
					</Text>

					<View className="gap-3">
						<View className="flex-row gap-2">
							<Button
								variant="destructive"
								size="default"
								className="flex-1"
								onPress={() => setHearts(Math.max(0, hearts - 1))}
							>
								<Text>Lose Heart</Text>
							</Button>

							<Button
								variant="success"
								size="default"
								className="flex-1"
								onPress={() => setHearts(Math.min(5, hearts + 1))}
							>
								<Text>Gain Heart</Text>
							</Button>
						</View>

						<View className="flex-row gap-2">
							<Button
								variant="secondary"
								size="default"
								className="flex-1"
								onPress={() => setProgress(Math.max(0, progress - 10))}
							>
								<Text>-10% Progress</Text>
							</Button>

							<Button
								variant="default"
								size="default"
								className="flex-1"
								onPress={() => setProgress(Math.min(100, progress + 10))}
							>
								<Text>+10% Progress</Text>
							</Button>
						</View>

						<Button
							variant="warning"
							size="lg"
							onPress={() => {
								setXP(xp + 50);
								setStreak(streak + 1);
								if (xp + 50 >= 500) {
									setLevel(level + 1);
									setXP(xp + 50 - 500);
								}
							}}
						>
							<Text>🎉 Complete Lesson (+50 XP)</Text>
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
							<View className="bg-duo-primary w-12 h-12 rounded-lg" />
							<View className="bg-duo-secondary w-12 h-12 rounded-lg" />
							<View className="bg-duo-gold w-12 h-12 rounded-lg" />
							<View className="bg-duo-orange w-12 h-12 rounded-lg" />
							<View className="bg-duo-red w-12 h-12 rounded-lg" />
							<View className="bg-duo-purple w-12 h-12 rounded-lg" />
						</View>
						<Text className="text-sm text-muted-foreground">
							Primary • Secondary • Gold • Orange • Red • Purple
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
							Body text - Lorem ipsum dolor sit amet
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
