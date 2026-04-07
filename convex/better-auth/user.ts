import { v } from "convex/values";
import { query } from "./_generated/server";

export const getUserById = query({
	args: {
		userId: v.string(),
	},
	handler: async (ctx, args) => {
		const normalizedId = ctx.db.normalizeId("user", args.userId);

		if (!normalizedId) {
			return null;
		}

		return await ctx.db
			.query("user")
			.withIndex("by_id", (q) => q.eq("_id", normalizedId))
			.first();
	},
});

export const batchGetUsersById = query({
	args: {
		userIds: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		const allUsers = await Promise.all(
			args.userIds.map(async (id) => {
				const normalizedId = ctx.db.normalizeId("user", id);
				if (!normalizedId) return null;
				return await ctx.db.get("user", normalizedId);
			}),
		);

		return allUsers;
	},
});

export const getUserByEmail = query({
	args: {
		email: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query("user")
			.withIndex("email_name", (q) => q.eq("email", args.email))
			.first();

		return user;
	},
});
