import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { TextClassContext } from "./text";

const buttonVariants = cva(
	"items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 web:select-none web:focus:outline-none web:focus-visible:outline-none web:focus-visible:ring-1 web:focus-visible:ring-ring",
	{
		variants: {
			variant: {
				default:
					"bg-brand-primary-vibrantGreen web:hover:bg-brand-primary-neonGreen active:bg-brand-primary-vibrantGreen/80",
				destructive:
					"bg-brand-error web:hover:bg-brand-error/90 active:bg-brand-error/90",
				secondary:
					"bg-brand-primary-neonGreen web:hover:bg-brand-primary-vibrantGreen active:bg-brand-primary-neonGreen/80",
				ghost:
					"web:hover:bg-accent active:bg-accent web:hover:text-accent-foreground active:text-accent-foreground",
				success:
					"bg-brand-success web:hover:bg-brand-success/90 active:bg-brand-success/90",
				link: "web:underline-offset-4 web:hover:underline web:focus:underline",
				warning:
					"bg-brand-warning web:hover:bg-brand-warning/90 active:bg-brand-warning/90",
				error:
					"bg-brand-error web:hover:bg-brand-error/90 active:bg-brand-error/90",
				outline:
					"border-2 border-brand-primary-vibrantGreen bg-white web:hover:bg-brand-primary-vibrantGreen/10 active:bg-brand-primary-vibrantGreen/20",
				"outline-secondary":
					"border-2 border-brand-primary-neonGreen bg-white web:hover:bg-brand-primary-neonGreen/10 active:bg-brand-primary-neonGreen/20",
				"outline-ghost":
					"web:hover:bg-brand-neutrals-textSecondary/10 active:bg-brand-neutrals-textSecondary/20",
				action:
					"bg-white/30 web:hover:bg-white/40 active:bg-white/20",
			},
			size: {
				default: "h-12 px-4 py-3 native:h-12 native:px-5 native:py-3",
				sm: "h-10 rounded-full px-3 native:h-10 native:px-4",
				lg: "h-14 rounded-full px-8 native:h-14 native:px-8",
				icon: "h-12 w-12 native:h-12 native:w-12",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const buttonTextVariants = cva(
	"web:whitespace-nowrap text-subtitle native:text-subtitle font-semibold text-foreground web:transition-colors",
	{
		variants: {
			variant: {
				default: "text-brand-neutrals-textPrimary",
				destructive: "text-white",
				secondary: "text-brand-neutrals-textPrimary",
				ghost: "",
				success: "text-white",
				warning: "text-white",
				error: "text-white",
				outline:
					"text-brand-primary-vibrantGreen group-active:text-brand-primary-vibrantGreen/80",
				"outline-secondary": "text-brand-primary-neonGreen",
				"outline-ghost": "",
				link: "text-brand-primary-vibrantGreen group-active:underline",
				action: "text-brand-neutrals-textPrimary",
			},
			size: {
				default: "",
				sm: "",
				lg: "",
				icon: "",
			},
		},
		defaultVariants: {
			variant: "default",
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
	({ className, variant, size, textClass, children, ...props }, ref) => {
		return (
			<TextClassContext.Provider
				value={cn(
					buttonTextVariants({ variant, size, className: textClass }),
				)}
			>
				<Pressable
					className={cn(buttonVariants({ variant, size, className }))}
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
