import { View } from "react-native";
import { SafeAreaView } from "../../../components/safe-area-view";
import { Text } from "../../../components/ui/text";
import { Title } from "../../../components/ui/typography";

export default function Dashboard() {
	return (
		<SafeAreaView className="flex-1 bg-background">
			<View className="flex-1 items-center justify-center p-4">
				<Title className="text-center text-foreground mb-4">Dashboard</Title>
				<Text className="text-center text-muted-foreground text-lg">
					Coming Soon
				</Text>
			</View>
		</SafeAreaView>
	);
}
