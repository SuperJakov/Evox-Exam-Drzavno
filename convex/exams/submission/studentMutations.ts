import { ConvexError, v } from "convex/values";
import { internal } from "../../_generated/api";
import { mutation } from "../../_generated/server";
import {
	getAuthUserOrThrow,
	requireEmailVerified,
	requireStudentRole,
} from "../../utils/auth";
import { getExamOrThrow } from "../../utils/exams";
import { rateLimiter } from "../../utils/rate_limit";
import {
	validateQuestionInExam,
	validateSubmissionParticipant,
} from "../../utils/submissions";

export const joinExam = mutation({
	args: {
		code: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireStudentRole(user);
		requireEmailVerified(user);

		const { ok, retryAfter } = await rateLimiter.limit(ctx, "joinExam", {
			key: user._id,
		});
		if (!ok) {
			throw new ConvexError(
				`Too many exam join attempts. Please wait ${Math.ceil((retryAfter ?? 0) / 1000 / 60)} minutes before trying again.`,
			);
		}

		const accessCodeRecord = await ctx.db
			.query("examAccessCodes")
			.withIndex("by_accessCode", (q) => q.eq("accessCode", args.code))
			.first();

		if (!accessCodeRecord) throw new ConvexError("Invalid access code");

		// Check if access code is active (not expired)
		const now = Date.now();
		if (accessCodeRecord.expiresAt <= now) {
			throw new ConvexError("Access code has expired");
		}

		const exam = await getExamOrThrow(ctx, accessCodeRecord.examId);
		if (!exam.isPublished) throw new ConvexError("Exam is not published");

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
				throw new ConvexError(
					"Late joining is disabled for this exam. Ask your teacher to enable it if you need to continue after leaving.",
				);
			}

			return existingInProgressSubmission._id;
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
				throw new ConvexError(
					"You have already completed this exam. Your teacher has enabled Prevent Duplicate Attempts, so they need to disable it before you can join again.",
				);
			}
		}

		// Generate a random seed for shuffling (only if shuffling is enabled)
		const isQuestionsShuffled = exam.shuffleQuestions;
		const isAnswersShuffled = exam.shuffleAnswers;

		// 2147483647 is 2^31 - 1, the max value of a 32-bit signed integer.
		// Seeded PRNG algorithms expect a seed in this range.
		const shuffleSeed =
			isQuestionsShuffled || isAnswersShuffled
				? Math.floor(Math.random() * 2147483647)
				: undefined;

		const startedAt = Date.now();
		const submissionId = await ctx.db.insert("submissions", {
			examId: exam._id,
			participantId: user._id,
			startedAt,
			status: "in_progress",
			shuffleSeed,
			isQuestionsShuffled,
			isAnswersShuffled,
			duration: exam.duration,
			groupingId: accessCodeRecord.groupingId,
		});

		// Schedule auto-finish
		if (exam.duration > 0) {
			await ctx.scheduler.runAt(
				startedAt + exam.duration,
				internal.exams.submission.internal.finishExamInternal,
				{ submissionId },
			);
		}

		return submissionId;
	},
});
export const submitAnswer = mutation({
	args: {
		submissionId: v.id("submissions"),
		questionId: v.id("questions"),
		answer: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		const submission = await validateSubmissionParticipant(
			ctx,
			args.submissionId,
			user._id,
		);

		if (submission.status === "completed") {
			throw new ConvexError("Exam already completed");
		}

		const exam = await getExamOrThrow(ctx, submission.examId);

		// Validate that the question belongs to this exam
		await validateQuestionInExam(ctx, args.questionId, submission.examId);

		// Check time limit
		const duration = submission.duration ?? exam.duration;
		if (duration > 0) {
			const endTime = submission.startedAt + duration;
			if (Date.now() > endTime) {
				throw new ConvexError("Time limit exceeded");
			}
		}

		// Check if answer already exists
		const existingAnswer = await ctx.db
			.query("submissionAnswers")
			.withIndex("by_submissionId_and_questionId", (q) =>
				q
					.eq("submissionId", args.submissionId)
					.eq("questionId", args.questionId),
			)
			.first();

		if (existingAnswer) {
			await ctx.db.patch("submissionAnswers", existingAnswer._id, {
				answer: args.answer,
			});
		} else {
			await ctx.db.insert("submissionAnswers", {
				submissionId: args.submissionId,
				questionId: args.questionId,
				answer: args.answer,
			});
		}
	},
});
export const finishExam = mutation({
	args: { submissionId: v.id("submissions") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		await validateSubmissionParticipant(ctx, args.submissionId, user._id);

		await ctx.runMutation(
			internal.exams.submission.internal.finishExamInternal,
			{
				submissionId: args.submissionId,
			},
		);
	},
});
export const toggleMarkQuestion = mutation({
	args: {
		submissionId: v.id("submissions"),
		questionId: v.id("questions"),
		shouldMark: v.boolean(),
	},
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		await validateSubmissionParticipant(ctx, args.submissionId, user._id);

		const submission = await ctx.db.get(args.submissionId);
		if (!submission) throw new ConvexError("Submission not found");

		if (submission.status === "completed") {
			throw new ConvexError("Exam already completed");
		}

		const existingMark = await ctx.db
			.query("markedQuestions")
			.withIndex("by_submissionId_and_questionId", (q) =>
				q
					.eq("submissionId", args.submissionId)
					.eq("questionId", args.questionId),
			)
			.first();

		if (args.shouldMark) {
			if (!existingMark) {
				await ctx.db.insert("markedQuestions", {
					submissionId: args.submissionId,
					questionId: args.questionId,
				});
			}
		} else {
			if (existingMark) {
				await ctx.db.delete(existingMark._id);
			}
		}

		return { isMarked: args.shouldMark };
	},
});
export const logCheatingEvent = mutation({
	args: {
		submissionId: v.id("submissions"),
		eventType: v.union(
			v.literal("tab_switch"),
			v.literal("window_blur"),
			v.literal("exit_fullscreen"),
		),
		metadata: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		const submission = await validateSubmissionParticipant(
			ctx,
			args.submissionId,
			user._id,
		);

		if (submission.status === "completed") {
			return; // Don't log after completion
		}

		await ctx.db.insert("cheatingLogs", {
			submissionId: args.submissionId,
			eventType: args.eventType,
			timestamp: Date.now(),
		});
	},
});
