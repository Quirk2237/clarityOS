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
	hasOpenAI: boolean;
	hasSupabase: boolean;
	nodeEnv: string;
	timestamp: string;
}

interface TestResult {
	success: boolean;
	message: string;
	details?: string;
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
					hasOpenAI: false, // We can't check server env vars from client
					hasSupabase: !!(process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
					nodeEnv: process.env.NODE_ENV || 'unknown',
					timestamp: new Date().toISOString()
				});
			}
		} catch (error) {
			console.error('Debug info error:', error);
			setDebugInfo({
				hasOpenAI: false,
				hasSupabase: false,
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
					message: "✅ OpenAI API is working!",
					details: `Received response: ${fullResponse.slice(0, 100)}${fullResponse.length > 100 ? '...' : ''}`,
					timestamp: new Date().toLocaleTimeString()
				});
			} else {
				const errorText = await response.text();
				setTestResult({
					success: false,
					message: "❌ OpenAI API Error",
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

	const copyDebugInfo = () => {
		const info = `
Debug Info:
- OpenAI API: ${debugInfo?.hasOpenAI ? '✅ Configured' : '❌ Not found'}
- Supabase: ${debugInfo?.hasSupabase ? '✅ Configured' : '❌ Not found'}
- Node Env: ${debugInfo?.nodeEnv}
- Timestamp: ${debugInfo?.timestamp}

Test Result:
- Success: ${testResult?.success ? 'Yes' : 'No'}
- Message: ${testResult?.message}
- Details: ${testResult?.details}
- Test Time: ${testResult?.timestamp}

AI Response: ${aiResponse}
		`.trim();

		Alert.alert("Debug Info", info, [
			{ text: "OK" }
		]);
	};

	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: colors.surface }}>
			<ScrollView className="flex-1 p-4">
				{/* Header */}
				<View className="items-center mb-6">
					<Title className="text-center text-white">Settings & Debug</Title>
				</View>

				{/* Environment Status */}
				<View className="bg-white rounded-2xl p-5 shadow-lg mb-4">
					<Subtitle className="text-center mb-4 text-gray-800">Environment Status</Subtitle>
					
					<View className="space-y-2">
						<View className="flex-row justify-between items-center">
							<Text className="text-gray-600">OpenAI API Key:</Text>
							<Text className={debugInfo?.hasOpenAI ? "text-green-600" : "text-red-600"}>
								{debugInfo?.hasOpenAI ? "✅ Set" : "❌ Missing"}
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

				{/* OpenAI Test */}
				<View className="bg-white rounded-2xl p-5 shadow-lg mb-4">
					<Subtitle className="text-center mb-4 text-gray-800">OpenAI Connection Test</Subtitle>
					
					<View className="mb-4">
						<Text className="text-gray-600 mb-2">Test Message:</Text>
						<Input
							value={testMessage}
							onChangeText={setTestMessage}
							placeholder="Enter test message..."
							className="bg-gray-50 border border-gray-200"
						/>
					</View>

					<Button
						variant="dark"
						onPress={testOpenAIConnection}
						disabled={isLoading}
						className="mb-4"
					>
						<Text className="text-white">
							{isLoading ? "Testing..." : "Test OpenAI API"}
						</Text>
					</Button>

					{testResult && (
						<View className={`p-3 rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
							<Text className={`font-semibold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
								{testResult.message}
							</Text>
							{testResult.details && (
								<Text className="text-gray-600 text-sm mt-1">
									{testResult.details}
								</Text>
							)}
							<Text className="text-gray-500 text-xs mt-2">
								{testResult.timestamp}
							</Text>
						</View>
					)}

					{aiResponse && (
						<View className="mt-4 p-3 bg-blue-50 rounded-lg">
							<Text className="text-blue-800 font-semibold mb-2">AI Response:</Text>
							<Text className="text-gray-700">{aiResponse}</Text>
						</View>
					)}
				</View>

				{/* Actions */}
				<View className="bg-white rounded-2xl p-5 shadow-lg mb-4">
					<Subtitle className="text-center mb-4 text-gray-800">Debug Actions</Subtitle>
					
					<View className="space-y-3">
						<Button
							variant="white"
							onPress={copyDebugInfo}
							className="border border-gray-200"
						>
							<Text className="text-gray-800">Copy Debug Info</Text>
						</Button>

						<Button
							variant="white"
							onPress={() => {
								setTestResult(null);
								setAiResponse("");
								loadDebugInfo();
							}}
							className="border border-gray-200"
						>
							<Text className="text-gray-800">Clear Results</Text>
						</Button>
					</View>
				</View>

				{/* Sign Out Button */}
				<View className="bg-red-500 rounded-2xl p-5 shadow-lg">
					<Button
						variant="white"
						onPress={() => signOut()}
						className="w-full"
					>
						<Text className="text-red-600 font-semibold">Sign Out</Text>
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
