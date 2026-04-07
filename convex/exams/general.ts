import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation, mutation, query } from "../_generated/server";
import {
	getAuthUserOrThrow,
	requireEmailVerified,
	requireTeacherRole,
} from "../utils/auth";
import { calculateTotalPoints, validateExamOwner } from "../utils/exams";
import { rateLimiter } from "../utils/rate_limit";
import { deleteSubmissionById } from "./submission/internal";
import { validateExamDuration, validateExamTitle } from "./util";

export const createExam = mutation({
	args: {
		title: v.string(),
		duration: v.number(),
		shuffleQuestions: v.optional(v.boolean()),
		shuffleAnswers: v.optional(v.boolean()),
		preventDuplicateAttempts: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);
		requireEmailVerified(user);

		const { ok, retryAfter } = await rateLimiter.limit(ctx, "createExam", {
			key: user._id,
		});

		if (!ok) {
			throw new ConvexError(
				`Too many exam creation attempts. Please wait ${Math.ceil(retryAfter / 1000 / 60)} minutes before trying again.`,
			);
		}

		validateExamDuration(args.duration);
		validateExamTitle(args.title);

		const examId = await ctx.db.insert("exams", {
			ownerId: user._id,
			title: args.title,
			duration: args.duration,
			isPublished: false,
			shuffleQuestions: args.shuffleQuestions ?? false,
			shuffleAnswers: args.shuffleAnswers ?? false,
			requireFullscreen: true,
			allowLateJoining: false,
			preventDuplicateAttempts: args.preventDuplicateAttempts ?? false,
		});

		return examId;
	},
});

export const duplicateExam = mutation({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		const exam = await validateExamOwner(ctx, args.examId, user._id);

		// Create new exam with copied settings
		const newExamId = await ctx.db.insert("exams", {
			ownerId: user._id,
			title: `${exam.title} (Copy)`,
			duration: exam.duration,
			isPublished: false, // Start as draft
			shuffleQuestions: exam.shuffleQuestions,
			shuffleAnswers: exam.shuffleAnswers,
			requireFullscreen: exam.requireFullscreen,
			allowLateJoining: exam.allowLateJoining,
			preventDuplicateAttempts: exam.preventDuplicateAttempts ?? false,
		});

		// Copy all questions
		const questions = await ctx.db
			.query("questions")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.collect();

		for (const question of questions) {
			await ctx.db.insert("questions", {
				examId: newExamId,
				text: question.text,
				type: question.type,
				options: question.options,
				correctAnswer: question.correctAnswer,
				points: question.points,
				order: question.order,
				image: question.image,
			});
		}

		return newExamId;
	},
});

export const getMyExams = query({
	handler: async (ctx) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		const exams = await ctx.db
			.query("exams")
			.withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
			.collect();

		// Calculate totalPoints for each exam if not set
		const examsWithTotalPoints = await Promise.all(
			exams.map(async (exam) => {
				// Fetch access code info
				const accessCodeRecord = await ctx.db
					.query("examAccessCodes")
					.withIndex("by_examId", (q) => q.eq("examId", exam._id))
					.first();

				// Calculate from questions
				const questions = await ctx.db
					.query("questions")
					.withIndex("by_examId", (q) => q.eq("examId", exam._id))
					.collect();
				const totalPoints = calculateTotalPoints(questions);

				return {
					...exam,
					totalPoints,
					accessCode: accessCodeRecord?.accessCode,
					codeExpiresAt: accessCodeRecord?.expiresAt,
					codeActivatedAt: accessCodeRecord?.activatedAt,
				};
			}),
		);

		// Latest -> oldest
		return examsWithTotalPoints.sort(
			(a, b) => b._creationTime - a._creationTime,
		);
	},
});

export const getExamDetails = query({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		const exam = await validateExamOwner(ctx, args.examId, user._id);

		const questions = await ctx.db
			.query("questions")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.collect();

		// Calculate totalPoints dynamically
		const totalPoints = calculateTotalPoints(questions);

		const questionsWithUrls = await Promise.all(
			questions.map(async (q) => {
				let imageUrl: string | null = null;
				if (q.image) {
					imageUrl = await ctx.storage.getUrl(q.image);
				}
				return { ...q, imageUrl };
			}),
		);

		const accessCodeRecord = await ctx.db
			.query("examAccessCodes")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.first();

		return {
			...exam,
			questions: questionsWithUrls,
			totalPoints,
			accessCode: accessCodeRecord?.accessCode,
			codeExpiresAt: accessCodeRecord?.expiresAt,
			codeActivatedAt: accessCodeRecord?.activatedAt,
		};
	},
});

