import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";
import { SplashScreen, useRouter } from "expo-router";

import { Session } from "@supabase/supabase-js";

import { supabase } from "@/config/supabase";
import { DataMigrator } from "../lib/data-migration";

SplashScreen.preventAutoHideAsync();

type AuthState = {
	initialized: boolean;
	session: Session | null;
	signUp: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
	initialized: false,
	session: null,
	signUp: async () => {},
	signIn: async () => {},
	signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: PropsWithChildren) {
	const [initialized, setInitialized] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const router = useRouter();

	// ✅ Data migration trigger
	const triggerDataMigration = async (userSession: Session) => {
		try {
			// Check if there's local data to migrate
			const hasLocalData = await DataMigrator.hasLocalData();
			
			if (hasLocalData) {
				console.log("🔄 Local data detected, starting migration...");
				
				const migrator = new DataMigrator(userSession);
				const result = await migrator.migrateAllLocalData();
				
				if (result.success) {
					console.log("✅ Data migration completed successfully:", result.migratedItems);
					// Could show a success toast here
				} else {
					console.error("❌ Data migration had errors:", result.errors);
					// Could show an error toast here
				}
			} else {
				console.log("ℹ️ No local data to migrate");
			}
		} catch (error) {
			console.error("💥 Data migration failed:", error);
		}
	};

	const signUp = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			console.error("Error signing up:", error);
			throw error;
		}

		if (data.user && data.session) {
			// Create profile record for the new user
			const { error: profileError } = await supabase.from("profiles").insert({
				id: data.user.id,
				email: data.user.email!,
				name: null,
				company_name: null,
				subscription_status: "free",
			});

			if (profileError) {
				console.error("Error creating user profile:", profileError);
				// Don't throw here as the user is already created in auth
				// The profile can be created later if needed
			}

			setSession(data.session);
			console.log("User signed up:", data.user);
			
			// ✅ Trigger data migration after successful sign-up
			await triggerDataMigration(data.session);
		} else {
			console.log("No user returned from sign up");
		}
	};

	const signIn = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error("Error signing in:", error);
			return;
		}

		if (data.session) {
			setSession(data.session);
			console.log("User signed in:", data.user);
			
			// ✅ Trigger data migration after successful sign-in
			await triggerDataMigration(data.session);
		} else {
			console.log("No user returned from sign in");
		}
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error("Error signing out:", error);
			return;
		} else {
			console.log("User signed out");
		}
	};

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		setInitialized(true);
	}, []);

	useEffect(() => {
		const handleNavigation = async () => {
			if (initialized) {
				SplashScreen.hideAsync();
				if (session) {
					// Go directly to home screen - no onboarding
					router.replace("/" as any);
				} else {
					router.replace("/welcome" as any);
				}
			}
		};

		handleNavigation();
		// eslint-disable-next-line
	}, [initialized, session]);

	return (
		<AuthContext.Provider
			value={{
				initialized,
				session,
				signUp,
				signIn,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
