import { api } from "convex/_generated/api";
import { useConvexQuery } from "~/hooks/use-convex-query";

/**
 * Custom hook for managing user authentication state.
 *
 * @returns Authentication state as a discriminated union:
 *   - Loading: `{ isLoading: true, isAuthenticated: false, user: undefined }`
 *   - Authenticated: `{ isLoading: false, isAuthenticated: true, user: User }`
 *   - Not authenticated: `{ isLoading: false, isAuthenticated: false, user: null }`
 */
export function useAuth() {
	const user = useConvexQuery(api.users.functions.viewer);

	if (user === undefined) {
		return {
			isLoading: true,
			isAuthenticated: false,
			user: undefined,
		} as const;
	}

	if (user === null) {
		return { isLoading: false, isAuthenticated: false, user: null } as const;
	}

	return { isLoading: false, isAuthenticated: true, user } as const;
}
