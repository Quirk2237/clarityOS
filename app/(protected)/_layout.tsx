import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { Stack } from "expo-router";
import { View, Text } from "react-native";
import { useAuth } from "../../context/supabase-provider";
import { useProfileStore } from "../../stores/profile-store";
import { getAnonymousUserState, type AnonymousUserState } from "../../lib/anonymous-state";

export default function ProtectedLayout() {
  const { session, initialized } = useAuth();
  const { profile, isLoading: profileLoading, fetchProfile, isInitialized } = useProfileStore();
  const [anonymousState, setAnonymousState] = useState<AnonymousUserState | null>(null);
  const [anonymousStateLoaded, setAnonymousStateLoaded] = useState(false);

  // Fetch profile when session is available (authenticated users)
  useEffect(() => {
    if (session?.user?.id && !isInitialized) {
      fetchProfile(session.user.id);
    }
  }, [session?.user?.id, isInitialized, fetchProfile]);

  // Fetch anonymous state when no session (anonymous users)
  useEffect(() => {
    if (!session && initialized && !anonymousStateLoaded) {
      console.log('🔍 Protected Layout - Loading anonymous state for unauthenticated user...');
      getAnonymousUserState().then((state) => {
        console.log('📱 Protected Layout - Anonymous state loaded:', state);
        setAnonymousState(state);
        setAnonymousStateLoaded(true);
      }).catch((error) => {
        console.error('❌ Protected Layout - Error loading anonymous state:', error);
        setAnonymousStateLoaded(true); // Set as loaded even on error to avoid infinite loading
      });
    }
  }, [session, initialized, anonymousStateLoaded]);

  // Show loading while auth is loading
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff' }}>Loading...</Text>
      </View>
    );
  }

  // Handle anonymous users
  if (!session) {
    // Still loading anonymous state
    if (!anonymousStateLoaded) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
          <Text style={{ color: '#fff' }}>Loading...</Text>
        </View>
      );
    }

    // Anonymous user without onboarding data - redirect to sign-in
    if (!anonymousState?.shouldAllowMainApp) {
      console.log('🚫 Protected Layout - Anonymous user without onboarding, redirecting to sign-in');
      return <Redirect href="/sign-in" />;
    }

    // Anonymous user with onboarding data - allow access to protected routes
    console.log('✅ Protected Layout - Anonymous user with onboarding data, allowing access');
  } else {
    // Authenticated user - show loading while profile is loading
    if (profileLoading || !isInitialized) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
          <Text style={{ color: '#fff' }}>Loading profile...</Text>
        </View>
      );
    }

    // Check if authenticated user has completed onboarding
    const needsOnboarding = !profile?.is_onboarded;

    // Redirect to onboarding if authenticated user hasn't completed it yet
    if (needsOnboarding) {
      console.log('📋 Protected Layout - Authenticated user needs onboarding, redirecting');
      return <Redirect href="/onboarding" />;
    }

    console.log('✅ Protected Layout - Authenticated user with completed onboarding, allowing access');
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
