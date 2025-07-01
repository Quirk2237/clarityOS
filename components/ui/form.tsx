import * as React from "react";
import {
	Controller,
	ControllerProps,
	FieldPath,
	FieldValues,
	FormProvider,
	Noop,
	useFormContext,
} from "react-hook-form";
import { View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Text } from "./text";

const Form = FormProvider;

type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
	{} as FormFieldContextValue,
);

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
};

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);
	const { getFieldState, formState, handleSubmit } = useFormContext();

	const fieldState = getFieldState(fieldContext.name, formState);

	if (!fieldContext) {
		throw new Error("useFormField should be used within <FormField>");
	}

	const { nativeID } = itemContext;

	return {
		nativeID,
		name: fieldContext.name,
		formItemNativeID: `${nativeID}-form-item`,
		formDescriptionNativeID: `${nativeID}-form-item-description`,
		formMessageNativeID: `${nativeID}-form-item-message`,
		handleSubmit,
		...fieldState,
	};
};

type FormItemContextValue = {
	nativeID: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
	{} as FormItemContextValue,
);

const FormItem = React.forwardRef<
	React.ComponentRef<typeof View>,
	React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => {
	const nativeID = React.useId();

	return (
		<FormItemContext.Provider value={{ nativeID }}>
			<View ref={ref} className={cn("space-y-2", className)} {...props} />
		</FormItemContext.Provider>
	);
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
	React.ComponentRef<typeof Label>,
	Omit<React.ComponentPropsWithoutRef<typeof Label>, "children"> & {
		children: string;
	}
>(({ className, nativeID: _nativeID, ...props }, ref) => {
	const { error, formItemNativeID } = useFormField();

	return (
		<Label
			ref={ref}
			className={cn(
				"pb-1 native:pb-2 px-px",
				error && "text-brand-error",
				className,
			)}
			nativeID={formItemNativeID}
			{...props}
		/>
	);
});
FormLabel.displayName = "FormLabel";

const FormDescription = React.forwardRef<
	React.ComponentRef<typeof Text>,
	React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => {
	const { formDescriptionNativeID } = useFormField();

	return (
		<Text
			ref={ref}
			nativeID={formDescriptionNativeID}
			className={cn("text-caption text-brand-neutrals-textSecondary pt-1", className)}
			{...props}
		/>
	);
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
	React.ComponentRef<typeof Animated.Text>,
	React.ComponentPropsWithoutRef<typeof Animated.Text>
>(({ className, children, ...props }, ref) => {
	const { error, formMessageNativeID } = useFormField();
	const body = error ? String(error?.message) : children;

	if (!body) {
		return null;
	}

	return (
		<Animated.Text
			entering={FadeInDown}
			exiting={FadeOut.duration(275)}
			ref={ref}
			nativeID={formMessageNativeID}
			className={cn("text-caption font-medium text-brand-error", className)}
			{...props}
		>
			{body}
		</Animated.Text>
	);
});
FormMessage.displayName = "FormMessage";

type Override<T, U> = Omit<T, keyof U> & U;

interface FormFieldFieldProps<T> {
	name: string;
	onBlur: Noop;
	onChange: (val: T) => void;
	value: T;
	disabled?: boolean;
}

type FormItemProps<T extends React.ElementType<any>, U> = Override<
	React.ComponentPropsWithoutRef<T>,
	FormFieldFieldProps<U>
> & {
	label?: string;
	description?: string;
};

const FormInput = React.forwardRef<
	React.ComponentRef<typeof Input>,
	FormItemProps<typeof Input, string>
>(({ label, description, onChange, ...props }, ref) => {
	const inputRef = React.useRef<React.ComponentRef<typeof Input>>(null);
	const {
		error,
		formItemNativeID,
		formDescriptionNativeID,
		formMessageNativeID,
	} = useFormField();

	React.useImperativeHandle(ref, () => {
		if (!inputRef.current) {
			return {} as React.ComponentRef<typeof Input>;
		}
		return inputRef.current;
	}, [inputRef.current]);

	function handleOnLabelPress() {
		if (!inputRef.current) {
			return;
		}
		if (inputRef.current.isFocused()) {
			inputRef.current.blur();
		} else {
			inputRef.current.focus();
		}
	}

	return (
		<FormItem>
			{label && (
				<FormLabel
					onPress={handleOnLabelPress}
					nativeID={formItemNativeID}
				>
					{label}
				</FormLabel>
			)}
			{description && (
				<FormDescription nativeID={formDescriptionNativeID}>
					{description}
				</FormDescription>
			)}
			<Input
				ref={inputRef}
				aria-describedby={
					!error
						? `${formDescriptionNativeID}`
						: `${formDescriptionNativeID} ${formMessageNativeID}`
				}
				aria-invalid={!!error}
				onChangeText={onChange}
				{...props}
			/>
			<FormMessage />
		</FormItem>
	);
});
FormInput.displayName = "FormInput";

const FormTextarea = React.forwardRef<
	React.ComponentRef<typeof Textarea>,
	FormItemProps<typeof Textarea, string>
>(({ label, description, onChange, ...props }, ref) => {
	const textareaRef = React.useRef<React.ComponentRef<typeof Textarea>>(null);
	const {
		error,
		formItemNativeID,
		formDescriptionNativeID,
		formMessageNativeID,
	} = useFormField();

	React.useImperativeHandle(ref, () => {
		if (!textareaRef.current) {
			return {} as React.ComponentRef<typeof Textarea>;
		}
		return textareaRef.current;
	}, [textareaRef.current]);

	function handleOnLabelPress() {
		if (!textareaRef.current) {
			return;
		}
		if (textareaRef.current.isFocused()) {
			textareaRef.current.blur();
		} else {
			textareaRef.current.focus();
		}
	}

	return (
		<FormItem>
			{label && (
				<FormLabel
					onPress={handleOnLabelPress}
					nativeID={formItemNativeID}
				>
					{label}
				</FormLabel>
			)}
			{description && (
				<FormDescription nativeID={formDescriptionNativeID}>
					{description}
				</FormDescription>
			)}
			<Textarea
				ref={textareaRef}
				aria-describedby={
					!error
						? `${formDescriptionNativeID}`
						: `${formDescriptionNativeID} ${formMessageNativeID}`
				}
				aria-invalid={!!error}
				onChangeText={onChange}
				{...props}
			/>
			<FormMessage />
		</FormItem>
	);
});
FormTextarea.displayName = "FormTextarea";

const FormSwitch = React.forwardRef<
	React.ComponentRef<typeof Switch>,
	FormItemProps<typeof Switch, boolean>
>(({ label, description, onChange, ...props }, ref) => {
	const switchRef = React.useRef<React.ComponentRef<typeof Switch>>(null);
	const {
		error,
		formItemNativeID,
		formDescriptionNativeID,
		formMessageNativeID,
	} = useFormField();

	React.useImperativeHandle(ref, () => {
		if (!switchRef.current) {
			return {} as React.ComponentRef<typeof Switch>;
		}
		return switchRef.current;
	}, [switchRef.current]);

	return (
		<FormItem>
			<View className="flex-row items-center justify-between">
				<View className="space-y-0.5">
					{label && (
						<FormLabel nativeID={formItemNativeID}>
							{label}
						</FormLabel>
					)}
					{description && (
						<FormDescription nativeID={formDescriptionNativeID}>
							{description}
						</FormDescription>
					)}
				</View>
				<Switch
					ref={switchRef}
					aria-describedby={
						!error
							? `${formDescriptionNativeID}`
							: `${formDescriptionNativeID} ${formMessageNativeID}`
					}
					aria-invalid={!!error}
					{...props}
					onCheckedChange={onChange}
				/>
			</View>
			<FormMessage />
		</FormItem>
	);
});
FormSwitch.displayName = "FormSwitch";

const FormRadioGroup = React.forwardRef<
	React.ComponentRef<typeof RadioGroup>,
	FormItemProps<typeof RadioGroup, string>
>(({ label, description, onChange, ...props }, ref) => {
	const radioGroupRef = React.useRef<React.ComponentRef<typeof RadioGroup>>(null);
	const {
		error,
		formItemNativeID,
		formDescriptionNativeID,
		formMessageNativeID,
	} = useFormField();

	React.useImperativeHandle(ref, () => {
		if (!radioGroupRef.current) {
			return {} as React.ComponentRef<typeof RadioGroup>;
		}
		return radioGroupRef.current;
	}, [radioGroupRef.current]);

	return (
		<FormItem>
			{label && (
				<FormLabel nativeID={formItemNativeID}>
					{label}
				</FormLabel>
			)}
			{description && (
				<FormDescription nativeID={formDescriptionNativeID}>
					{description}
				</FormDescription>
			)}
			<RadioGroup
				ref={radioGroupRef}
				aria-describedby={
					!error
						? `${formDescriptionNativeID}`
						: `${formDescriptionNativeID} ${formMessageNativeID}`
				}
				aria-invalid={!!error}
				{...props}
				onValueChange={onChange}
			/>
			<FormMessage />
		</FormItem>
	);
});
FormRadioGroup.displayName = "FormRadioGroup";

export {
	useFormField,
	Form,
	FormItem,
	FormLabel,
	FormDescription,
	FormMessage,
	FormField,
	FormInput,
	FormTextarea,
	FormSwitch,
	FormRadioGroup,
};
