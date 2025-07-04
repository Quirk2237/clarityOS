import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Pressable, View } from "react-native";
import * as Haptics from 'expo-haptics';
import { cn } from "@/lib/utils";
import { TextClassContext } from "./text";
import { Text } from "./text";
import { colors } from "@/constants/colors";

const buttonVariants = cva(
	"items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 web:select-none web:focus:outline-none web:focus-visible:outline-none border-0",
	{
		variants: {
			variant: {
				dark: "bg-gray-800 web:hover:opacity-80 active:opacity-70",
				white: "bg-white web:hover:opacity-80 active:opacity-70",
				primary: "web:hover:opacity-80 active:opacity-70",
			},
			size: {
				default: "h-12 px-4 py-3 native:h-12 native:px-5 native:py-3",
				sm: "h-10 rounded-full px-3 native:h-10 native:px-4",
				lg: "h-14 rounded-full px-8 native:h-14 native:px-8",
				icon: "h-12 w-12 native:h-12 native:w-12",
				compact: "h-10 px-4 py-2 native:h-10 native:px-4 native:py-2",
			},
		},
		defaultVariants: {
			variant: "white",
			size: "default",
		},
	},
);

const buttonTextVariants = cva(
	"web:whitespace-nowrap text-subtitle native:text-subtitle font-semibold web:transition-colors",
	{
		variants: {
			variant: {
				dark: "text-white",
				white: "text-black",
				primary: "text-black",
			},
			size: {
				default: "",
				sm: "",
				lg: "",
				icon: "",
				compact: "text-sm",
			},
		},
		defaultVariants: {
			variant: "white",
			size: "default",
		},
	},
);

interface ButtonProps
	extends React.ComponentPropsWithoutRef<typeof Pressable>,
		VariantProps<typeof buttonVariants> {
	textClass?: string;
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
	({ className, variant, size, textClass, children, style, ...props }, ref) => {
		const isDarkVariant = variant === "dark";
		const isWhiteVariant = variant === "white";
		const isPrimaryVariant = variant === "primary";
		
		return (
			<TextClassContext.Provider
				value={cn(
					buttonTextVariants({ variant, size, className: textClass }),
					isDarkVariant && { color: colors.primary },
					isWhiteVariant && { color: colors.surface },
					isPrimaryVariant && { color: '#000000' }
				)}
			>
				<Pressable
					className={cn(buttonVariants({ variant, size, className }))}
					style={(state) => {
						const baseStyle = {
							borderWidth: 0,
							borderStyle: 'none',
							outline: 'none',
						};
						const darkStyle = isDarkVariant ? { 
							backgroundColor: colors.surface,
							...baseStyle,
						} : {};
						const whiteStyle = isWhiteVariant ? { 
							backgroundColor: colors.background,
							...baseStyle,
						} : {};
						const primaryStyle = isPrimaryVariant ? {
							backgroundColor: colors.primary,
							...baseStyle,
		        } : {};
						const userStyle = typeof style === 'function' ? style(state) : style;
						return [baseStyle, darkStyle, whiteStyle, primaryStyle, userStyle];
					}}
					ref={ref}
					role="button"
					{...props}
				>
					{children}
				</Pressable>
			</TextClassContext.Provider>
		);
	},
);
Button.displayName = "Button";

// Simple Primary Button - works reliably
interface PrimaryButtonProps {
	onPress: () => void;
	disabled?: boolean;
	children: React.ReactNode;
	className?: string;
	style?: any;
}

const PrimaryButton = React.forwardRef<
	React.ElementRef<typeof Pressable>,
	PrimaryButtonProps
>(({ onPress, disabled = false, children, className, style }, ref) => {
	return (
		<Pressable
			onPress={onPress}
			className={cn("rounded-full items-center justify-center", className)}
			style={[
				{
					backgroundColor: colors.primary,
				},
				style
			]}
			disabled={disabled}
			ref={ref}
		>
			{children}
		</Pressable>
	);
});

PrimaryButton.displayName = "PrimaryButton";

// Transparent Icon - Flexible icon button with square dimensions
interface TransparentIconProps {
	onPress: () => void;
	children?: React.ReactNode;
	icon?: React.ReactNode;
	disabled?: boolean;
	className?: string;
	style?: any;
	hapticStyle?: Haptics.ImpactFeedbackStyle;
}

const TransparentIcon = React.forwardRef<
	React.ElementRef<typeof Pressable>,
	TransparentIconProps
>(({ 
	onPress, 
	children,
	icon,
	disabled = false, 
	className, 
	style,
	hapticStyle = Haptics.ImpactFeedbackStyle.Light 
}, ref) => {
	const handlePress = () => {
		Haptics.impactAsync(hapticStyle);
		onPress();
	};

	// Use icon prop, children, or default three dots
	const iconContent = icon || children || <Text className="text-white text-lg font-bold">⋯</Text>;

	return (
		<Pressable
			onPress={handlePress}
			disabled={disabled}
			className={cn("bg-black/5 rounded-full items-center justify-center active:bg-black/5", className)}
			style={[
				{
					width: 50,
					height: 50,
				},
				style
			]}
			ref={ref}
		>
			{iconContent}
		</Pressable>
	);
});

TransparentIcon.displayName = "TransparentIcon";

export { Button, buttonVariants, buttonTextVariants, PrimaryButton, TransparentIcon };
export type { ButtonProps, PrimaryButtonProps, TransparentIconProps };
