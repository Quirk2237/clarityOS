import { View, Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import * as React from "react";

// Linear Progress Bar Component
const progressVariants = cva("w-full rounded-full overflow-hidden", {
	variants: {
		size: {
			sm: "h-2",
			md: "h-3",
			lg: "h-4",
			xl: "h-6",
		},
		variant: {
			default: "bg-duo-gray-200",
			success: "bg-duo-gray-200",
			warning: "bg-yellow-200",
			error: "bg-red-200",
		},
	},
	defaultVariants: {
		size: "md",
		variant: "default",
	},
});

const progressFillVariants = cva(
	"h-full rounded-full transition-all duration-500 ease-out",
	{
		variants: {
			variant: {
				default: "bg-duo-primary",
				success: "bg-duo-success",
				warning: "bg-duo-warning",
				error: "bg-duo-error",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

interface ProgressProps extends VariantProps<typeof progressVariants> {
	value: number;
	max?: number;
	className?: string;
	showLabel?: boolean;
	label?: string;
}

const Progress = React.forwardRef<View, ProgressProps>(
	(
		{ value, max = 100, size, variant, className, showLabel, label, ...props },
		ref,
	) => {
		const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

		return (
			<View className={cn("w-full", className)} ref={ref} {...props}>
				{showLabel && (
					<View className="flex-row justify-between items-center mb-2">
						<Text className="text-sm font-medium text-duo-gray-700">
							{label || "Progress"}
						</Text>
						<Text className="text-sm font-semibold text-duo-gray-900">
							{value} / {max}
						</Text>
					</View>
				)}
				<View className={progressVariants({ size, variant })}>
					<View
						className={progressFillVariants({ variant })}
						style={{ width: `${percentage}%` }}
					/>
				</View>
			</View>
		);
	},
);

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
			color = "#FFD900", // Default to gold
			backgroundColor = "#E8EAED",
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
	className?: string;
}

const XPProgress = ({
	currentXP,
	xpToNext,
	level,
	size = 100,
	className,
}: XPProgressProps) => {
	return (
		<CircularProgress
			value={currentXP}
			max={xpToNext}
			size={size}
			color="#FFD900"
			className={cn("relative", className)}
		>
			<View className="items-center justify-center">
				<Text className="text-lg font-bold text-duo-gray-900">{level}</Text>
				<Text className="text-xs font-medium text-duo-gray-600">Level</Text>
			</View>
		</CircularProgress>
	);
};

// Progress Card Component for Dashboard
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
	color = "#58CC02",
	className,
}: ProgressCardProps) => {
	const percentage = Math.min(Math.max((progress / total) * 100, 0), 100);

	return (
		<View className={cn("", className)}>
			<View className="flex-row justify-between items-center mb-2">
				<Text className="text-sm font-medium text-gray-700">{title}</Text>
				<Text className="text-sm font-semibold text-gray-900">
					{progress} / {total}
				</Text>
			</View>
			<View className="bg-gray-200 h-2 rounded-full overflow-hidden">
				<View
					className="h-full rounded-full"
					style={{
						width: `${percentage}%`,
						backgroundColor: color,
					}}
				/>
			</View>
		</View>
	);
};

export {
	Progress,
	CircularProgress,
	XPProgress,
	ProgressCard,
	progressVariants,
	progressFillVariants,
};
export type {
	ProgressProps,
	CircularProgressProps,
	XPProgressProps,
	ProgressCardProps,
};
