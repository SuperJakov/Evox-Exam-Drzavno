import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation, mutation, query } from "../_generated/server";
import {
	getAuthUserOrThrow,
	requireStudentRole,
	requireTeacherRole,
} from "../utils/auth";
import {
	deleteAccessCode,
	getActiveAccessCode,
	validateExamOwner,
} from "../utils/exams";
import { generateAccessCode } from "./util";

export const getValidExamByCode = query({
	args: { code: v.string() },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireStudentRole(user);

		const accessCodeRecord = await ctx.db
			.query("examAccessCodes")
			.withIndex("by_accessCode", (q) => q.eq("accessCode", args.code))
			.first();

		if (!accessCodeRecord) return null;

		// Check if access code is active (not expired)
		const now = Date.now();
		if (accessCodeRecord.expiresAt <= now) {
			return null; // Expired
		}

		const exam = await ctx.db.get(accessCodeRecord.examId);
		if (!exam) return null;
		if (!exam.isPublished) return null; // Don't show unpublished exams

		const examInfo = {
			_id: exam._id,
			title: exam.title,
			duration: exam.duration,
		};

		const profilePicture = await ctx.db
			.query("profilePictures")
			.withIndex("by_userId", (q) => q.eq("userId", exam.ownerId))
			.first();

		const profilePictureUrl = profilePicture
			? await ctx.storage.getUrl(profilePicture.storageId)
			: null;

		const existingInProgressSubmission = await ctx.db
			.query("submissions")
			.withIndex("by_examId_participantId_status", (q) =>
				q
					.eq("examId", exam._id)
					.eq("participantId", user._id)
					.eq("status", "in_progress"),
			)
			.first();

		if (existingInProgressSubmission) {
			if (!(exam.allowLateJoining ?? false)) {
				return {
					examInfo,
					creatorProfilePictureUrl: profilePictureUrl,
					joinState: {
						type: "late_join_blocked",
						reason:
							"Late joining is disabled for this exam. Ask your teacher to enable it if you need to continue after leaving.",
					},
				};
			}

			return {
				examInfo,
				creatorProfilePictureUrl: profilePictureUrl,
				joinState: {
					type: "in_progress",
					submissionId: existingInProgressSubmission._id,
				},
			};
		}

		if (exam.preventDuplicateAttempts ?? false) {
			const existingCompletedSubmission = await ctx.db
				.query("submissions")
				.withIndex("by_examId_participantId_status", (q) =>
					q
						.eq("examId", exam._id)
						.eq("participantId", user._id)
						.eq("status", "completed"),
				)
				.first();

			if (existingCompletedSubmission) {
				return {
					examInfo,
					creatorProfilePictureUrl: profilePictureUrl,
					joinState: {
						type: "blocked",
						reason:
							"You already completed this exam. Your teacher has enabled Prevent Duplicate Attempts, so they need to disable it before you can join again.",
					},
				};
			}
		}

		return {
			examInfo,
			creatorProfilePictureUrl: profilePictureUrl,
		};
	},
});

export const activateAccessCode = mutation({
	args: {
		examId: v.id("exams"),
		durationMs: v.number(),
		groupingId: v.optional(v.id("examGroupings")),
		newGroupName: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		await validateExamOwner(ctx, args.examId, user._id);

		const MIN_DURATION = 5 * 60 * 1000; // 5 minutes
		const MAX_DURATION = 12 * 60 * 60 * 1000; // 12 hours

		if (args.durationMs < MIN_DURATION) {
			throw new ConvexError("Duration must be at least 5 minutes");
		}

		if (args.durationMs > MAX_DURATION) {
			throw new ConvexError("Duration cannot exceed 12 hours");
		}

		const now = Date.now();
		const expiresAt = now + args.durationMs;

		// Generate a new unique access code
		let accessCode = generateAccessCode();
		let maxRetries = 10;
		while (maxRetries > 0) {
			const existing = await ctx.db
				.query("examAccessCodes")
				.withIndex("by_accessCode", (q) => q.eq("accessCode", accessCode))
				.first();

			if (!existing) {
				break;
			}
			accessCode = generateAccessCode();
			maxRetries--;
		}

		if (maxRetries === 0) {
			throw new ConvexError("Failed to generate unique code, please try again");
		}

		const accessCodeContextId = crypto.randomUUID();

		if (args.groupingId) {
			const existingGrouping = await ctx.db.get(args.groupingId);
			if (!existingGrouping || existingGrouping.examId !== args.examId) {
				throw new ConvexError("Invalid grouping for this exam");
			}
		}

		// Schedule expiration
		const scheduledId = await ctx.scheduler.runAt(
			expiresAt,
			internal.exams.access.expireAccessCode,
			{
				examId: args.examId,
				uniqueKey: accessCodeContextId,
			},
		);

		// Remove any existing access code for this exam to ensure 1:1
		await deleteAccessCode(ctx, args.examId);

		// Handle grouping creation
		let finalGroupingId = args.groupingId;
		const newName = args.newGroupName?.trim();
		if (newName) {
			// Check if a group with this name already exists for this exam
			const existingGroup = await ctx.db
				.query("examGroupings")
				.withIndex("by_examId_name", (q) =>
					q.eq("examId", args.examId).eq("name", newName),
				)
				.first();

			if (existingGroup) {
				finalGroupingId = existingGroup._id;
			} else {
				finalGroupingId = await ctx.db.insert("examGroupings", {
					examId: args.examId,
					name: newName,
				});
			}
		}

		await ctx.db.insert("examAccessCodes", {
			examId: args.examId,
			accessCode,
			accessCodeContextId,
			activatedAt: now,
			expiresAt: expiresAt,
			expirationJobId: scheduledId,
			groupingId: finalGroupingId,
		});
	},
});

export const deactivateAccessCode = mutation({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		await validateExamOwner(ctx, args.examId, user._id);

		await deleteAccessCode(ctx, args.examId);
	},
});

export const expireAccessCode = internalMutation({
	args: { examId: v.id("exams"), uniqueKey: v.string() },
	handler: async (ctx, args) => {
		const accessCodeRecord = await getActiveAccessCode(ctx, args.examId);

		if (!accessCodeRecord) return;

		// Only expire if the unique key matches the one that was scheduled
		// This ensures we're expiring the intended access code
		if (accessCodeRecord.accessCodeContextId === args.uniqueKey) {
			await ctx.db.delete(accessCodeRecord._id);
		}
	},
});
