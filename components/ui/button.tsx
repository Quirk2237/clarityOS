import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { TextClassContext } from "./text";
import { colors } from "@/constants/colors";

const buttonVariants = cva(
	"items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 web:select-none web:focus:outline-none web:focus-visible:outline-none web:focus-visible:ring-1 web:focus-visible:ring-ring border-0",
	{
		variants: {
			variant: {
				dark: "bg-gray-800 web:hover:opacity-80 active:opacity-70",
				white: "bg-white web:hover:opacity-80 active:opacity-70",
			},
			size: {
				default: "h-12 px-4 py-3 native:h-12 native:px-5 native:py-3",
				sm: "h-10 rounded-full px-3 native:h-10 native:px-4",
				lg: "h-14 rounded-full px-8 native:h-14 native:px-8",
				icon: "h-12 w-12 native:h-12 native:w-12",
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
			},
			size: {
				default: "",
				sm: "",
				lg: "",
				icon: "",
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
		
		return (
			<TextClassContext.Provider
				value={cn(
					buttonTextVariants({ variant, size, className: textClass }),
					isDarkVariant && { color: colors.primary },
					isWhiteVariant && { color: colors.surface }
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
						const userStyle = typeof style === 'function' ? style(state) : style;
						return [baseStyle, darkStyle, whiteStyle, userStyle];
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

export { Button, buttonVariants, buttonTextVariants };
export type { ButtonProps };
