import * as Slot from "@rn-primitives/slot";
import type { SlottableTextProps, TextRef } from "@rn-primitives/types";
import * as React from "react";
import { Platform, Text as RNText } from "react-native";
import { cn } from "@/lib/utils";

const Title = React.forwardRef<TextRef, SlottableTextProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Component = asChild ? Slot.Text : RNText;
		return (
			<Component
				role="heading"
				aria-level="1"
				className={cn(
					"text-title text-brand-neutrals-textPrimary font-funnel-display-bold tracking-tight web:select-text",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Title.displayName = "Title";

const Subtitle = React.forwardRef<TextRef, SlottableTextProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Component = asChild ? Slot.Text : RNText;
		return (
			<Component
				role="heading"
				aria-level="2"
				className={cn(
					"text-subtitle text-brand-neutrals-textPrimary font-funnel-display tracking-tight web:select-text",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Subtitle.displayName = "Subtitle";

const Body = React.forwardRef<TextRef, SlottableTextProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Component = asChild ? Slot.Text : RNText;
		return (
			<Component
				className={cn("text-body text-brand-neutrals-textPrimary font-funnel-sans web:select-text", className)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Body.displayName = "Body";

const Caption = React.forwardRef<TextRef, SlottableTextProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Component = asChild ? Slot.Text : RNText;
		return (
			<Component
				className={cn("text-caption text-brand-neutrals-textSecondary font-funnel-sans web:select-text", className)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Caption.displayName = "Caption";

const BlockQuote = React.forwardRef<TextRef, SlottableTextProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Component = asChild ? Slot.Text : RNText;
		return (
			<Component
				// @ts-ignore - role of blockquote renders blockquote element on the web
				role={Platform.OS === "web" ? "blockquote" : undefined}
				className={cn(
					"mt-6 native:mt-4 border-l-2 border-brand-neutrals-textSecondary pl-6 native:pl-3 text-body text-brand-neutrals-textPrimary italic font-funnel-sans web:select-text",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

BlockQuote.displayName = "BlockQuote";

const Code = React.forwardRef<TextRef, SlottableTextProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Component = asChild ? Slot.Text : RNText;
		return (
			<Component
				// @ts-ignore - role of code renders code element on the web
				role={Platform.OS === "web" ? "code" : undefined}
				className={cn(
					"relative rounded-small bg-brand-neutrals-textSecondary/10 px-[0.3rem] py-[0.2rem] text-caption text-brand-neutrals-textPrimary font-funnel-sans-medium web:select-text",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Code.displayName = "Code";

const Lead = React.forwardRef<TextRef, SlottableTextProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Component = asChild ? Slot.Text : RNText;
		return (
			<Component
				className={cn(
					"text-subtitle text-brand-neutrals-textSecondary font-funnel-sans web:select-text",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Lead.displayName = "Lead";

const Large = React.forwardRef<TextRef, SlottableTextProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Component = asChild ? Slot.Text : RNText;
		return (
			<Component
				className={cn(
					"text-subtitle text-brand-neutrals-textPrimary font-funnel-sans-bold web:select-text",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Large.displayName = "Large";

const Small = React.forwardRef<TextRef, SlottableTextProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Component = asChild ? Slot.Text : RNText;
		return (
			<Component
				className={cn(
					"text-caption text-brand-neutrals-textPrimary font-funnel-sans-medium leading-none web:select-text",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Small.displayName = "Small";

const Muted = React.forwardRef<TextRef, SlottableTextProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Component = asChild ? Slot.Text : RNText;
		return (
			<Component
				className={cn(
					"text-caption text-brand-neutrals-textSecondary font-funnel-sans web:select-text",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);

Muted.displayName = "Muted";

export { BlockQuote, Code, Title, Subtitle, Body, Caption, Large, Lead, Muted, Small };
