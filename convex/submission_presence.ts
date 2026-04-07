import { Presence } from "@convex-dev/presence";
import { ConvexError, v } from "convex/values";
import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const submissionPresence = new Presence(components.submission_presence);

export const heartbeat = mutation({
	args: {
		roomId: v.string(),
		userId: v.string(),
		sessionId: v.string(),
		interval: v.number(),
	},
	handler: async (ctx, { roomId, userId, sessionId, interval }) => {
		// Guard against the initial render race where participantId hasn't loaded
		// yet and usePresence fires with an empty userId. Return a dummy result
		// so the hook doesn't error; it will retry with the real ID once loaded.
		if (!userId) {
			return { roomToken: "", sessionToken: "" };
		}
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) throw new ConvexError("Not authenticated");
		if (user._id !== userId) throw new ConvexError("Unauthorized");
		return await submissionPresence.heartbeat(
			ctx,
			roomId,
			userId,
			sessionId,
			interval,
		);
	},
});

export const list = query({
	args: { roomToken: v.string() },
	handler: async (ctx, { roomToken }) => {
		return await submissionPresence.list(ctx, roomToken);
	},
});

export const disconnect = mutation({
	args: { sessionToken: v.string() },
	handler: async (ctx, { sessionToken }) => {
		// Can't check auth here because it's called over http from sendBeacon.
		return await submissionPresence.disconnect(ctx, sessionToken);
	},
});

/**
 * Returns whether the student is currently online (actively taking the exam).
 * The roomId for an exam session is the submissionId string.
 */
export const getSubmissionOnlineStatus = query({
	args: { submissionId: v.id("submissions") },
	handler: async (ctx, { submissionId }) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user) throw new ConvexError("Not authenticated");

		const submission = await ctx.db.get("submissions", submissionId);
		if (!submission) throw new ConvexError("Submission not found");

		// Only the participant or the exam owner can view the status
		if (submission.participantId !== user._id) {
			const exam = await ctx.db.get("exams", submission.examId);
			if (!exam || exam.ownerId !== user._id) {
				throw new ConvexError(
					"Unauthorized: You do not have access to this submission",
				);
			}
		}

		// The roomId in presence is the string representation of the submissionId
		const roomId = submissionId;
		const onlineUsers = await submissionPresence.listRoom(ctx, roomId, true);
		return onlineUsers.length > 0;
	},
});
