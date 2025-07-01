import { View } from "react-native";
import { colors } from "@/constants/colors";

import { H1, Muted } from "@/components/ui/typography";

export default function Modal() {
	return (
		<View className="flex flex-1 items-center justify-center p-4 gap-y-4" style={{ backgroundColor: colors.surface }}>
			<H1 className="text-center text-white">Modal</H1>
			<Muted className="text-center text-gray-300">This is a modal screen.</Muted>
		</View>
	);
}
