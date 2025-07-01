import React from "react";
import { View, Text, Pressable } from "react-native";
import { cn } from "@/lib/utils";

interface HeartsDisplayProps {
	current: number;
	total: number;
	size?: "sm" | "md" | "lg";
	className?: string;
	onPress?: () => void;
}

const HeartsDisplay = ({
	current,
	total,
	size = "md",
	className,
	onPress,
}: HeartsDisplayProps) => {
	const sizeStyles = {
		sm: "text-lg",
		md: "text-2xl",
		lg: "text-3xl",
	};

	const hearts = Array.from({ length: total }, (_, i) => {
		const isFilled = i < current;
		return (
			<Text
				key={i}
				className={cn(
					sizeStyles[size],
					isFilled ? "opacity-100" : "opacity-30",
				)}
			>
				{isFilled ? "❤️" : "🤍"}
			</Text>
		);
	});

	const content = (
		<View className={cn("flex-row items-center gap-1", className)}>
			{hearts}
		</View>
	);

	if (onPress) {
		return (
			<Pressable onPress={onPress} className="active:scale-95">
				{content}
			</Pressable>
		);
	}

	return content;
};

// Hearts Counter with Label
interface HeartsCounterProps {
	current: number;
	total: number;
	size?: "sm" | "md" | "lg";
	showLabel?: boolean;
	className?: string;
	onPress?: () => void;
}

const HeartsCounter = ({
	current,
	total,
	size = "md",
	showLabel = true,
	className,
	onPress,
}: HeartsCounterProps) => {
	const textColorClass = cn(
		current === 0
			? "text-brand-error"
			: current <= 2
			? "text-brand-warning"
			: "text-brand-neutrals-textSecondary",
	);

	return (
		<View className={cn("items-center", className)}>
			<View
				className={cn(
					"flex-row items-center justify-center p-3 rounded-large border-2",
					current === 0
						? "border-brand-error"
						: current <= 2
						? "border-brand-warning"
						: "border-brand-neutrals-textSecondary/30",
				)}
			>
				<HeartsDisplay
					current={current}
					total={total}
					size={size}
					onPress={onPress}
				/>
				{showLabel && (
					<Text className="text-caption font-medium text-brand-neutrals-textSecondary mb-1">
						Hearts
					</Text>
				)}
			</View>

			{showLabel && (
				<Text
					className={cn(
						"text-caption font-semibold mt-2",
						current === 0
							? "text-brand-error"
							: current <= 2
							? "text-brand-warning"
							: "text-brand-neutrals-textPrimary",
					)}
				>
					{current} / {total}
				</Text>
			)}

			{current === 0 && (
				<Text className="text-caption text-brand-neutrals-textSecondary mt-1">
					No hearts remaining
				</Text>
			)}
		</View>
	);
};

// Hearts Status Component (shows refill time, etc.)
interface HeartsStatusProps {
	current: number;
	total: number;
	minutesUntilRefill?: number;
	onGetMoreHearts?: () => void;
	className?: string;
}

const HeartsStatus = ({
	current,
	total,
	minutesUntilRefill,
	onGetMoreHearts,
	className,
}: HeartsStatusProps) => {
	const isEmpty = current === 0;
	const canRefill = current < total;

	return (
		<View className={cn("bg-brand-neutrals-cardBackground rounded-large p-4 border-2 border-brand-neutrals-textSecondary/30", className)}>
			<View className="flex-row items-center justify-between mb-3">
				<HeartsDisplay current={current} total={total} size="md" />
				<View className="items-end">
					<Text className="text-subtitle font-bold text-brand-neutrals-textPrimary">
						{current}/{total}
					</Text>
					<Text className="text-caption text-brand-neutrals-textSecondary">Hearts</Text>
				</View>
			</View>

			{canRefill && minutesUntilRefill && (
				<View className="mb-3">
					<View
						className={cn(
							"h-1 rounded-full overflow-hidden",
							isEmpty ? "bg-brand-error" : "bg-brand-primary-vibrantGreen",
						)}
					>
						<View
							className="h-full bg-brand-primary-vibrantGreen rounded-full"
							style={{
								width: `${100 - (minutesUntilRefill / 60) * 100}%`,
							}}
						/>
					</View>
					<Text className="text-caption text-brand-neutrals-textSecondary mt-1 text-center">
						+1 heart in {minutesUntilRefill}m
					</Text>
				</View>
			)}

			{onGetMoreHearts && (
				<Pressable
					onPress={onGetMoreHearts}
					className="bg-brand-primary-vibrantGreen rounded-full p-3 items-center active:scale-95"
				>
					<Text className="text-subtitle font-semibold text-brand-neutrals-textPrimary">Get More Hearts</Text>
				</Pressable>
			)}
		</View>
	);
};

// Hearts Animation Component (for gaining/losing hearts)
interface HeartsAnimationProps {
	type: "gain" | "lose";
	amount: number;
	className?: string;
}

const HeartsAnimation = ({
	type,
	amount,
	className,
}: HeartsAnimationProps) => {
	const isGain = type === "gain";
	const heartIcon = isGain ? "❤️" : "💔";
	const colorClass = isGain ? "text-brand-success" : "text-brand-error";

	return (
		<View className={cn("items-center", className)}>
			<Text className={cn("text-4xl animate-bounce", colorClass)}>
				{heartIcon}
			</Text>
			<Text className={cn("text-subtitle font-bold mt-2", colorClass)}>
				{isGain ? "+" : "-"}{amount}
			</Text>
		</View>
	);
};

export { HeartsDisplay, HeartsCounter, HeartsStatus, HeartsAnimation };
export type { HeartsDisplayProps, HeartsCounterProps, HeartsStatusProps, HeartsAnimationProps };
