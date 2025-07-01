import React from "react";
import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";

const streakVariants = {
	active: "bg-brand-accent-orange border-brand-accent-orange shadow-brand-accent-orange/40",
	inactive: "bg-brand-neutrals-textSecondary/20 border-brand-neutrals-textSecondary/30 shadow-brand-neutrals-textSecondary/40",
};

interface StreakCounterProps {
	count: number;
	isActive?: boolean;
	size?: "sm" | "md" | "lg";
	className?: string;
	onPress?: () => void;
}

const StreakCounter = ({
	count,
	isActive = true,
	size = "md",
	className,
	onPress,
}: StreakCounterProps) => {
	const sizeStyles = {
		sm: "w-12 h-12",
		md: "w-16 h-16",
		lg: "w-20 h-20",
	};

	const textStyles = {
		sm: "text-body",
		md: "text-subtitle",
		lg: "text-title",
	};

	const labelStyles = {
		sm: "text-caption",
		md: "text-body",
		lg: "text-subtitle",
	};

	return (
		<Pressable
			onPress={onPress}
			className={cn(
				"items-center justify-center rounded-full border-2 shadow-lg active:scale-95",
				isActive ? streakVariants.active : streakVariants.inactive,
				sizeStyles[size],
				className,
			)}
		>
			<View className="items-center">
				<Text
					className={cn(
						"font-bold",
						textStyles[size],
						isActive ? "text-white" : "text-brand-neutrals-textSecondary",
					)}
				>
					{count}
				</Text>
				{size !== "sm" && (
					<Text
						className={cn(
							"font-medium mt-0.5",
							labelStyles[size],
							isActive ? "text-white/90" : "text-brand-neutrals-textSecondary",
						)}
					>
						🔥
					</Text>
				)}
			</View>
		</Pressable>
	);
};

// Streak Status Component
interface StreakStatusProps {
	currentStreak: number;
	hoursUntilReset?: number;
	className?: string;
}

const StreakStatus = ({
	currentStreak,
	hoursUntilReset = 12,
	className,
}: StreakStatusProps) => {
	return (
		<View className={cn("items-center py-4", className)}>
			<StreakCounter count={currentStreak} isActive={currentStreak > 0} />
			<Text className="text-subtitle font-semibold text-brand-neutrals-textPrimary mt-2">
				{currentStreak} Day Streak
			</Text>
			{hoursUntilReset && (
				<Text
					className={cn(
						"text-body mt-1",
						hoursUntilReset < 6 ? "text-brand-error" : "text-brand-neutrals-textSecondary",
					)}
				>
					{hoursUntilReset}h until reset
				</Text>
			)}
		</View>
	);
};

// Streak Milestones Component
interface StreakMilestonesProps {
	currentStreak: number;
	milestones: number[];
	className?: string;
}

const StreakMilestones = ({
	currentStreak,
	milestones,
	className,
}: StreakMilestonesProps) => {
	return (
		<View className={cn("flex-row justify-between", className)}>
			{milestones.map((milestone) => {
				const isReached = currentStreak >= milestone;
				const isNext = !isReached && milestone === milestones.find(m => m > currentStreak);

				return (
					<View key={milestone} className="items-center flex-1">
						<View
							className={cn(
								"w-8 h-8 rounded-full border-2 items-center justify-center mb-1",
								isReached
									? "bg-brand-accent-yellow border-brand-accent-yellow"
									: isNext
									? "bg-brand-primary-vibrantGreen border-brand-primary-vibrantGreen"
									: "bg-brand-neutrals-textSecondary/20 border-brand-neutrals-textSecondary/30",
							)}
						>
							<Text
								className={cn(
									"text-caption font-bold",
									isReached
										? "text-white"
										: isNext
										? "text-white"
										: "text-brand-neutrals-textSecondary",
								)}
							>
								{milestone}
							</Text>
						</View>
						<Text
							className={cn(
								"text-caption font-medium text-center",
								isReached
									? "text-brand-neutrals-textPrimary"
									: isNext
									? "text-brand-primary-vibrantGreen"
									: "text-brand-neutrals-textSecondary",
							)}
						>
							{isReached ? "✓" : milestone}
						</Text>
						{isNext && (
							<View
								className={cn(
									"absolute -top-1 -right-1 w-2 h-2 rounded-full",
									isReached
										? "bg-brand-accent-yellow"
										: isNext
										? "bg-brand-primary-vibrantGreen"
										: "bg-brand-neutrals-textSecondary/30",
								)}
							/>
						)}
					</View>
				);
			})}
		</View>
	);
};

// Streak Freeze Component
interface StreakFreezeProps {
	hasFreeze?: boolean;
	onPurchase?: () => void;
	className?: string;
}

const StreakFreeze = ({
	hasFreeze = false,
	onPurchase,
	className,
}: StreakFreezeProps) => {
	return (
		<View
			className={cn(
				"bg-brand-primary-neonGreen/10 border-2 border-brand-primary-neonGreen/30 rounded-large p-4 items-center",
				className,
			)}
		>
			<Text className="text-2xl mb-2">❄️</Text>
			<Text className="text-body font-semibold text-brand-neutrals-textPrimary text-center mb-2">
				Streak Freeze
			</Text>
			<Text className="text-caption text-brand-neutrals-textSecondary text-center mb-3">
				{hasFreeze
					? "Your streak is protected for one day"
					: "Protect your streak for one day"}
			</Text>
			{!hasFreeze && onPurchase && (
				<Pressable
					onPress={onPurchase}
					className="bg-brand-primary-vibrantGreen rounded-full px-4 py-2 active:scale-95"
				>
					<Text className="text-body font-semibold text-brand-neutrals-textPrimary">
						Get Freeze
					</Text>
				</Pressable>
			)}
		</View>
	);
};

export { StreakCounter, StreakStatus, StreakMilestones, StreakFreeze };
export type { StreakCounterProps, StreakStatusProps, StreakMilestonesProps, StreakFreezeProps };
