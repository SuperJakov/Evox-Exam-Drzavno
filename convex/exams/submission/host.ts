import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { components, internal } from "../../_generated/api";
import { mutation, query } from "../../_generated/server";
import { authComponent } from "../../auth";
import type { Doc as AuthDoc } from "../../better-auth/_generated/dataModel";
import {
	getAuthUserOrThrow,
	getUserById,
	requireTeacherRole,
} from "../../utils/auth";
import { validateExamOwner } from "../../utils/exams";
import { calculateScore, getSubmissionOrThrow } from "../../utils/submissions";
import { deleteSubmissionById } from "./internal";

export const getSubmissionForHost = query({
	args: { submissionId: v.id("submissions") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		const submission = await getSubmissionOrThrow(ctx, args.submissionId);
		const exam = await validateExamOwner(ctx, submission.examId, user._id);

		const rawQuestions = await ctx.db
			.query("questions")
			.withIndex("by_examId", (q) => q.eq("examId", submission.examId))
			.collect();

		const questions = await Promise.all(
			rawQuestions.map(async (q) => {
				let imageUrl: string | null = null;
				if (q.image) {
					imageUrl = await ctx.storage.getUrl(q.image);
				}
				return { ...q, imageUrl };
			}),
		);

		const answers = await ctx.db
			.query("submissionAnswers")
			.withIndex("by_submissionId", (q) =>
				q.eq("submissionId", args.submissionId),
			)
			.collect();

		// Calculate totalPoints dynamically
		const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

		const cheatingLogs = await ctx.db
			.query("cheatingLogs")
			.withIndex("by_submissionId", (q) =>
				q.eq("submissionId", args.submissionId),
			)
			.collect();

		// Resolve participant name dynamically from user account
		let participantName = "Unknown";
		const participant = await getUserById(ctx, submission.participantId);

		if (participant)
			participantName =
				`${participant.firstName ?? ""} ${participant.lastName ?? ""}`.trim();

		let score: number | undefined;
		if (submission.status === "completed") {
			score = calculateScore(questions, answers);
		}
		let groupName = "Ungrouped";
		if (submission.groupingId) {
			groupName =
				(await ctx.db.get("examGroupings", submission.groupingId))?.name ??
				"Ungrouped";
		}

		return {
			submission: { ...submission, participantName, score },
			exam: { ...exam, totalPoints },
			questions,
			answers,
			cheatingLogs,
			groupName,
		};
	},
});

export const getExamSubmissions = query({
	args: {
		examId: v.id("exams"),
		paginationOpts: paginationOptsValidator,
		groupingId: v.optional(
			v.union(v.id("examGroupings"), v.literal("ungrouped")),
		),
	},
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);
		await validateExamOwner(ctx, args.examId, user._id);

		const submissionQuery =
			args.groupingId !== undefined
				? ctx.db
						.query("submissions")
						.withIndex("by_examId_groupingId", (q) =>
							q
								.eq("examId", args.examId)
								.eq(
									"groupingId",
									args.groupingId === "ungrouped" ? undefined : args.groupingId,
								),
						)
				: ctx.db
						.query("submissions")
						.withIndex("by_examId", (q) => q.eq("examId", args.examId));

		const results = await submissionQuery
			.order("desc")
			.paginate(args.paginationOpts);

		const participants: (AuthDoc<"user"> | null)[] = await ctx.runQuery(
			components.betterAuth.user.batchGetUsersById,
			{
				userIds: results.page.map((s) => s.participantId),
			},
		);

		// Only fetch questions if there are completed submissions
		const hasCompletedSubmission = results.page.some(
			(s) => s.status === "completed",
		);
		const questions = hasCompletedSubmission
			? await ctx.db
					.query("questions")
					.withIndex("by_examId", (q) => q.eq("examId", args.examId))
					.collect()
			: [];

		const examGroupings = await ctx.db
			.query("examGroupings")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.collect();
		const groupNameMap = new Map(examGroupings.map((g) => [g._id, g.name]));

		const pageWithCheating = await Promise.all(
			results.page.map(async (submission, index) => {
				const logs = await ctx.db
					.query("cheatingLogs")
					.withIndex("by_submissionId", (q) =>
						q.eq("submissionId", submission._id),
					)
					.collect();

				// Calculate score dynamically if completed
				let score: number | undefined;
				if (submission.status === "completed") {
					const answers = await ctx.db
						.query("submissionAnswers")
						.withIndex("by_submissionId", (q) =>
							q.eq("submissionId", submission._id),
						)
						.collect();
					score = calculateScore(questions, answers);
				}

				// Resolve participant name dynamically from user account
				let participantName = "Unknown";
				const participant = participants[index];
				if (participant)
					participantName =
						`${participant.firstName ?? ""} ${participant.lastName ?? ""}`.trim();

				let groupingName: string | undefined;
				if (submission.groupingId) {
					groupingName = groupNameMap.get(submission.groupingId);
				}

				return {
					...submission,
					participantName,
					groupingName,
					cheatingCount: logs.length,
					score,
				};
			}),
		);

		return {
			...results,
			page: pageWithCheating,
		};
	},
});

export const getExamGroupings = query({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user || user.role === "student") return [];

		const exam = await ctx.db.get(args.examId);
		if (!exam || exam.ownerId !== user._id) return [];

		const groupings = await ctx.db
			.query("examGroupings")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.collect();

		return groupings.sort((a, b) => a.name.localeCompare(b.name));
	},
});

export const hasUngroupedSubmissions = query({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		const user = await authComponent.safeGetAuthUser(ctx);
		if (!user || user.role === "student") return false;

		const exam = await ctx.db.get(args.examId);
		if (!exam || exam.ownerId !== user._id) return false;

		const ungroupedSubmission = await ctx.db
			.query("submissions")
			.withIndex("by_examId_groupingId", (q) =>
				q.eq("examId", args.examId).eq("groupingId", undefined),
			)
			.first();

		return ungroupedSubmission !== null;
	},
});

export const deleteSubmission = mutation({
	args: { submissionId: v.id("submissions") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		const submission = await getSubmissionOrThrow(ctx, args.submissionId);

		if (submission.status === "in_progress") {
			throw new ConvexError(
				"Cannot delete a submission that is currently in progress",
			);
		}

		await validateExamOwner(ctx, submission.examId, user._id);

		await deleteSubmissionById(ctx, args.submissionId);

		await ctx.scheduler.runAfter(
			0,
			internal.exams.analytics.internalComputeAnalytics,
			{ examId: submission.examId },
		);
	},
});
