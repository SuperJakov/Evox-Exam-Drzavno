import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import { createHooks } from "../auth_modules/hooks";
import { sendVerificationOTP } from "../auth_modules/otp";
import {
	sendPasswordChanged,
	sendResetPassword,
} from "../auth_modules/password";
import { userConfig } from "../auth_modules/user";
import authSchema from "../better-auth/schema";

const siteUrl = process.env.SITE_URL;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel, typeof authSchema>(
	components.betterAuth,
	{
		local: {
			schema: authSchema,
		},
	},
);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
	return betterAuth(createAuthOptions(ctx));
};

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
	return {
		baseURL: siteUrl,
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: true,
			async sendResetPassword(info, _ctx) {
				await sendResetPassword(info, ctx);
			},
			async onPasswordReset(user) {
				await sendPasswordChanged(user, ctx);
			},
		},
		advanced: {
			ipAddress: {
				// x-client-ip is set by our /api/auth/... route
				ipAddressHeaders: ["x-client-ip"],
			},
		},
		user: userConfig(ctx),
		plugins: [
			// The Convex plugin is required for Convex compatibility
			convex({
				authConfig,
				jwksRotateOnTokenGenerationError: true,
			}),
			emailOTP({
				otpLength: 6,
				sendVerificationOnSignUp: true,
				async sendVerificationOTP(args) {
					await sendVerificationOTP(args, ctx);
				},
			}),
		],
		hooks: createHooks(ctx),
	} satisfies BetterAuthOptions;
};
