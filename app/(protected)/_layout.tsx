import { useEffect } from "react";
import { Redirect } from "expo-router";
import { Stack } from "expo-router";
import { View, Text } from "react-native";
import { useAuth } from "../../context/supabase-provider";
import { useProfileStore } from "../../stores/profile-store";

export default function ProtectedLayout() {
  const { session, initialized } = useAuth();
  const { profile, isLoading: profileLoading, fetchProfile, isInitialized } = useProfileStore();

  // Fetch profile when session is available
  useEffect(() => {
    if (session?.user?.id && !isInitialized) {
      fetchProfile(session.user.id);
    }
  }, [session?.user?.id, isInitialized, fetchProfile]);

  // Show loading while auth is loading
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff' }}>Loading...</Text>
      </View>
    );
  }

  // Redirect to sign-in if no session
  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  // Show loading while profile is loading
  if (profileLoading || !isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff' }}>Loading profile...</Text>
      </View>
    );
  }

  // Check if user has completed onboarding
  const needsOnboarding = !profile?.is_onboarded;

  // Redirect to onboarding if user hasn't completed it yet
  if (needsOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="cards/[slug]/index" />
    </Stack>
  );
}
