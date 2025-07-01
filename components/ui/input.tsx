import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
	React.ComponentRef<typeof TextInput>,
	TextInputProps
>(({ className, placeholderClassName, ...props }, ref) => {
	return (
		<TextInput
			ref={ref}
			className={cn(
				"web:flex h-12 native:h-12 web:w-full rounded-medium border border-brand-neutrals-textSecondary bg-brand-neutrals-cardBackground px-4 web:py-3 text-body native:text-body native:leading-[1.4] text-brand-neutrals-textPrimary placeholder:text-brand-neutrals-textSecondary web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-brand-primary-vibrantGreen web:focus-visible:ring-offset-2",
				props.editable === false && "opacity-50 web:cursor-not-allowed",
				className,
			)}
			placeholderClassName={cn("text-brand-neutrals-textSecondary", placeholderClassName)}
			{...props}
		/>
	);
});

Input.displayName = "Input";

export { Input };
