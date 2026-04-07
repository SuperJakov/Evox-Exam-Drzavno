import type { GenericCtx } from "@convex-dev/better-auth";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { APIError } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import type { Doc as AuthDoc } from "../better-auth/_generated/dataModel";
import { generateEmail } from "../utils/emails";
import { rateLimiter } from "../utils/rate_limit";
import { getPasswordStrength } from "../utils/validators";
import { resend } from "./resend";

export const createHooks = (ctx: GenericCtx<DataModel>) => ({
	before: createAuthMiddleware(async (hookCtx) => {
		const clientIp = hookCtx.headers?.get("x-client-ip");
		console.log("Client IP:", clientIp);

		// Specific route rate limiting
		if (hookCtx.path === "/email-otp/verify-email") {
			const body = hookCtx.body as Record<string, unknown> | undefined;
			const email = body?.email;
			if (typeof email === "string") {
				const { ok, retryAfter } = await rateLimiter.limit(
					requireActionCtx(ctx),
					"verifyOTP",
					{ key: email },
				);
				if (!ok) {
					throw new APIError("TOO_MANY_REQUESTS", {
						message: `Too many verification attempts. Please wait ${Math.ceil(retryAfter / 1000)} seconds.`,
					});
				}
			}
		}

		if (hookCtx.path === "/email-otp/send-verification-otp") {
			const body = hookCtx.body as Record<string, unknown> | undefined;
			const email = body?.email;
			if (typeof email === "string") {
				const { ok, retryAfter } = await rateLimiter.limit(
					requireActionCtx(ctx),
					"emailOTP",
					{ key: email },
				);
				if (!ok) {
					throw new APIError("TOO_MANY_REQUESTS", {
						message: `Too many OTP requests. Please wait ${Math.ceil(retryAfter / 1000 / 60)} minutes.`,
					});
				}
			}
		}

		if (
			hookCtx.path === "/sign-up/email" ||
			hookCtx.path === "/reset-password"
		) {
			const body = hookCtx.body as Record<string, unknown> | undefined;
			const password =
				hookCtx.path === "/reset-password" ? body?.newPassword : body?.password;

			if (typeof password === "string") {
				const score = getPasswordStrength(password);

				if (score < 5) {
					throw new APIError("BAD_REQUEST", {
						message:
							"Password is too weak. It must be at least 8 characters long and contain uppercase, lowercase, number, and special character.",
					});
				}
			}
		}
	}),
	after: createAuthMiddleware(async (hookCtx) => {
		// Send welcome email after successful email verification
		if (hookCtx.path === "/email-otp/verify-email") {
			const returned = hookCtx.context.returned;
			console.log(returned);
			// If the verification failed, better-auth throws (or returns) an APIError.
			// We should not send the welcome email in that case.
			if (returned instanceof APIError) {
				return;
			}

			// If email is present in the body, it was successful verification
			if (hookCtx.body?.email) {
				console.log("Sending welcome email");
				const email = hookCtx.body.email as string;

				// Look up the user to personalise the email with their role and name
				const user: AuthDoc<"user"> | null = await ctx.runQuery(
					components.betterAuth.user.getUserByEmail,
					{ email },
				);

				if (!user) {
					console.error("User not found with email: ", email);
					return;
				}

				const role = user.role as "teacher" | "student";
				const name = user.firstName;

				// Send welcome email
				const template = generateEmail({
					type: "welcome",
					role,
					name,
				});

				await resend.sendEmail(requireActionCtx(ctx), {
					from: `Evox Exam <${process.env.EMAIL_FROM}>`,
					to: email,
					subject: template.subject,
					html: template.html,
				});
			}
		}
	}),
});
