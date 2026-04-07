import type { GenericCtx } from "@convex-dev/better-auth";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { APIError } from "better-auth";
import type { DataModel } from "../_generated/dataModel";
import { generateEmail } from "../utils/emails";
import { rateLimiter } from "../utils/rate_limit";
import { resend } from "./resend";

/**
 * Sends a password reset email to a user with a reset URL.
 * Includes rate limiting to prevent abuse - limits requests per email address.
 *
 * @param info - Object containing user email and the password reset URL
 * @param info.user - User object with email address
 * @param info.user.email - The recipient's email address
 * @param info.url - The password reset URL to include in the email
 * @param ctx - Convex context for database operations and authentication
 *
 * @throws {APIError} TOO_MANY_REQUESTS if rate limit is exceeded
 */
export async function sendResetPassword(
	info: { user: { email: string }; url: string },
	ctx: GenericCtx<DataModel>,
) {
	const { ok, retryAfter } = await rateLimiter.limit(
		requireActionCtx(ctx),
		"passwordReset",
		{
			key: info.user.email,
		},
	);
	if (!ok) {
		throw new APIError("TOO_MANY_REQUESTS", {
			message: `Too many password reset requests. Please wait before trying again. Retry after ${Math.ceil(retryAfter / 1000 / 60)} minutes.`,
		});
	}

	const template = generateEmail({
		url: info.url,
		type: "reset-password",
	});

	await resend.sendEmail(requireActionCtx(ctx), {
		from: `Evox Exam <${process.env.EMAIL_FROM}>`,
		to: info.user.email,
		subject: template.subject,
		html: template.html,
	});
}

/**
 * Sends a confirmation email to a user after their password has been successfully changed.
 * This notification helps users detect unauthorized password changes.
 *
 * @param user - Object containing user information
 * @param user.user - User object with email address
 * @param user.user.email - The recipient's email address
 * @param ctx - Convex context for database operations and authentication
 */
export async function sendPasswordChanged(
	user: { user: { email: string } },
	ctx: GenericCtx<DataModel>,
) {
	const template = generateEmail({
		type: "password-changed",
	});

	await resend.sendEmail(requireActionCtx(ctx), {
		from: `Evox Exam <${process.env.EMAIL_FROM}>`,
		to: user.user.email,
		subject: template.subject,
		html: template.html,
	});
}
