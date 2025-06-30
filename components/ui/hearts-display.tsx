import { View, Text, Pressable } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import * as React from "react";

const heartsContainerVariants = cva("flex-row items-center", {
	variants: {
		size: {
			sm: "gap-1",
			md: "gap-2",
			lg: "gap-3",
		},
		alignment: {
			left: "justify-start",
			center: "justify-center",
			right: "justify-end",
		},
	},
	defaultVariants: {
		size: "md",
		alignment: "center",
	},
});

interface HeartsDisplayProps
	extends VariantProps<typeof heartsContainerVariants> {
	current: number;
	total: number;
	showCount?: boolean;
	onPress?: () => void;
	className?: string;
	animated?: boolean;
}

const HeartsDisplay = React.forwardRef<View, HeartsDisplayProps>(
	(
		{
			current,
			total,
			showCount = false,
			onPress,
			size,
			alignment,
			className,
			animated = true,
			...props
		},
		ref,
	) => {
		const hearts = Array.from({ length: total }, (_, index) => {
			const isFilled = index < current;

			return (
				<View key={index}>
					<Text
						className={cn(
							size === "sm" && "text-lg",
							size === "md" && "text-2xl",
							size === "lg" && "text-4xl",
						)}
					>
						{isFilled ? "❤️" : "🤍"}
					</Text>
				</View>
			);
		});

		const content = (
			<View
				className={cn(heartsContainerVariants({ size, alignment }), className)}
				ref={ref}
				{...props}
			>
				{hearts}

				{showCount && (
					<Text
						className={cn(
							"ml-2 font-semibold",
							size === "sm" && "text-sm",
							size === "md" && "text-base",
							size === "lg" && "text-lg",
							current === 0
								? "text-duo-error"
								: current <= total * 0.3
									? "text-duo-warning"
									: "text-duo-gray-700",
						)}
					>
						{current}/{total}
					</Text>
				)}
			</View>
		);

		if (onPress) {
			return (
				<Pressable
					onPress={onPress}
					accessibilityRole="button"
					accessibilityLabel={`${current} out of ${total} hearts remaining`}
				>
					{content}
				</Pressable>
			);
		}

		return content;
	},
);

HeartsDisplay.displayName = "HeartsDisplay";

// Hearts status component with refill timer
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
	const isLow = current <= total * 0.3;
	const isEmpty = current === 0;

	return (
		<View
			className={cn(
				"bg-white rounded-xl p-4 shadow-md border-2",
				isEmpty
					? "border-duo-error"
					: isLow
						? "border-duo-warning"
						: "border-duo-gray-200",
				className,
			)}
		>
			<View className="flex-row items-center justify-between">
				<View className="flex-1">
					<Text className="text-sm font-medium text-duo-gray-600 mb-1">
						Hearts
					</Text>
					<HeartsDisplay
						current={current}
						total={total}
						size="sm"
						alignment="left"
					/>
				</View>

				<View className="items-end">
					<Text
						className={cn(
							"text-lg font-bold",
							isEmpty
								? "text-duo-error"
								: isLow
									? "text-duo-warning"
									: "text-duo-gray-900",
						)}
					>
						{current}/{total}
					</Text>

					{minutesUntilRefill && current < total && (
						<Text className="text-xs text-duo-gray-500 mt-1">
							{minutesUntilRefill < 60
								? `+1 in ${minutesUntilRefill}m`
								: `+1 in ${Math.floor(minutesUntilRefill / 60)}h ${minutesUntilRefill % 60}m`}
						</Text>
					)}
				</View>
			</View>

			{/* Get more hearts button */}
			{current < total && onGetMoreHearts && (
				<Pressable
					onPress={onGetMoreHearts}
					className={cn(
						"mt-3 px-4 py-2 rounded-lg active:scale-95",
						isEmpty ? "bg-duo-error" : "bg-duo-primary",
					)}
				>
					<Text className="text-white font-semibold text-center text-sm">
						{isEmpty ? "Get Hearts" : "Refill Hearts"}
					</Text>
				</Pressable>
			)}
		</View>
	);
};

// Heart animation component (for gaining/losing hearts)
interface HeartAnimationProps {
	type: "gain" | "lose";
	count?: number;
	className?: string;
}

const HeartAnimation = ({
	type,
	count = 1,
	className,
}: HeartAnimationProps) => {
	return (
		<View className={cn("items-center justify-center", className)}>
			{Array.from({ length: count }, (_, index) => (
				<View
					key={index}
					className={cn(
						"absolute animate-bounce-gentle",
						type === "gain" && "animate-pulse",
						// Stagger animation for multiple hearts
						index > 0 && "delay-100",
					)}
					style={{
						animationDelay: `${index * 100}ms`,
					}}
				>
					<Text className="text-4xl">{type === "gain" ? "💚" : "💔"}</Text>
				</View>
			))}

			<Text
				className={cn(
					"text-sm font-bold mt-12",
					type === "gain" ? "text-duo-success" : "text-duo-error",
				)}
			>
				{type === "gain"
					? `+${count} Heart${count > 1 ? "s" : ""}`
					: "Heart Lost"}
			</Text>
		</View>
	);
};

// Full hearts refill celebration
interface HeartsRefillProps {
	onContinue?: () => void;
	className?: string;
}

const HeartsRefill = ({ onContinue, className }: HeartsRefillProps) => {
	return (
		<View
			className={cn(
				"bg-white rounded-xl p-6 items-center shadow-lg border-2 border-duo-success",
				className,
			)}
		>
			<Text className="text-6xl mb-4 animate-bounce-gentle">❤️</Text>

			<Text className="text-h2 font-bold text-duo-gray-900 text-center">
				Hearts Refilled!
			</Text>

			<Text className="text-body text-duo-gray-600 text-center mt-2">
				Your hearts have been restored. Keep learning!
			</Text>

			{onContinue && (
				<Pressable
					onPress={onContinue}
					className="mt-6 bg-duo-primary px-8 py-3 rounded-lg active:scale-95"
				>
					<Text className="text-white font-semibold">Continue</Text>
				</Pressable>
			)}
		</View>
	);
};

export {
	HeartsDisplay,
	HeartsStatus,
	HeartAnimation,
	HeartsRefill,
	heartsContainerVariants,
};
export type {
	HeartsDisplayProps,
	HeartsStatusProps,
	HeartAnimationProps,
	HeartsRefillProps,
};
