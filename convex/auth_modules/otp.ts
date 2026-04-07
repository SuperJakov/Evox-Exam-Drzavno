import type { GenericCtx } from "@convex-dev/better-auth";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { APIError } from "better-auth";
import type { DataModel } from "../_generated/dataModel";
import { generateEmail } from "../utils/emails";
import { rateLimiter } from "../utils/rate_limit";
import { resend } from "./resend";

/**
 * Sends a verification One-Time Password (OTP) via email.
 *
 * This function handles sending OTPs for various authentication flows including
 * email verification, sign-in, and password recovery. It includes rate limiting
 * to prevent abuse and throws an error if the limit is exceeded.
 *
 * @param params - The OTP details.
 * @param params.otp - The generated one-time password string.
 * @param params.type - The purpose of the OTP ("email-verification", "sign-in", or "forget-password").
 * @param params.email - The recipient's email address.
 * @param ctx - The Convex context, which must be an action context.
 *
 * @throws {APIError} "TOO_MANY_REQUESTS" if the rate limit for sending OTPs to the given email is exceeded.
 */
export async function sendVerificationOTP(
	{
		otp,
		type,
		email,
	}: {
		otp: string;
		type: "email-verification" | "sign-in" | "forget-password" | "change-email";
		email: string;
	},
	ctx: GenericCtx<DataModel>,
) {
	if (type === "change-email") {
		throw new APIError("BAD_REQUEST", {
			message: "We do not support changing email addresses yet.",
		});
	}

	const { ok, retryAfter } = await rateLimiter.limit(
		requireActionCtx(ctx),
		"emailOTP",
		{
			key: email,
		},
	);

	if (!ok) {
		console.log("Rate limit reached");
		throw new APIError("TOO_MANY_REQUESTS", {
			message: `Too many OTP requests. Please wait before trying again. Retry after ${Math.ceil(retryAfter / 1000 / 60)} minutes.`,
		});
	}

	const template = generateEmail({ otp, type });

	await resend.sendEmail(requireActionCtx(ctx), {
		from: `Evox Exam <${process.env.EMAIL_FROM}>`,
		to: email,
		subject: template.subject,
		html: template.html,
	});
}
