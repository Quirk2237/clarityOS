import { View, Text, Pressable } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import * as React from "react";

const streakVariants = cva(
	"items-center justify-center rounded-xl p-4 shadow-md border-2",
	{
		variants: {
			variant: {
				active: "bg-duo-orange border-orange-600 shadow-orange-600/40",
				inactive: "bg-duo-gray-100 border-duo-gray-300 shadow-duo-gray-300/40",
				danger: "bg-red-100 border-red-300 shadow-red-300/40", // For nearly broken streaks
			},
			size: {
				sm: "p-3",
				md: "p-4",
				lg: "p-6",
			},
		},
		defaultVariants: {
			variant: "inactive",
			size: "md",
		},
	},
);

interface StreakCounterProps extends VariantProps<typeof streakVariants> {
	count: number;
	isActive: boolean;
	hoursUntilReset?: number; // Hours until streak resets
	onPress?: () => void;
	className?: string;
	showLabel?: boolean;
	animated?: boolean;
}

const StreakCounter = React.forwardRef<View, StreakCounterProps>(
	(
		{
			count,
			isActive,
			hoursUntilReset,
			onPress,
			variant,
			size,
			className,
			showLabel = true,
			animated = true,
			...props
		},
		ref,
	) => {
		// Determine variant based on state
		const streakVariant =
			variant ||
			(isActive
				? "active"
				: hoursUntilReset && hoursUntilReset < 6
					? "danger"
					: "inactive");

		const content = (
			<View
				className={cn(
					streakVariants({ variant: streakVariant, size }),
					className,
				)}
				ref={ref}
				{...props}
			>
				{/* Fire icon for active streaks */}
				{isActive && (
					<Text
						className={cn(
							"mb-1",
							size === "sm" && "text-lg",
							size === "md" && "text-2xl",
							size === "lg" && "text-4xl",
							animated && count > 0 && "animate-bounce-gentle",
						)}
					>
						🔥
					</Text>
				)}

				{/* Streak count */}
				<Text
					className={cn(
						"font-bold",
						size === "sm" && "text-lg",
						size === "md" && "text-2xl",
						size === "lg" && "text-4xl",
						isActive
							? "text-white"
							: hoursUntilReset && hoursUntilReset < 6
								? "text-red-700"
								: "text-duo-gray-700",
					)}
				>
					{count}
				</Text>

				{/* Label */}
				{showLabel && (
					<Text
						className={cn(
							"font-semibold text-center",
							size === "sm" && "text-xs",
							size === "md" && "text-sm",
							size === "lg" && "text-base",
							isActive
								? "text-white"
								: hoursUntilReset && hoursUntilReset < 6
									? "text-red-600"
									: "text-duo-gray-600",
						)}
					>
						{count === 1 ? "day streak" : "day streak"}
					</Text>
				)}

				{/* Time warning for nearly broken streaks */}
				{hoursUntilReset && hoursUntilReset < 12 && !isActive && (
					<Text
						className={cn(
							"text-center mt-1 font-medium",
							size === "sm" && "text-xs",
							(size === "md" || size === "lg") && "text-xs",
							hoursUntilReset < 6 ? "text-red-600" : "text-duo-gray-500",
						)}
					>
						{hoursUntilReset < 1
							? `${Math.floor(hoursUntilReset * 60)}m left`
							: `${Math.floor(hoursUntilReset)}h left`}
					</Text>
				)}
			</View>
		);

		if (onPress) {
			return (
				<Pressable
					onPress={onPress}
					className="active:scale-95 transition-transform"
					accessibilityRole="button"
					accessibilityLabel={`${count} day streak ${isActive ? "active" : "inactive"}`}
					accessibilityHint={
						hoursUntilReset ? `${hoursUntilReset} hours until reset` : undefined
					}
				>
					{content}
				</Pressable>
			);
		}

		return content;
	},
);

StreakCounter.displayName = "StreakCounter";

// Streak milestones component
interface StreakMilestoneProps {
	currentStreak: number;
	milestones: number[];
	className?: string;
}

const StreakMilestones = ({
	currentStreak,
	milestones,
	className,
}: StreakMilestoneProps) => {
	return (
		<View className={cn("flex-row justify-between items-center", className)}>
			{milestones.map((milestone, index) => {
				const isAchieved = currentStreak >= milestone;
				const isCurrent =
					currentStreak < milestone &&
					(index === 0 || currentStreak >= milestones[index - 1]);

				return (
					<View key={milestone} className="items-center flex-1">
						{/* Milestone marker */}
						<View
							className={cn(
								"w-8 h-8 rounded-full items-center justify-center border-2",
								isAchieved
									? "bg-duo-gold border-yellow-600"
									: isCurrent
										? "bg-duo-primary border-duo-primary-600"
										: "bg-duo-gray-200 border-duo-gray-300",
							)}
						>
							<Text
								className={cn(
									"text-xs font-bold",
									isAchieved
										? "text-white"
										: isCurrent
											? "text-white"
											: "text-duo-gray-500",
								)}
							>
								{isAchieved ? "✓" : milestone}
							</Text>
						</View>

						{/* Milestone label */}
						<Text
							className={cn(
								"text-xs font-medium text-center mt-1",
								isAchieved
									? "text-duo-gray-900"
									: isCurrent
										? "text-duo-primary"
										: "text-duo-gray-500",
							)}
						>
							{milestone}
						</Text>

						{/* Progress line (except for last item) */}
						{index < milestones.length - 1 && (
							<View
								className={cn(
									"absolute top-4 left-1/2 w-full h-0.5 -z-10",
									isAchieved
										? "bg-duo-gold"
										: currentStreak >= milestone
											? "bg-duo-primary"
											: "bg-duo-gray-300",
								)}
							/>
						)}
					</View>
				);
			})}
		</View>
	);
};

// Streak freeze component (for when users purchase streak protection)
interface StreakFreezeProps {
	freezesRemaining: number;
	onUseFreeze?: () => void;
	className?: string;
}

const StreakFreeze = ({
	freezesRemaining,
	onUseFreeze,
	className,
}: StreakFreezeProps) => {
	return (
		<View
			className={cn(
				"bg-duo-secondary-50 border-2 border-duo-secondary-200 rounded-lg p-4 items-center",
				className,
			)}
		>
			<Text className="text-2xl mb-2">🛡️</Text>
			<Text className="text-sm font-semibold text-duo-gray-900 text-center">
				Streak Freeze
			</Text>
			<Text className="text-xs text-duo-gray-600 text-center mt-1">
				{freezesRemaining} remaining
			</Text>

			{onUseFreeze && freezesRemaining > 0 && (
				<Pressable
					onPress={onUseFreeze}
					className="mt-3 bg-duo-secondary px-4 py-2 rounded-lg active:scale-95"
				>
					<Text className="text-white font-semibold text-sm">Use Freeze</Text>
				</Pressable>
			)}
		</View>
	);
};

export { StreakCounter, StreakMilestones, StreakFreeze, streakVariants };
export type { StreakCounterProps, StreakMilestoneProps, StreakFreezeProps };
