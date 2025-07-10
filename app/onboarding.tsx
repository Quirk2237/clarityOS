import React, { useState } from "react";
import { View, TextInput, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "../components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "../components/ui/text";
import { Title, Subtitle } from "@/components/ui/typography";
import { colors } from "@/constants/colors";
import { useAuth } from "../context/supabase-provider";
import { useProfileStore, type Profile } from "../stores/profile-store";
import { useRouter } from "expo-router";
import { saveAnonymousOnboardingData } from "@/lib/anonymous-storage";

const BUSINESS_STAGES = [
	{ value: 'conceptualizing', label: 'Conceptualizing' },
	{ value: 'just_launched', label: 'Just Launched' },
	{ value: 'one_to_five_years', label: '1-5 Years' },
	{ value: 'industry_pro', label: 'Industry Pro' },
	{ value: 'local_household_name', label: 'Local Household Name' },
] as const;

export default function OnboardingScreen() {
	const [businessName, setBusinessName] = useState("");
	const [businessStage, setBusinessStage] = useState<Profile['business_stage']>(undefined);
	const [businessStageOther, setBusinessStageOther] = useState("");
	const [whatBusinessDoes, setWhatBusinessDoes] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [errors, setErrors] = useState<{ 
		businessName?: string; 
		businessStage?: string;
		businessStageOther?: string;
		whatBusinessDoes?: string; 
	}>({});
	
	const { session } = useAuth();
	const { updateOnboardingInfo } = useProfileStore();
	const router = useRouter();

	const isAuthenticated = !!session?.user?.id;

	// Validation function
	const validateForm = () => {
		const newErrors: typeof errors = {};

		if (!businessName.trim()) {
			newErrors.businessName = "Business name is required";
		}

		if (!businessStage) {
			newErrors.businessStage = "Please select your business stage";
		}

		if (!whatBusinessDoes.trim()) {
			newErrors.whatBusinessDoes = "Please describe what your business does";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Submit handler for authenticated users
	const handleAuthenticatedSubmit = async () => {
		try {
			await updateOnboardingInfo({
				business_name: businessName.trim(),
				business_stage: businessStage!,
				business_stage_other: businessStageOther.trim() || undefined,
				what_your_business_does: whatBusinessDoes.trim(),
			});
			
			console.log('✅ Authenticated user: Onboarding information saved to database');
			
			// Navigate to the main app
			router.replace("/");
		} catch (error) {
			console.error('❌ Error saving onboarding information to database:', error);
			throw error;
		}
	};

	// Submit handler for anonymous users
	const handleAnonymousSubmit = async () => {
		try {
			await saveAnonymousOnboardingData({
				business_name: businessName.trim(),
				business_stage: businessStage!,
				business_stage_other: businessStageOther.trim() || undefined,
				what_your_business_does: whatBusinessDoes.trim(),
			});
			
			console.log('✅ Anonymous user: Onboarding information saved to session storage');
			
			// Navigate to the main app - anonymous users with onboarding data can now access protected routes
			router.replace("/");
		} catch (error) {
			console.error('❌ Error saving anonymous onboarding information:', error);
			throw error;
		}
	};

	// Main submit handler
	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			if (isAuthenticated) {
				await handleAuthenticatedSubmit();
			} else {
				await handleAnonymousSubmit();
			}
		} catch (error) {
			console.error('Error in onboarding submission:', error);
			Alert.alert(
				"Error", 
				"Failed to save your information. Please try again."
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView 
			className="flex-1" 
			style={{ backgroundColor: colors.surface }}
		>
			<ScrollView 
				className="flex-1 px-6" 
				contentContainerStyle={{ flexGrow: 1 }}
				keyboardShouldPersistTaps="handled"
			>
				{/* Header */}
				<View className="pt-8 pb-6">
					<Title className="text-white text-3xl font-bold mb-2">
						Tell us about your business
					</Title>
					<Subtitle className="text-gray-300 text-base leading-relaxed">
						Help us personalize your experience by sharing some basic information about your business.
						{!isAuthenticated && (
							<Text className="text-gray-400 text-sm mt-2">
								{"\n"}💡 Your information will be saved locally. Create an account later to access more features.
							</Text>
						)}
					</Subtitle>
				</View>

				{/* Form */}
				<View className="flex-1 gap-6">
					{/* Business Name Input */}
					<View>
						<Text className="text-white text-lg font-medium mb-3">
							Business Name *
						</Text>
						<TextInput
							value={businessName}
							onChangeText={(text) => {
								setBusinessName(text);
								if (errors.businessName) {
									setErrors(prev => ({ ...prev, businessName: undefined }));
								}
							}}
							placeholder="Enter your business name"
							placeholderTextColor={colors.text + "60"}
							className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-4 text-white text-base"
							style={{
								borderColor: errors.businessName ? "#ef4444" : "#374151",
								backgroundColor: "#1f2937",
							}}
							accessibilityLabel="Business name input"
							accessibilityHint="Enter the name of your business or company"
							autoCapitalize="words"
							autoCorrect={false}
							maxLength={100}
						/>
						{errors.businessName && (
							<Text className="text-red-400 text-sm mt-2">
								{errors.businessName}
							</Text>
						)}
					</View>

					{/* Business Stage Selection */}
					<View>
						<Text className="text-white text-lg font-medium mb-3">
							Business Stage *
						</Text>
						<View className="gap-3">
							{BUSINESS_STAGES.map((stage) => (
								<Button
									key={stage.value}
									onPress={() => {
										setBusinessStage(stage.value);
										if (errors.businessStage) {
											setErrors(prev => ({ ...prev, businessStage: undefined }));
										}
									}}
									className="w-full py-3 px-4 rounded-lg border"
									style={{
										backgroundColor: businessStage === stage.value ? colors.primary + "20" : "#1f2937",
										borderColor: businessStage === stage.value ? colors.primary : "#374151",
									}}
								>
									<Text 
										className="text-base font-medium"
										style={{ 
											color: businessStage === stage.value ? colors.primary : colors.text 
										}}
									>
										{stage.label}
									</Text>
								</Button>
							))}
						</View>
						{errors.businessStage && (
							<Text className="text-red-400 text-sm mt-2">
								{errors.businessStage}
							</Text>
						)}
					</View>

					{/* What Your Business Does Input */}
					<View>
						<Text className="text-white text-lg font-medium mb-3">
							What does your business do? *
						</Text>
						<TextInput
							value={whatBusinessDoes}
							onChangeText={(text) => {
								setWhatBusinessDoes(text);
								if (errors.whatBusinessDoes) {
									setErrors(prev => ({ ...prev, whatBusinessDoes: undefined }));
								}
							}}
							placeholder="Describe what your business does and what makes it unique"
							placeholderTextColor={colors.text + "60"}
							className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-4 text-white text-base"
							style={{
								borderColor: errors.whatBusinessDoes ? "#ef4444" : "#374151",
								backgroundColor: "#1f2937",
								minHeight: 120,
								textAlignVertical: "top",
							}}
							accessibilityLabel="Business description input"
							accessibilityHint="Describe what your business does and what makes it unique"
							multiline
							numberOfLines={4}
							maxLength={500}
						/>
						{errors.whatBusinessDoes && (
							<Text className="text-red-400 text-sm mt-2">
								{errors.whatBusinessDoes}
							</Text>
						)}
						<Text className="text-gray-400 text-sm mt-2">
							{whatBusinessDoes.length}/500 characters
						</Text>
					</View>
				</View>

				{/* Bottom Button */}
				<View className="pb-8 pt-6">
					<Button
						onPress={handleSubmit}
						disabled={isLoading}
						className="w-full py-4 rounded-lg"
						style={{ 
							backgroundColor: isLoading ? colors.primary + "60" : colors.primary,
							opacity: isLoading ? 0.6 : 1,
						}}
					>
						<Text className="text-black font-semibold text-lg">
							{isLoading ? "Saving..." : "Get Started"}
						</Text>
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
} 