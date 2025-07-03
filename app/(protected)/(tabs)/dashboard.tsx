import { View } from "react-native";
import { SafeAreaView } from "../../../components/safe-area-view";
import { Text } from "../../../components/ui/text";
import { colors } from "@/constants/colors";

export default function Dashboard() {
	return (
		<SafeAreaView className="flex-1" style={{ backgroundColor: colors.surface }}>
			<View className="flex-1 justify-center items-center">
				<Text className="text-2xl font-semibold text-gray-600">Coming Soon</Text>
			</View>
		</SafeAreaView>
	);
}
