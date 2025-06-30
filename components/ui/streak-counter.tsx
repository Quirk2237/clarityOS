import React from "react";
import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";

const streakVariants = {
	active: "bg-brand-orange border-orange-600 shadow-orange-600/40",
	inactive: "bg-brand-gray-100 border-brand-gray-300 shadow-brand-gray-300/40",
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
		sm: "text-sm",
		md: "text-lg",
		lg: "text-xl",
	};

	const labelStyles = {
		sm: "text-xs",
		md: "text-sm",
		lg: "text-base",
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
						isActive ? "text-white" : "text-brand-gray-700",
					)}
				>
					{count}
				</Text>
				{size !== "sm" && (
					<Text
						className={cn(
							"font-medium mt-0.5",
							labelStyles[size],
							isActive ? "text-white/90" : "text-brand-gray-600",
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
			<Text className="text-base font-semibold text-foreground mt-2">
				{currentStreak} Day Streak
			</Text>
			{hoursUntilReset && (
				<Text
					className={cn(
						"text-sm mt-1",
						hoursUntilReset < 6 ? "text-red-600" : "text-brand-gray-500",
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
									? "bg-brand-yellow border-yellow-600"
									: isNext
									? "bg-brand-primary border-brand-primary-600"
									: "bg-brand-gray-200 border-brand-gray-300",
							)}
						>
							<Text
								className={cn(
									"text-xs font-bold",
									isReached
										? "text-white"
										: isNext
										? "text-white"
										: "text-brand-gray-500",
								)}
							>
								{milestone}
							</Text>
						</View>
						<Text
							className={cn(
								"text-xs font-medium text-center",
								isReached
									? "text-brand-gray-900"
									: isNext
									? "text-brand-primary"
									: "text-brand-gray-500",
							)}
						>
							{isReached ? "✓" : milestone}
						</Text>
						{isNext && (
							<View
								className={cn(
									"absolute -top-1 -right-1 w-2 h-2 rounded-full",
									isReached
										? "bg-brand-yellow"
										: isNext
										? "bg-brand-primary"
										: "bg-brand-gray-300",
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
				"bg-brand-secondary-50 border-2 border-brand-secondary-200 rounded-lg p-4 items-center",
				className,
			)}
		>
			<Text className="text-2xl mb-2">🛡️</Text>
			<Text className="text-sm font-semibold text-brand-gray-900 text-center">
				Streak Freeze
			</Text>
			<Text className="text-xs text-brand-gray-600 text-center mt-1">
				{hasFreeze ? "Your streak is protected!" : "Protect your streak"}
			</Text>
			{!hasFreeze && onPurchase && (
				<Pressable
					onPress={onPurchase}
					className="mt-3 bg-brand-secondary px-4 py-2 rounded-lg active:scale-95"
				>
					<Text className="text-white font-semibold text-sm">Get Freeze</Text>
				</Pressable>
			)}
		</View>
	);
};

export { StreakCounter, StreakStatus, StreakMilestones, StreakFreeze };
export type {
	StreakCounterProps,
	StreakStatusProps,
	StreakMilestonesProps,
	StreakFreezeProps,
};
