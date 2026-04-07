import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

// Should be ran right before deleting a user
export const profileCleanup = internalMutation({
	args: {
		userId: v.string(),
	},

	handler: async (ctx, args) => {
		const { userId } = args;
		console.log("Starting profile cleanup for user", userId);

		const allExamsByUser = await ctx.db
			.query("exams")
			.withIndex("by_ownerId", (q) => q.eq("ownerId", userId))
			.collect();

		for (const exam of allExamsByUser) {
			console.log("Deleting exam", exam._id);
			await ctx.runMutation(internal.exams.general.internalDeleteExam, {
				examId: exam._id,
			});
		}

		// Delete profile picture
		const profilePic = await ctx.db
			.query("profilePictures")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.first();

		if (profilePic) {
			console.log("Deleting profile picture", profilePic._id);
			try {
				await ctx.storage.delete(profilePic.storageId);
			} catch (error) {
				console.error("Failed to delete profile picture from storage", error);
			}
			await ctx.db.delete(profilePic._id);
		}

		return {
			success: true,
		};
	},
});
