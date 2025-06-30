import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable } from "react-native";
import { cn } from "@/lib/utils";
import { TextClassContext } from "@/components/ui/text";

const buttonVariants = cva(
	"group flex items-center justify-center rounded-xl web:ring-offset-background web:transition-all web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 active:scale-98 web:transition-transform duration-150",
	{
		variants: {
			variant: {
				// Duolingo-style primary button with enhanced hard shadow
				default:
					"bg-duo-primary border-b-4 border-duo-primary-700 shadow-lg shadow-duo-primary-600/50 web:hover:shadow-duo-primary-600/70 active:shadow-duo-primary-600/30 active:border-b-2 active:translate-y-0.5 dark:bg-duo-primary-400 dark:border-duo-primary-800 dark:shadow-duo-primary-500/60",

				// Enhanced secondary button with blue theme
				secondary:
					"bg-duo-secondary border-b-4 border-duo-secondary-700 shadow-lg shadow-duo-secondary-600/50 web:hover:shadow-duo-secondary-600/70 active:shadow-duo-secondary-600/30 active:border-b-2 active:translate-y-0.5 dark:bg-duo-secondary-400 dark:border-duo-secondary-800 dark:shadow-duo-secondary-500/60",

				// Success button with distinct green
				success:
					"bg-duo-success border-b-4 border-duo-primary-800 shadow-lg shadow-duo-primary-600/50 web:hover:shadow-duo-primary-600/70 active:shadow-duo-primary-600/30 active:border-b-2 active:translate-y-0.5 dark:bg-duo-success dark:border-duo-primary-900 dark:shadow-duo-primary-500/60",

				// Warning button with enhanced contrast
				warning:
					"bg-duo-warning border-b-4 border-yellow-600 shadow-lg shadow-yellow-500/50 web:hover:shadow-yellow-500/70 active:shadow-yellow-500/30 active:border-b-2 active:translate-y-0.5 dark:bg-duo-warning dark:border-yellow-700 dark:shadow-yellow-400/60",

				// Destructive button with red theme
				destructive:
					"bg-duo-error border-b-4 border-red-700 shadow-lg shadow-red-600/50 web:hover:shadow-red-600/70 active:shadow-red-600/30 active:border-b-2 active:translate-y-0.5 dark:bg-red-500 dark:border-red-800 dark:shadow-red-400/60",

				// Outline button with enhanced contrast
				outline:
					"border-2 border-duo-primary bg-white shadow-md shadow-duo-primary-300/30 web:hover:bg-duo-primary-50 active:bg-duo-primary-100 active:scale-95 dark:bg-duo-gray-800 dark:border-duo-primary-400 dark:shadow-duo-primary-400/40 dark:web:hover:bg-duo-gray-700 dark:active:bg-duo-gray-600",

				// Ghost button with better visibility
				ghost:
					"web:hover:bg-duo-gray-100 active:bg-duo-gray-200 dark:web:hover:bg-duo-gray-800 dark:active:bg-duo-gray-700",

				// Link button
				link: "web:underline-offset-4 web:hover:underline web:focus:underline dark:text-duo-primary-400",
			},
			size: {
				default: "h-16 px-6 py-4 native:h-18 native:px-6 native:py-5 min-h-16",
				sm: "h-14 px-4 py-4 rounded-lg min-h-14",
				lg: "h-18 px-8 py-5 native:h-20 native:px-8 native:py-6 min-h-18",
				icon: "h-16 w-16 native:h-18 native:w-18",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

const buttonTextVariants = cva(
	"web:whitespace-nowrap text-button font-bold web:transition-colors text-center flex-shrink-0",
	{
		variants: {
			variant: {
				default: "text-white dark:text-white",
				secondary: "text-white dark:text-white",
				success: "text-white dark:text-white",
				warning: "text-duo-gray-900 dark:text-duo-gray-900",
				destructive: "text-white dark:text-white",
				outline:
					"text-duo-primary group-active:text-duo-primary-700 dark:text-duo-primary-400 dark:group-active:text-duo-primary-300",
				ghost:
					"text-duo-gray-700 group-active:text-duo-gray-900 dark:text-duo-gray-300 dark:group-active:text-duo-gray-100",
				link: "text-duo-primary group-active:underline dark:text-duo-primary-400",
			},
			size: {
				default: "text-button leading-5",
				sm: "text-sm font-semibold leading-4",
				lg: "text-lg font-bold leading-6 native:text-xl native:leading-7",
				icon: "",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type ButtonProps = React.ComponentPropsWithoutRef<typeof Pressable> &
	VariantProps<typeof buttonVariants> &
	VariantProps<typeof buttonTextVariants>;

const Button = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	ButtonProps
>(({ className, variant, size, ...props }, ref) => {
	return (
		<TextClassContext.Provider
			value={buttonTextVariants({
				variant,
				size,
				className: "web:pointer-events-none",
			})}
		>
			<Pressable
				className={cn(
					props.disabled && "opacity-60 web:pointer-events-none",
					buttonVariants({ variant, size, className }),
				)}
				ref={ref}
				role="button"
				{...props}
			/>
		</TextClassContext.Provider>
	);
});
Button.displayName = "Button";

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
