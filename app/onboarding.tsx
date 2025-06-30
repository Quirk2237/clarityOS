import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";
import { ensureUserProfile } from "@/lib/database-helpers";
import type { Database } from "@/lib/database.types";

type OnboardingGoal =
	Database["public"]["Tables"]["onboarding_responses"]["Row"]["goal"];
type BusinessStage =
	Database["public"]["Tables"]["onboarding_responses"]["Row"]["business_stage"];

interface OnboardingData {
	goal: OnboardingGoal | null;
	goalOtherText: string;
	businessStage: BusinessStage | null;
	businessStageOtherText: string;
}

const GOAL_OPTIONS = [
	{ value: "get_clarity" as const, label: "Get clarity" },
	{
		value: "build_confidence" as const,
		label: "Build confidence in what I&apos;m selling",
	},
	{
		value: "explain_what_i_do" as const,
		label: "Be able to explain what I do",
	},
	{ value: "boost_career" as const, label: "Boost my career" },
	{ value: "other" as const, label: "Other" },
];

const BUSINESS_STAGE_OPTIONS = [
	{ value: "conceptualizing" as const, label: "Still conceptualizing" },
	{ value: "just_launched" as const, label: "Just launched" },
	{ value: "one_to_five_years" as const, label: "1-5 years in" },
	{ value: "industry_pro" as const, label: "Industry pro" },
	{ value: "local_household_name" as const, label: "Local household name" },
];

export default function OnboardingScreen() {
	const [currentStep, setCurrentStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [data, setData] = useState<OnboardingData>({
		goal: null,
		goalOtherText: "",
		businessStage: null,
		businessStageOtherText: "",
	});

	const { session } = useAuth();
	const router = useRouter();

	const totalSteps = 2;
	const progress = (currentStep / totalSteps) * 100;

	const handleGoalChange = (value: string) => {
		setData((prev) => ({ ...prev, goal: value as OnboardingGoal }));
	};

	const handleBusinessStageChange = (value: string) => {
		setData((prev) => ({ ...prev, businessStage: value as BusinessStage }));
	};

	const handleNext = () => {
		if (currentStep === 1) {
			if (!data.goal) {
				Alert.alert(
					"Please select an option",
					"Please choose your goal before continuing.",
				);
				return;
			}
			if (data.goal === "other" && !data.goalOtherText.trim()) {
				Alert.alert(
					"Please specify",
					"Please specify your goal in the text field.",
				);
				return;
			}
			setCurrentStep(2);
		} else if (currentStep === 2) {
			handleSubmit();
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleSubmit = async () => {
		if (!data.businessStage) {
			Alert.alert(
				"Please select an option",
				"Please choose your business stage before continuing.",
			);
			return;
		}

		if (!session?.user?.id || !session?.user?.email) {
			Alert.alert("Error", "Please sign in to continue.");
			return;
		}

		setIsSubmitting(true);

		try {
			// Ensure user profile exists before saving onboarding responses
			const { error: profileError } = await ensureUserProfile(
				session.user.id,
				session.user.email,
			);

			if (profileError) {
				console.error("Error ensuring user profile:", profileError);
				Alert.alert(
					"Error",
					"Failed to create user profile. Please try again.",
				);
				return;
			}

			const { error } = await supabase.from("onboarding_responses").insert({
				user_id: session.user.id,
				goal: data.goal!,
				goal_other_text: data.goal === "other" ? data.goalOtherText : null,
				business_stage: data.businessStage!,
				business_stage_other_text: null,
				completed_at: new Date().toISOString(),
			});

			if (error) {
				console.error("Error saving onboarding responses:", error);
				Alert.alert(
					"Error",
					"Failed to save your responses. Please try again.",
				);
				return;
			}

			// Navigate to home screen
			router.replace("/(protected)/" as any);
		} catch (error) {
			console.error("Error during onboarding submission:", error);
			Alert.alert("Error", "Something went wrong. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderProgressBar = () => (
		<View className="mb-8">
			<View className="flex-row justify-between items-center mb-2">
				<Text className="text-sm text-muted-foreground">
					Step {currentStep} of {totalSteps}
				</Text>
				<Text className="text-sm text-muted-foreground">
					{Math.round(progress)}%
				</Text>
			</View>
			<View className="h-2 bg-muted rounded-full">
				<View
					className="h-full bg-primary rounded-full transition-all duration-300"
					style={{ width: `${progress}%` }}
				/>
			</View>
		</View>
	);

	const renderQuestion1 = () => (
		<View className="flex-1">
			<Text className="text-2xl font-bold mb-2">What&apos;s your goal?</Text>
			<Text className="text-muted-foreground mb-8">
				Help us understand what you&apos;re looking to achieve.
			</Text>

			<RadioGroup
				value={data.goal || ""}
				onValueChange={handleGoalChange}
				className="gap-4"
			>
				{GOAL_OPTIONS.map((option) => (
					<View
						key={option.value}
						className="flex-row items-center gap-3 p-4 border border-border rounded-lg"
					>
						<RadioGroupItem value={option.value} />
						<Label className="flex-1 text-base">{option.label}</Label>
					</View>
				))}
			</RadioGroup>

			{data.goal === "other" && (
				<View className="mt-4">
					<Input
						placeholder="Please specify your goal..."
						value={data.goalOtherText}
						onChangeText={(text) =>
							setData((prev) => ({ ...prev, goalOtherText: text }))
						}
						className="text-base"
					/>
				</View>
			)}
		</View>
	);

	const renderQuestion2 = () => (
		<View className="flex-1">
			<Text className="text-2xl font-bold mb-2">
				What stage is your business in?
			</Text>
			<Text className="text-muted-foreground mb-8">
				This helps us tailor the experience to your journey.
			</Text>

			<RadioGroup
				value={data.businessStage || ""}
				onValueChange={handleBusinessStageChange}
				className="gap-4"
			>
				{BUSINESS_STAGE_OPTIONS.map((option) => (
					<View
						key={option.value}
						className="flex-row items-center gap-3 p-4 border border-border rounded-lg"
					>
						<RadioGroupItem value={option.value} />
						<Label className="flex-1 text-base">{option.label}</Label>
					</View>
				))}
			</RadioGroup>
		</View>
	);

	const renderNavigationButtons = () => (
		<View className="flex-row gap-4 mt-8">
			{currentStep > 1 && (
				<Button
					variant="outline"
					onPress={handleBack}
					className="flex-1"
					disabled={isSubmitting}
				>
					<Text>Back</Text>
				</Button>
			)}
			<Button
				onPress={handleNext}
				className={currentStep === 1 ? "flex-1" : "flex-1"}
				disabled={isSubmitting}
			>
				<Text>
					{currentStep === totalSteps
						? isSubmitting
							? "Saving..."
							: "Complete"
						: "Continue"}
				</Text>
			</Button>
		</View>
	);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView
				className="flex-1 px-6"
				contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				{renderProgressBar()}

				{currentStep === 1 && renderQuestion1()}
				{currentStep === 2 && renderQuestion2()}

				{renderNavigationButtons()}
			</ScrollView>
		</SafeAreaView>
	);
}
