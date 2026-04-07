import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "../lib/auth-client";

/**
 * Provides a sign-out action that clears both client and server session state.
 *
 * The `signOut` function performs three steps in order:
 * 1. Redirects the user to the home page via Next.js router.
 * 2. Clears local auth state through `authClient.signOut()`.
 * 3. Invalidates the server-side session via the `auth.sessions.signOut` Convex mutation.
 *
 * Errors are not handled and are logged to the console so that a transient backend
 * failure does not leave the UI in a broken state.
 *
 * @returns An object containing:
 *   - `signOut()` - async function that initiates the sign-out flow.
 *   - `isLoading` - `true` while the sign-out is in progress.
 */
export function useSignOut() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const signOutMutation = useMutation(api.auth.sessions.signOut);

	const signOut = async () => {
		setIsLoading(true);
		try {
			// Redirect to home
			router.push("/");

			// Clear local auth state
			await authClient.signOut();

			// Sign out on the server
			await signOutMutation();
		} catch (error) {
			console.error("Error signing out:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		signOut,
		isLoading,
	};
}
