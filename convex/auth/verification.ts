import { APIError } from "better-auth";
import { v } from "convex/values";
import { action } from "../_generated/server";
import { authComponent, createAuth } from "./index";

export const verifyEmail = action({
	args: {
		email: v.string(),
		otp: v.string(),
	},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
		try {
			await auth.api.verifyEmailOTP({
				headers,
				body: {
					email: args.email,
					otp: args.otp,
				},
			});

			return { success: true } as const;
		} catch (error) {
			console.error(error);
			if (error instanceof APIError) {
				return {
					success: false,
					error: error.body?.code === "INVALID_OTP" ? "INVALID_OTP" : undefined,
				} as const;
			}
			return {
				success: false,
			} as const;
		}
	},
});

export const sendVerificationOtp = action({
	args: {
		email: v.string(),
	},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		await auth.api.sendVerificationOTP({
			headers,
			body: {
				email: args.email,
				type: "email-verification",
			},
		});

		return { success: true };
	},
});
