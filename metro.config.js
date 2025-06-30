const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// https://github.com/supabase/supabase-js/issues/1258#issuecomment-2801695478
config.resolver = {
	...config.resolver,
	unstable_conditionNames: ["browser"],
	unstable_enablePackageExports: false,
	assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
	sourceExts: [...config.resolver.sourceExts, "svg"],
};

// Disable Reanimated strict mode warnings
config.transformer = {
	...config.transformer,
	unstable_allowRequireContext: true,
	experimentalImportSupport: false,
	inlineRequires: true,
	babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
