import { convexClient } from "@convex-dev/better-auth/client/plugins";
import {
	emailOTPClient,
	inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [
		convexClient(),
		emailOTPClient(),
		inferAdditionalFields({
			user: {
				firstName: {
					type: "string",
				},
				lastName: {
					type: "string",
				},
				role: {
					type: "string",
					required: false,
				},
			},
		}),
	],
});

export type Session = typeof authClient.$Infer.Session;

export async function getTokenFromClient() {
	const { data } = await authClient.convex.token();

	const token = data?.token || null;

	return token;
}
