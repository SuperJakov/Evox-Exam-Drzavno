import { v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import { authComponent, createAuth } from "../auth";

export const setProfilePictureForCurrentUser = internalMutation({
	args: {
		storageId: v.id("_storage"),
		blurDataUrl: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) {
			return {
				status: "unauthorized" as const,
			};
		}

		// Check if user already has a profile picture
		const existingProfilePic = await ctx.db
			.query("profilePictures")
			.withIndex("by_userId", (q) => q.eq("userId", user._id))
			.first();

		if (existingProfilePic) {
			// Delete the old file from storage
			try {
				await ctx.storage.delete(existingProfilePic.storageId);
			} catch (error) {
				console.error(
					"Failed to delete existing profile picture from storage",
					error,
				);
			}
			// Delete the old record
			await ctx.db.delete(existingProfilePic._id);
		}

		await ctx.db.insert("profilePictures", {
			userId: user._id,
			storageId: args.storageId,
			blurDataUrl: args.blurDataUrl,
		});

		const url = await ctx.storage.getUrl(args.storageId);

		if (url) {
			const { auth, headers } = await authComponent.getAuth(createAuth, ctx);
			await auth.api.updateUser({
				headers,
				body: {
					image: url,
				},
			});
		}

		return {
			status: "success" as const,
			url,
		};
	},
});

// Profile pictures are public to everyone
export const getProfilePictureForCurrentUser = query({
	handler: async (ctx) => {
		const userId = await ctx.auth.getUserIdentity();
		if (!userId) {
			return null;
		}

		const profilePic = await ctx.db
			.query("profilePictures")
			.withIndex("by_userId", (q) => q.eq("userId", userId.subject))
			.first();

		if (!profilePic) {
			return null;
		}
		const profilePicUrl = await ctx.storage.getUrl(profilePic.storageId);

		if (!profilePicUrl) {
			return null;
		}

		return {
			url: profilePicUrl,
			blurDataUrl: profilePic.blurDataUrl,
		};
	},
});

export const deleteProfilePicture = mutation({
	args: {},
	handler: async (ctx) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) {
			return {
				status: "unauthorized" as const,
			};
		}

		const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

		await auth.api.updateUser({
			headers,
			body: {
				image: null, // Clear the image
			},
		});

		const existingProfilePic = await ctx.db
			.query("profilePictures")
			.withIndex("by_userId", (q) => q.eq("userId", user._id))
			.first();

		if (existingProfilePic) {
			try {
				await ctx.storage.delete(existingProfilePic.storageId);
			} catch (error) {
				console.error(
					"Failed to delete existing profile picture from storage",
					error,
				);
			}
			await ctx.db.delete(existingProfilePic._id);
		}

		return {
			status: "success" as const,
		};
	},
});
