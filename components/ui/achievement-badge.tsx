import { View, Text, Pressable } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import * as React from "react";

const badgeVariants = cva(
	"items-center justify-center rounded-full border-4 border-white shadow-lg",
	{
		variants: {
			size: {
				sm: "w-12 h-12",
				md: "w-16 h-16",
				lg: "w-20 h-20",
				xl: "w-24 h-24",
			},
			status: {
				locked: "bg-duo-gray-300 shadow-duo-gray-400/40",
				unlocked: "bg-duo-gold shadow-yellow-600/60",
				progress: "bg-duo-secondary shadow-duo-secondary-600/60",
				special: "bg-duo-purple shadow-purple-600/60",
			},
		},
		defaultVariants: {
			size: "md",
			status: "locked",
		},
	},
);

interface AchievementBadgeProps extends VariantProps<typeof badgeVariants> {
	icon: string;
	title: string;
	description?: string;
	unlocked?: boolean;
	progress?: number;
	maxProgress?: number;
	className?: string;
	onPress?: () => void;
	animated?: boolean;
}

const AchievementBadge = React.forwardRef<View, AchievementBadgeProps>(
	(
		{
			icon,
			title,
			description,
			unlocked = false,
			progress = 0,
			maxProgress = 1,
			size,
			status,
			className,
			onPress,
			animated = true,
			...props
		},
		ref,
	) => {
		// Determine status based on props
		const badgeStatus =
			status ||
			(unlocked
				? "unlocked"
				: progress > 0 && progress < maxProgress
					? "progress"
					: "locked");

		const badge = (
			<View className={cn("items-center", className)} ref={ref} {...props}>
				<View
					className={cn(
						badgeVariants({ size, status: badgeStatus }),
						animated && unlocked && "animate-bounce-gentle",
					)}
				>
					<Text
						className={cn(
							"text-center",
							size === "sm" && "text-lg",
							size === "md" && "text-2xl",
							size === "lg" && "text-3xl",
							size === "xl" && "text-4xl",
						)}
					>
						{unlocked ? icon : "🔒"}
					</Text>
				</View>

				<View className="items-center mt-2 max-w-20">
					<Text
						className={cn(
							"text-center font-semibold",
							size === "sm" && "text-xs",
							size === "md" && "text-sm",
							size === "lg" && "text-base",
							size === "xl" && "text-lg",
							unlocked ? "text-duo-gray-900" : "text-duo-gray-500",
						)}
					>
						{title}
					</Text>

					{description && (
						<Text
							className={cn(
								"text-center mt-1",
								size === "sm" && "text-xs",
								(size === "md" || size === "lg" || size === "xl") && "text-xs",
								unlocked ? "text-duo-gray-600" : "text-duo-gray-400",
							)}
						>
							{description}
						</Text>
					)}

					{/* Progress indicator for partially completed achievements */}
					{!unlocked && progress > 0 && maxProgress > 1 && (
						<View className="w-full mt-2">
							<View className="bg-duo-gray-200 h-1 rounded-full overflow-hidden">
								<View
									className="bg-duo-secondary h-full rounded-full"
									style={{ width: `${(progress / maxProgress) * 100}%` }}
								/>
							</View>
							<Text className="text-xs text-duo-gray-500 text-center mt-1">
								{progress} / {maxProgress}
							</Text>
						</View>
					)}
				</View>
			</View>
		);

		if (onPress) {
			return (
				<Pressable
					onPress={onPress}
					className="active:scale-95 transition-transform"
					accessibilityRole="button"
					accessibilityLabel={`${title} achievement ${unlocked ? "unlocked" : "locked"}`}
					accessibilityHint={description}
				>
					{badge}
				</Pressable>
			);
		}

		return badge;
	},
);

AchievementBadge.displayName = "AchievementBadge";

// Achievement Grid Component
interface AchievementGridProps {
	achievements: {
		id: string;
		icon: string;
		title: string;
		description?: string;
		unlocked: boolean;
		progress?: number;
		maxProgress?: number;
	}[];
	columns?: number;
	onAchievementPress?: (id: string) => void;
	className?: string;
}

const AchievementGrid = ({
	achievements,
	columns = 3,
	onAchievementPress,
	className,
}: AchievementGridProps) => {
	return (
		<View className={cn("flex-row flex-wrap justify-between", className)}>
			{achievements.map((achievement, index) => (
				<View
					key={achievement.id}
					className={cn(
						"mb-6",
						columns === 2 && "w-[45%]",
						columns === 3 && "w-[30%]",
						columns === 4 && "w-[22%]",
					)}
				>
					<AchievementBadge
						icon={achievement.icon}
						title={achievement.title}
						description={achievement.description}
						unlocked={achievement.unlocked}
						progress={achievement.progress}
						maxProgress={achievement.maxProgress}
						onPress={
							onAchievementPress
								? () => onAchievementPress(achievement.id)
								: undefined
						}
					/>
				</View>
			))}
		</View>
	);
};

// Special Achievement Showcase (for major milestones)
interface AchievementShowcaseProps {
	icon: string;
	title: string;
	description: string;
	unlocked: boolean;
	onClose?: () => void;
	className?: string;
}

const AchievementShowcase = ({
	icon,
	title,
	description,
	unlocked,
	onClose,
	className,
}: AchievementShowcaseProps) => {
	return (
		<View
			className={cn(
				"bg-white rounded-xl p-6 items-center shadow-lg border-2 border-duo-gold",
				className,
			)}
		>
			<AchievementBadge
				icon={icon}
				title=""
				unlocked={unlocked}
				size="xl"
				status="unlocked"
				animated={true}
			/>

			<Text className="text-h2 font-bold text-duo-gray-900 text-center mt-4">
				{title}
			</Text>

			<Text className="text-body text-duo-gray-600 text-center mt-2">
				{description}
			</Text>

			{onClose && (
				<Pressable
					onPress={onClose}
					className="mt-6 bg-duo-primary px-8 py-3 rounded-lg active:scale-95"
				>
					<Text className="text-white font-semibold">Continue</Text>
				</Pressable>
			)}
		</View>
	);
};

export {
	AchievementBadge,
	AchievementGrid,
	AchievementShowcase,
	badgeVariants,
};
export type {
	AchievementBadgeProps,
	AchievementGridProps,
	AchievementShowcaseProps,
};
