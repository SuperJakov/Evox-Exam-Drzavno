import { api } from "convex/_generated/api";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { fetchAuthQuery } from "./auth-server";
import { getTokenFromServer } from "./get-token-from-server";

/**
 * Configuration options for the `redirectIfAuthenticated` function.
 */
export interface RedirectIfAuthenticatedOptions {
	/** The path to redirect to if a valid token exists but the user is not found in the database. */
	noUserFoundPath: Route;
	/** The path to redirect to if the authenticated user has the 'teacher' role. */
	teacherPath: Route;
	/** The path to redirect to if the authenticated user has the 'student' role. */
	studentPath: Route;
}

/**
 * Checks whether the current session has an authentication token, queries the
 * user record on the server, and redirects them based on their presence and role.
 *
 * @param {RedirectIfAuthenticatedOptions} options - Redirection configuration paths.
 * @returns {Promise<void>} Resolves if there is no token, otherwise redirects.
 */
export async function redirectIfAuthenticated(
	options: RedirectIfAuthenticatedOptions,
) {
	const token = await getTokenFromServer();

	if (token) {
		const user = await fetchAuthQuery(api.users.functions.viewer, {});

		if (!user) {
			redirect(options.noUserFoundPath);
		}

		if (user.role === "teacher") {
			redirect(options.teacherPath);
		}

		redirect(options.studentPath);
	}
}
