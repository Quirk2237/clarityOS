import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { TextClassContext } from "@/components/ui/text";

const buttonVariants = cva(
	"items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 web:select-none web:focus:outline-none web:focus-visible:outline-none web:focus-visible:ring-1 web:focus-visible:ring-ring",
	{
		variants: {
			variant: {
				default:
					"bg-brand-primary web:hover:bg-brand-primary-600 active:bg-brand-primary-700",
				destructive:
					"bg-destructive web:hover:bg-destructive/90 active:bg-destructive/90",
				secondary:
					"bg-brand-secondary web:hover:bg-brand-secondary-600 active:bg-brand-secondary-700",
				ghost:
					"web:hover:bg-accent active:bg-accent web:hover:text-accent-foreground active:text-accent-foreground",
				success:
					"bg-brand-success web:hover:bg-green-600 active:bg-green-700",
				link: "web:underline-offset-4 web:hover:underline web:focus:underline",
				warning:
					"bg-brand-warning web:hover:bg-orange-600 active:bg-orange-700",
				error:
					"bg-brand-error web:hover:bg-red-600 active:bg-red-700",
				outline:
					"border-2 border-brand-primary bg-white web:hover:bg-brand-primary-50 active:bg-brand-primary-100",
				"outline-secondary":
					"border-2 border-brand-secondary bg-white web:hover:bg-brand-secondary-50 active:bg-brand-secondary-100",
				"outline-ghost":
					"web:hover:bg-brand-gray-100 active:bg-brand-gray-200",
			},
			size: {
				default: "h-10 px-4 py-2 native:h-12 native:px-5 native:py-3",
				sm: "h-9 rounded-md px-3 native:h-10 native:px-4",
				lg: "h-11 rounded-md px-8 native:h-14 native:px-8",
				icon: "h-10 w-10 native:h-12 native:w-12",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const buttonTextVariants = cva(
	"web:whitespace-nowrap text-sm native:text-base font-medium text-foreground web:transition-colors",
	{
		variants: {
			variant: {
				default: "text-primary-foreground",
				destructive: "text-destructive-foreground",
				secondary: "text-secondary-foreground",
				ghost: "",
				success: "text-white",
				warning: "text-white",
				error: "text-white",
				outline:
					"text-brand-primary group-active:text-brand-primary-700",
				"outline-secondary": "text-brand-secondary",
				"outline-ghost": "",
				link: "text-brand-primary group-active:underline",
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
