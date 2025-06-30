import { View } from "react-native";

import { H1, Muted } from "@/components/ui/typography";

export default function Modal() {
	return (
		<View className="flex flex-1 items-center justify-center p-4 gap-y-4" style={{ backgroundColor: "#292929" }}>
			<H1 className="text-center text-white">Modal</H1>
			<Muted className="text-center text-gray-300">This is a modal screen.</Muted>
		</View>
	);
}
