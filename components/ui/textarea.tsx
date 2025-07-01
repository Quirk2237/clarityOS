import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
	React.ComponentRef<typeof TextInput>,
	TextInputProps
>(
	(
		{
			className,
			multiline = true,
			numberOfLines = 4,
			placeholderClassName,
			...props
		},
		ref,
	) => {
		return (
			<TextInput
				ref={ref}
				className={cn(
					"web:flex min-h-[80px] w-full rounded-medium border border-brand-neutrals-textSecondary bg-brand-neutrals-cardBackground px-4 py-3 text-body native:text-body native:leading-[1.4] text-brand-neutrals-textPrimary web:ring-offset-background placeholder:text-brand-neutrals-textSecondary web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-brand-primary-vibrantGreen web:focus-visible:ring-offset-2",
					props.editable === false && "opacity-50 web:cursor-not-allowed",
					className,
				)}
				placeholderClassName={cn("text-brand-neutrals-textSecondary", placeholderClassName)}
				multiline={multiline}
				numberOfLines={numberOfLines}
				textAlignVertical="top"
				{...props}
			/>
		);
	},
);

Textarea.displayName = "Textarea";

export { Textarea };