export const hasSubmissions = query({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		await validateExamOwner(ctx, args.examId, user._id);

		const submission = await ctx.db
			.query("submissions")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.first();

		return !!submission;
	},
});

export const publishExam = mutation({
	args: { examId: v.id("exams"), isPublished: v.boolean() },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		const exam = await validateExamOwner(ctx, args.examId, user._id);
		const questions = await ctx.db
			.query("questions")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.collect();

		if (!args.isPublished && exam.isPublished) {
			// Prevent unpublishing if submissions exist
			const submissions = await ctx.db
				.query("submissions")
				.withIndex("by_examId", (q) => q.eq("examId", args.examId))
				.first();

			if (submissions) {
				throw new ConvexError(
					"Cannot unpublish an exam with existing submissions. Duplicate the exam to make a new version.",
				);
			}
		}

		if (args.isPublished && questions.length === 0) {
			throw new ConvexError(
				"Cannot publish an exam without at least one question.",
			);
		}

		// If unpublishing, also invalidate any active access code
		if (!args.isPublished) {
			const accessCodeRecord = await ctx.db
				.query("examAccessCodes")
				.withIndex("by_examId", (q) => q.eq("examId", args.examId))
				.first();

			if (accessCodeRecord) {
				if (accessCodeRecord.expirationJobId) {
					try {
						await ctx.scheduler.cancel(accessCodeRecord.expirationJobId);
					} catch {
						// Ignored
					}
				}
				await ctx.db.delete(accessCodeRecord._id);
			}
		}

		await ctx.db.patch(args.examId, { isPublished: args.isPublished });
	},
});

export const deleteExam = mutation({
	args: {
		examId: v.id("exams"),
	},
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		await validateExamOwner(ctx, args.examId, user._id);

		await ctx.runMutation(internal.exams.general.internalDeleteExam, {
			examId: args.examId,
		});
	},
});

export const internalDeleteExam = internalMutation({
	args: {
		examId: v.id("exams"),
	},

	handler: async (ctx, args) => {
		// Delete all questions, results, submissions, cheating logs and the exam itself
		const { examId } = args;

		console.log("Starting exam deletion");

		// Delete all questions
		const questions = await ctx.db
			.query("questions")
			.withIndex("by_examId", (q) => q.eq("examId", examId))
			.collect();

		for (const question of questions) {
			console.log("Deleting question", question._id);
			await ctx.db.delete(question._id);
		}

		// Delete all submissions and their related data (answers, cheating logs)
		const submissions = await ctx.db
			.query("submissions")
			.withIndex("by_examId", (q) => q.eq("examId", examId))
			.collect();

		for (const submission of submissions) {
			console.log("Deleting submission", submission._id);
			await deleteSubmissionById(ctx, submission._id);
		}

		// Delete access codes
		const accessCodes = await ctx.db
			.query("examAccessCodes")
			.withIndex("by_examId", (q) => q.eq("examId", examId))
			.collect();

		for (const accessCode of accessCodes) {
			if (accessCode.expirationJobId) {
				try {
					await ctx.scheduler.cancel(accessCode.expirationJobId);
				} catch {
					console.warn(
						"Failed to cancel expiration job for access code",
						accessCode._id,
					);
				}
			}
			await ctx.db.delete(accessCode._id);
		}

		// Delete groupings
		const groupings = await ctx.db
			.query("examGroupings")
			.withIndex("by_examId", (q) => q.eq("examId", examId))
			.collect();
		for (const grouping of groupings) {
			await ctx.db.delete(grouping._id);
		}

		// Delete analytics
		const analytics = await ctx.db
			.query("examAnalytics")
			.withIndex("by_examId", (q) => q.eq("examId", examId))
			.first();
		if (analytics) {
			if (analytics.janitorId) {
				try {
					await ctx.scheduler.cancel(analytics.janitorId);
				} catch {
					// Ignored
				}
			}
			await ctx.db.delete(analytics._id);
		}

		// Delete the exam itself
		await ctx.db.delete(examId);
	},
});
