import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent, createAuth } from "./index";

/**
 * Lists all active sessions for the current authenticated user.
 */
export const listActiveSessions = query({
	handler: async (ctx) => {
		// Get headers from authenticated user
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		// If no user is logged in, getAuth typically returns a state where headers are empty
		// or auth.api.listSessions will throw/return null.
		const sessions = await auth.api.listSessions({
			headers,
		});

		if (!sessions || !Array.isArray(sessions)) return [];

		return sessions
			.map((session) => ({
				_id: session.id,
				ipAddress: session.ipAddress,
				userAgent: session.userAgent,
				createdAt:
					session.createdAt instanceof Date
						? session.createdAt.getTime()
						: session.createdAt,
				expiresAt:
					session.expiresAt instanceof Date
						? session.expiresAt.getTime()
						: session.expiresAt,
				token: session.token,
			}))
			.sort((a, b) => b.createdAt - a.createdAt);
	},
});

/**
 * Revokes an active session for the authenticated user.
 */
export const revokeSession = mutation({
	args: {
		token: v.string(),
	},
	handler: async (ctx, args) => {
		// Get headers from authenticated user
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		if (!headers.get("Authorization") && !headers.get("Cookie")) {
			throw new Error(
				"Unauthorized: You must be logged in to revoke a session.",
			);
		}

		// Revoke the session
		// Authorized by headers
		await auth.api.revokeSession({
			body: { token: args.token },
			headers,
		});

		return { success: true };
	},
});

/**
 * Returns the current active session for the authenticated user.
 */
export const current = query({
	handler: async (ctx) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		const authSession = await auth.api.getSession({
			headers,
		});

		if (!authSession?.session) {
			return null;
		}

		const session = authSession.session;

		return {
			_id: session.id,
			ipAddress: session.ipAddress,
			userAgent: session.userAgent,
			createdAt:
				session.createdAt instanceof Date
					? session.createdAt.getTime()
					: session.createdAt,
			expiresAt:
				session.expiresAt instanceof Date
					? session.expiresAt.getTime()
					: session.expiresAt,
			token: session.token,
		};
	},
});

/**
 * Signs out the current user by invalidating the current session.
 */
export const signOut = mutation({
	args: {},
	handler: async (ctx) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		await auth.api.signOut({
			headers,
		});
	},
});
