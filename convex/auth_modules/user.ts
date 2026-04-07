import type { GenericCtx } from "@convex-dev/better-auth";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { APIError } from "better-auth";
import { internal } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import { generateEmail } from "../utils/emails";
import { rateLimiter } from "../utils/rate_limit";
import { resend } from "./resend";

const siteUrl = process.env.SITE_URL || "http://localhost:3000"; // Fallback if undefined, though usually present

export const userConfig = (ctx: GenericCtx<DataModel>) => {
	/**
	 * Sends a verification email when a user requests to delete their account.
	 * Includes rate limiting to prevent spam.
	 */
	const sendDeleteAccountVerification = async ({
		user,
		token,
	}: {
		user: { email: string };
		token: string;
	}) => {
		const actionCtx = requireActionCtx(ctx);

		const { ok, retryAfter } = await rateLimiter.limit(
			actionCtx,
			"deleteAccount",
			{
				key: user.email,
			},
		);

		if (!ok) {
			throw new APIError("TOO_MANY_REQUESTS", {
				message: `Too many account deletion requests. Please wait before trying again. Retry after ${Math.ceil(retryAfter / 1000 / 60)} minutes.`,
			});
		}

		const deleteUrl = new URL(`${siteUrl}/delete-account`);
		deleteUrl.searchParams.set("token", token);
		deleteUrl.searchParams.set("email", user.email);

		const template = generateEmail({
			url: deleteUrl.toString(),
			type: "delete-account",
		});

		await resend.sendEmail(actionCtx, {
			from: `Evox Exam <${process.env.EMAIL_FROM}>`,
			to: user.email,
			subject: template.subject,
			html: template.html,
		});
	};

	/**
	 * Performs cleanup of user-related data before the user is deleted from the database.
	 * @throws {APIError} If the cleanup process fails, preventing the user deletion.
	 */

	const beforeDelete = async (user: { id: string }) => {
		const actionCtx = requireActionCtx(ctx);

		try {
			console.log("Running profile cleanup before deletion for user", user.id);

			const deleteStatus = await actionCtx.runMutation(
				internal.profile.delete.profileCleanup,
				{
					userId: user.id,
				},
			);

			if (!deleteStatus.success) {
				throw new APIError("INTERNAL_SERVER_ERROR", {
					message: "Failed to delete user",
				});
			}
		} catch (error) {
			console.error("Error during user deletion cleanup:", error);
			throw new APIError("INTERNAL_SERVER_ERROR", {
				message: "Failed to delete user",
			});
		}
	};

	return {
		additionalFields: {
			firstName: {
				type: "string" as const,
				required: true,
				input: true,
			},
			lastName: {
				type: "string" as const,
				required: true,
				input: true,
			},
			role: {
				type: "string" as const,
				required: false,
				input: true,
				enum: ["student", "teacher"],
			},
		},
		deleteUser: {
			enabled: true,
			sendDeleteAccountVerification,
			beforeDelete,
		},
	};
};
