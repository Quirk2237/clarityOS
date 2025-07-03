import { View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "../../../components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "../../../components/ui/text";
import { Input } from "../../../components/ui/input";
import { Title, Subtitle } from "../../../components/ui/typography";
import { useAuth } from "../../../context/supabase-provider";
import { colors } from "@/constants/colors";
import { useState, useEffect } from "react";

interface DebugInfo {
	hasSupabase: boolean;
	openaiKeyLocation: 'local_environment' | 'supabase_secret' | 'unknown';
	nodeEnv: string;
	timestamp: string;
}

interface TestResult {
	success: boolean;
	message: string;
	details: string;
	timestamp: string;
}

export default function Settings() {
	const { signOut } = useAuth();
	const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
	const [testMessage, setTestMessage] = useState("Hello, are you working?");
	const [testResult, setTestResult] = useState<TestResult | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [aiResponse, setAiResponse] = useState<string>("");

	useEffect(() => {
		loadDebugInfo();
	}, []);

	const loadDebugInfo = async () => {
		try {
			const response = await fetch('/api/debug-info');
			if (response.ok) {
				const info = await response.json();
				setDebugInfo(info);
			} else {
				// Fallback for client-side info
				setDebugInfo({
					hasSupabase: !!(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
					openaiKeyLocation: 'unknown',
					nodeEnv: process.env.NODE_ENV || 'unknown',
					timestamp: new Date().toISOString()
				});
			}
		} catch (error) {
			console.error('Debug info error:', error);
			setDebugInfo({
				hasSupabase: false,
				openaiKeyLocation: 'unknown',
				nodeEnv: 'error',
				timestamp: new Date().toISOString()
			});
		}
	};

	const testOpenAIConnection = async () => {
		setIsLoading(true);
		setTestResult(null);
		setAiResponse("");

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: [
						{
							role: 'user',
							content: testMessage
						}
					],
					userId: 'debug-test'
				})
			});

			if (response.ok) {
				const reader = response.body?.getReader();
				const decoder = new TextDecoder();
				let fullResponse = "";

				if (reader) {
					while (true) {
						const { done, value } = await reader.read();
						if (done) break;
						
						const chunk = decoder.decode(value, { stream: true });
						fullResponse += chunk;
						setAiResponse(fullResponse);
					}
				}

				setTestResult({
					success: true,
					message: "✅ AI connection is working!",
					details: `Received response: ${fullResponse.slice(0, 100)}${fullResponse.length > 100 ? '...' : ''}`,
					timestamp: new Date().toLocaleTimeString()
				});
			} else {
				const errorText = await response.text();
				setTestResult({
					success: false,
					message: "❌ AI Connection Error",
					details: `Status: ${response.status}, Error: ${errorText}`,
					timestamp: new Date().toLocaleTimeString()
				});
			}
		} catch (error) {
			setTestResult({
				success: false,
				message: "❌ Connection Failed",
				details: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date().toLocaleTimeString()
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleSignOut = () => {
		Alert.alert(
			"Sign Out",
			"Are you sure you want to sign out?",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Sign Out",
					style: "destructive",
					onPress: () => signOut(),
				},
			],
		);
	};

	return (
		<SafeAreaView className="flex-1">
			<ScrollView className="flex-1 p-4" style={{ backgroundColor: colors.background }}>
				<Title className="text-center mb-6">Settings</Title>

				{/* Environment Status */}
				<View className="bg-white rounded-2xl p-5 shadow-lg mb-4">
					<Subtitle className="text-center mb-4 text-gray-800">Environment Status</Subtitle>
					
					<View className="space-y-2">
						<View className="flex-row justify-between items-center">
							<Text className="text-gray-600">OpenAI API Key:</Text>
							<Text className={debugInfo?.openaiKeyLocation === 'supabase_secret' ? "text-green-600" : "text-orange-600"}>
								{debugInfo?.openaiKeyLocation === 'supabase_secret' ? "✅ Supabase Secret" : 
								 debugInfo?.openaiKeyLocation === 'local_environment' ? "⚠️ Local Env" :
								 "❓ Unknown"}
							</Text>
						</View>
						
						<View className="flex-row justify-between items-center">
							<Text className="text-gray-600">Supabase Config:</Text>
							<Text className={debugInfo?.hasSupabase ? "text-green-600" : "text-red-600"}>
								{debugInfo?.hasSupabase ? "✅ Set" : "❌ Missing"}
							</Text>
						</View>
						
						<View className="flex-row justify-between items-center">
							<Text className="text-gray-600">Environment:</Text>
							<Text className="text-gray-800">{debugInfo?.nodeEnv || 'Loading...'}</Text>
						</View>
					</View>

					<Button
						variant="white"
						onPress={loadDebugInfo}
						className="mt-4"
					>
						<Text className="text-gray-800">Refresh Status</Text>
					</Button>
				</View>

				{/* AI Connection Test */}
				<View className="bg-white rounded-2xl p-5 shadow-lg mb-4">
					<Subtitle className="text-center mb-4 text-gray-800">AI Connection Test</Subtitle>
					
					<Input
						placeholder="Enter test message"
						value={testMessage}
						onChangeText={setTestMessage}
						className="mb-4"
					/>

					<Button
						variant="white"
						onPress={testOpenAIConnection}
						disabled={isLoading}
						className="mb-4"
					>
						<Text className="text-gray-800">
							{isLoading ? "Testing..." : "Test AI Connection"}
						</Text>
					</Button>

					{testResult && (
						<View className="mt-4 p-3 rounded-lg" style={{
							backgroundColor: testResult.success ? '#f0f9ff' : '#fef2f2'
						}}>
							<Text className={testResult.success ? "text-blue-800" : "text-red-800"}>
								{testResult.message}
							</Text>
							<Text className="text-xs text-gray-600 mt-1">
								{testResult.details}
							</Text>
							<Text className="text-xs text-gray-500 mt-1">
								{testResult.timestamp}
							</Text>
						</View>
					)}

					{aiResponse && (
						<View className="mt-4 p-3 bg-gray-50 rounded-lg">
							<Text className="text-gray-700 text-sm">
								<Text className="font-semibold">AI Response: </Text>
								{aiResponse}
							</Text>
						</View>
					)}
				</View>

				{/* Sign Out */}
				<View className="bg-white rounded-2xl p-5 shadow-lg">
					<Subtitle className="text-center mb-4 text-gray-800">Account</Subtitle>
					
					<Button
						variant="white"
						onPress={handleSignOut}
						className="bg-red-50 border-red-200"
					>
						<Text className="text-red-600">Sign Out</Text>
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
