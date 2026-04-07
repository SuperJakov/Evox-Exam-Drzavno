import { v } from "convex/values";
import { action, mutation, query } from "../_generated/server";
import { authComponent, createAuth } from "../auth/index";

export const viewer = query({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		return user;
	},
});

export const updateName = mutation({
	args: {
		firstName: v.string(),
		lastName: v.string(),
	},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		const firstName = args.firstName.trim();
		const lastName = args.lastName.trim();

		if (firstName.length < 2 || firstName.length > 50) {
			throw new Error("First name must be between 2 and 50 characters");
		}

		if (lastName.length < 2 || lastName.length > 50) {
			throw new Error("Last name must be between 2 and 50 characters");
		}

		const nameRegex = /^[\p{L}\s\-']+$/u;
		if (!nameRegex.test(firstName)) {
			throw new Error("First name contains invalid characters");
		}
		if (!nameRegex.test(lastName)) {
			throw new Error("Last name contains invalid characters");
		}

		await auth.api.updateUser({
			headers,
			body: {
				firstName,
				lastName,
			},
		});
	},
});

export const deleteUser = action({
	args: {
		token: v.string(),
	},
	handler: async (ctx, args) => {
		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		await auth.api.deleteUser({
			body: {
				token: args.token,
			},
			headers,
		});
	},
});
