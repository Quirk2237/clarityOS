import { View, Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import * as React from "react";

// Linear Progress Bar Component
const progressVariants = cva("w-full rounded-full overflow-hidden", {
	variants: {
		variant: {
			default: "bg-brand-neutrals-textSecondary/20",
			success: "bg-brand-neutrals-textSecondary/20",
			warning: "bg-brand-neutrals-textSecondary/20",
			error: "bg-brand-neutrals-textSecondary/20",
		},
		size: {
			default: "h-2",
			sm: "h-1",
			lg: "h-3",
			xl: "h-4",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

const progressFillVariants = cva("h-full rounded-full transition-all", {
	variants: {
		variant: {
			default: "bg-brand-primary-vibrantGreen",
			success: "bg-brand-success",
			warning: "bg-brand-warning",
			error: "bg-brand-error",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

interface ProgressProps
	extends React.ComponentPropsWithoutRef<typeof View>,
		VariantProps<typeof progressVariants> {
	value: number;
	max: number;
	showLabel?: boolean;
	label?: string;
}

const Progress = React.forwardRef<
	React.ElementRef<typeof View>,
	ProgressProps
>(({ className, variant, size, value, max, showLabel, label, ...props }, ref) => {
	const percentage = Math.min(100, Math.max(0, (value / max) * 100));

	return (
		<View className="w-full">
			{(showLabel || label) && (
				<View className="flex-row justify-between items-center mb-1">
					<Text className="text-caption font-medium text-brand-neutrals-textSecondary">
						{label || "Progress"}
					</Text>
					<Text className="text-caption font-semibold text-brand-neutrals-textPrimary">
						{Math.round(percentage)}%
					</Text>
				</View>
			)}
			<View
				ref={ref}
				className={cn(progressVariants({ variant, size }), className)}
				{...props}
			>
				<View
					className={cn(progressFillVariants({ variant }))}
					style={{ width: `${percentage}%` }}
				/>
			</View>
		</View>
	);
});
Progress.displayName = "Progress";

// Circular Progress Component (for XP/Levels)
interface CircularProgressProps {
	value: number;
	max?: number;
	size?: number;
	strokeWidth?: number;
	className?: string;
	children?: React.ReactNode;
	color?: string;
	backgroundColor?: string;
}

const CircularProgress = React.forwardRef<View, CircularProgressProps>(
	(
		{
			value,
			max = 100,
			size = 80,
			strokeWidth = 8,
			className,
			children,
			color = "#FFD700", // Default to gold
			backgroundColor = "#666666",
			...props
		},
		ref,
	) => {
		const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
		const radius = (size - strokeWidth) / 2;
		const circumference = 2 * Math.PI * radius;
		const strokeDashoffset = circumference - (percentage / 100) * circumference;

		return (
			<View
				className={cn("items-center justify-center", className)}
				style={{ width: size, height: size }}
				ref={ref}
				{...props}
			>
				{/* SVG would go here in a web environment, for React Native we'll use a simulated approach */}
				<View
					className="absolute rounded-full border-8"
					style={{
						width: size,
						height: size,
						borderColor: backgroundColor,
					}}
				/>
				<View
					className="absolute rounded-full border-8 transform -rotate-90"
					style={{
						width: size,
						height: size,
						borderColor: color,
						borderTopColor: "transparent",
						borderRightColor: "transparent",
						borderBottomColor: percentage > 25 ? color : "transparent",
						borderLeftColor: percentage > 50 ? color : "transparent",
					}}
				/>
				{children && (
					<View className="absolute items-center justify-center">
						{children}
					</View>
				)}
			</View>
		);
	},
);

CircularProgress.displayName = "CircularProgress";

// XP Progress Ring with Level Display
interface XPProgressProps {
	currentXP: number;
	xpToNext: number;
	level: number;
	size?: number;
	showLabel?: boolean;
}

const XPProgress = React.forwardRef<
	React.ElementRef<typeof View>,
	XPProgressProps
>(({ currentXP, xpToNext, level, size = 80, showLabel = true }, ref) => {
	const percentage = (currentXP / xpToNext) * 100;
	const radius = size / 2 - 4;
	const circumference = 2 * Math.PI * radius;
	const strokeDasharray = circumference;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<View ref={ref} className="items-center">
			<View
				className="relative items-center justify-center"
				style={{ width: size, height: size }}
			>
				{/* Background circle */}
				<View
					className="absolute border-4 border-brand-neutrals-textSecondary/20 rounded-full"
					style={{ width: size, height: size }}
				/>

				{/* Progress circle - Note: This would need react-native-svg for actual implementation */}
				<View
					className="absolute border-4 border-brand-primary-vibrantGreen rounded-full"
					style={{
						width: size,
						height: size,
						transform: [{ rotate: "-90deg" }],
					}}
				/>

				{/* Level display */}
				<View className="absolute items-center justify-center">
					<Text className="text-subtitle font-bold text-brand-neutrals-textPrimary">{level}</Text>
					<Text className="text-caption font-medium text-brand-neutrals-textSecondary">Level</Text>
				</View>
			</View>
			{showLabel && (
				<View className="mt-2 items-center">
					<Text className="text-caption text-brand-neutrals-textSecondary">
						{currentXP} / {xpToNext} XP
					</Text>
				</View>
			)}
		</View>
	);
});

XPProgress.displayName = "XPProgress";

// Progress Card Component
interface ProgressCardProps {
	title: string;
	progress: number;
	total: number;
	color?: string;
	className?: string;
}

const ProgressCard = ({
	title,
	progress,
	total,
	color = "#9AFF9A",
	className,
}: ProgressCardProps) => {
	const percentage = Math.min(100, Math.max(0, (progress / total) * 100));

	return (
		<View className={cn("bg-brand-neutrals-cardBackground rounded-large p-4", className)}>
			<View className="flex-row justify-between items-center mb-2">
				<Text className="text-body font-medium text-brand-neutrals-textPrimary">
					{title}
				</Text>
				<Text className="text-caption font-semibold text-brand-neutrals-textSecondary">
					{progress}/{total}
				</Text>
			</View>
			<Progress value={progress} max={total} size="sm" />
		</View>
	);
};

ProgressCard.displayName = "ProgressCard";

export { Progress, CircularProgress, XPProgress, ProgressCard };
export type { ProgressProps, CircularProgressProps, XPProgressProps, ProgressCardProps };
