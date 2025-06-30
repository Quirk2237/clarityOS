import React from "react";
import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";

const badgeVariants = {
	locked: "bg-brand-gray-300 shadow-brand-gray-400/40",
	unlocked: "bg-brand-yellow shadow-yellow-600/60",
	progress: "bg-brand-secondary shadow-brand-secondary-600/60",
	special: "bg-brand-purple shadow-purple-600/60",
};

interface AchievementBadgeProps {
	id: string;
	icon: string;
	title: string;
	description?: string;
	unlocked?: boolean;
	progress?: number;
	maxProgress?: number;
	variant?: "default" | "special";
	size?: "sm" | "md" | "lg";
	className?: string;
	onPress?: (id: string) => void;
}

const AchievementBadge = ({
	id,
	icon,
	title,
	description,
	unlocked = false,
	progress,
	maxProgress,
	variant = "default",
	size = "md",
	className,
	onPress,
}: AchievementBadgeProps) => {
	const hasProgress = progress !== undefined && maxProgress !== undefined;
	const isSpecial = variant === "special";

	const sizeStyles = {
		sm: {
			container: "w-16 h-16",
			icon: "text-2xl",
			title: "text-xs",
		},
		md: {
			container: "w-20 h-20",
			icon: "text-3xl",
			title: "text-sm",
		},
		lg: {
			container: "w-24 h-24",
			icon: "text-4xl",
			title: "text-base",
		},
	};

	const getBadgeVariant = () => {
		if (isSpecial) return badgeVariants.special;
		if (hasProgress && !unlocked) return badgeVariants.progress;
		if (unlocked) return badgeVariants.unlocked;
		return badgeVariants.locked;
	};

	const content = (
		<View className="items-center">
			<View
				className={cn(
					"items-center justify-center rounded-full shadow-lg border-3 border-white mb-2",
					getBadgeVariant(),
					sizeStyles[size].container,
					className,
				)}
			>
				<Text className={sizeStyles[size].icon}>
					{unlocked || hasProgress ? icon : "🔒"}
				</Text>
			</View>

			<Text
				className={cn(
					"font-semibold text-center leading-tight",
					sizeStyles[size].title,
					unlocked ? "text-brand-gray-900" : "text-brand-gray-500",
				)}
			>
				{title}
			</Text>

			{description && (
				<Text
					className={cn(
						"text-xs text-center mt-1 leading-tight",
						unlocked ? "text-brand-gray-600" : "text-brand-gray-400",
					)}
				>
					{description}
				</Text>
			)}

			{hasProgress && !unlocked && (
				<View className="w-full mt-2">
					<View className="bg-brand-gray-200 h-1 rounded-full overflow-hidden">
						<View
							className="bg-brand-secondary h-full rounded-full"
							style={{ width: `${(progress! / maxProgress!) * 100}%` }}
						/>
					</View>
					<Text className="text-xs text-brand-gray-500 text-center mt-1">
						{progress} / {maxProgress}
					</Text>
				</View>
			)}
		</View>
	);

	if (onPress) {
		return (
			<Pressable
				onPress={() => onPress(id)}
				className="active:scale-95 transition-transform"
			>
				{content}
			</Pressable>
		);
	}

	return content;
};

// Achievement Grid Component
interface AchievementGridProps {
	achievements: AchievementBadgeProps[];
	columns?: number;
	className?: string;
	onAchievementPress?: (id: string) => void;
}

const AchievementGrid = ({
	achievements,
	columns = 3,
	className,
	onAchievementPress,
}: AchievementGridProps) => {
	const rows = [];
	for (let i = 0; i < achievements.length; i += columns) {
		rows.push(achievements.slice(i, i + columns));
	}

	return (
		<View className={cn("gap-4", className)}>
			{rows.map((row, rowIndex) => (
				<View key={rowIndex} className="flex-row justify-between">
					{row.map((achievement) => (
						<View key={achievement.id} className="flex-1 items-center">
							<AchievementBadge
								{...achievement}
								onPress={onAchievementPress}
								size="sm"
							/>
						</View>
					))}
					{/* Fill empty spaces to maintain alignment */}
					{row.length < columns &&
						Array.from({ length: columns - row.length }).map((_, index) => (
							<View key={`empty-${index}`} className="flex-1" />
						))}
				</View>
			))}
		</View>
	);
};

// Achievement Showcase Component (for when an achievement is unlocked)
interface AchievementShowcaseProps {
	achievement: AchievementBadgeProps;
	onDismiss: () => void;
	className?: string;
}

const AchievementShowcase = ({
	achievement,
	onDismiss,
	className,
}: AchievementShowcaseProps) => {
	return (
		<View
			className={cn(
				"bg-white rounded-xl p-6 items-center shadow-lg border-2 border-brand-yellow",
				className,
			)}
		>
			<View className="bg-brand-yellow w-20 h-20 rounded-full items-center justify-center shadow-lg border-3 border-white mb-4">
				<Text className="text-4xl">{achievement.icon}</Text>
			</View>

			<Text className="text-h2 font-bold text-brand-gray-900 text-center mt-4">
				{achievement.title}
			</Text>

			<Text className="text-body text-brand-gray-600 text-center mt-2">
				{achievement.description}
			</Text>

			<Pressable
				onPress={onDismiss}
				className="mt-6 bg-brand-primary px-8 py-3 rounded-lg active:scale-95"
			>
				<Text className="text-white font-semibold">Continue</Text>
			</Pressable>
		</View>
	);
};

export { AchievementBadge, AchievementGrid, AchievementShowcase };
export type {
	AchievementBadgeProps,
	AchievementGridProps,
	AchievementShowcaseProps,
};
