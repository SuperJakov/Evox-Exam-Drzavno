import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { authComponent } from "../auth";
import type { Doc } from "../better-auth/_generated/dataModel";

/**
 * Returns the currently authenticated user or throws a ConvexError if not authenticated.
 *
 * @param ctx - The Convex mutation or query context.
 * @returns The authenticated user document.
 * @throws {ConvexError} "Not authenticated" if no user is found.
 */
export async function getAuthUserOrThrow(ctx: MutationCtx | QueryCtx) {
	const user = await authComponent.safeGetAuthUser(ctx);
	if (!user) {
		throw new ConvexError("Not authenticated");
	}
	return user;
}

/**
 * Ensures the user has the 'student' role.
 *
 * @param user - The user document to check.
 * @throws {ConvexError} "Only students can perform this action" if the role is not 'student'.
 */
export function requireStudentRole(user: Doc<"user">) {
	if (user.role !== "student") {
		throw new ConvexError("Only students can perform this action");
	}
}

/**
 * Ensures the user is a teacher (not a student).
 *
 * @param user - The user document to check.
 * @throws {ConvexError} "Students cannot perform this action" if the role is 'student'.
 */
export function requireTeacherRole(user: Doc<"user">) {
	if (user.role === "student") {
		throw new ConvexError("Students cannot perform this action");
	}
}

/**
 * Ensures the user's email is verified.
 *
 * @param user - The user document to check.
 * @throws {ConvexError} "Email verification required" if the email is not verified.
 */
export function requireEmailVerified(user: Doc<"user">) {
	if (!user.emailVerified) {
		throw new ConvexError("Email verification required");
	}
}

/**
 * Fetches any user by their ID using the auth component.
 *
 * @param ctx - The Convex mutation or query context.
 * @param userId - The ID of the user to fetch.
 * @returns The user document or null if not found.
 */
export async function getUserById(ctx: MutationCtx | QueryCtx, userId: string) {
	return await authComponent.getAnyUserById(ctx, userId);
}
