import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import {
	internalAction,
	internalMutation,
	internalQuery,
	mutation,
	query,
} from "../_generated/server";
import { getAuthUserOrThrow, requireTeacherRole } from "../utils/auth";
import { validateExamOwner } from "../utils/exams";
import { rateLimiter } from "../utils/rate_limit";

export const getAnalytics = query({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		const exam = await validateExamOwner(ctx, args.examId, user._id);

		const record = await ctx.db
			.query("examAnalytics")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.first();

		return {
			analytics: record,
			isPublished: exam.isPublished,
		};
	},
});

export const startComputing = internalMutation({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query("examAnalytics")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.first();

		if (record?.status === "computing") return false;

		// Cancel any previous janitor that may be lingering
		if (record?.janitorId) {
			await ctx.scheduler.cancel(record.janitorId);
		}

		// Schedule a janitor to auto-reset if the action times out or is killed
		const janitorId = await ctx.scheduler.runAfter(
			10 * 60 * 1000,
			internal.exams.analytics.resetStatus,
			{ examId: args.examId },
		);

		if (record) {
			await ctx.db.patch(record._id, {
				status: "computing",
				lastUpdated: Date.now(),
				janitorId,
			});
		} else {
			await ctx.db.insert("examAnalytics", {
				examId: args.examId,
				totalCompletions: 0,
				averageScore: 0,
				averagePercentage: 0,
				questionStats: [],
				scoreDistribution: [],
				lastUpdated: Date.now(),
				status: "computing",
				janitorId,
			});
		}
		return true;
	},
});

export const getExamQuestions = internalQuery({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("questions")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.collect();
	},
});

export type GetSubmissionBatchReturnType = {
	items: {
		submissionId: Id<"submissions">;
		score: number;
		startedAt: number;
		completedAt?: number;
		groupingId?: Id<"examGroupings">;
		answers: {
			questionId: Id<"questions">;
			isCorrect: boolean;
			answer: string;
		}[];
	}[];
	nextCursor: string;
	isDone: boolean;
};

export const getSubmissionBatch = internalQuery({
	args: {
		examId: v.id("exams"),
		cursor: v.union(v.string(), v.null()),
		limit: v.number(),
	},
	handler: async (ctx, args): Promise<GetSubmissionBatchReturnType> => {
		const questions = await ctx.db
			.query("questions")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.collect();

		const results = await ctx.db
			.query("submissions")
			.withIndex("by_examId_status", (q) =>
				q.eq("examId", args.examId).eq("status", "completed"),
			)
			.paginate({ cursor: args.cursor, numItems: args.limit });

		const items = await Promise.all(
			results.page.map(async (submission) => {
				const answers = await ctx.db
					.query("submissionAnswers")
					.withIndex("by_submissionId", (q) =>
						q.eq("submissionId", submission._id),
					)
					.collect();
				const answerMap = new Map(
					answers.map((answer) => [answer.questionId, answer]),
				);

				let score = 0;
				const processedAnswers = questions.map((q) => {
					const ans = answerMap.get(q._id);
					let isCorrect = false;
					if (
						ans &&
						ans.answer.toLowerCase().trim() ===
							q.correctAnswer.toLowerCase().trim()
					) {
						score += q.points;
						isCorrect = true;
					}
					return {
						questionId: q._id,
						isCorrect,
						answer: ans?.answer ?? "",
					};
				});

				return {
					submissionId: submission._id,
					score,
					startedAt: submission.startedAt,
					completedAt: submission.completedAt,
					groupingId: submission.groupingId,
					answers: processedAnswers,
				};
			}),
		);

		return {
			items,
			nextCursor: results.continueCursor,
			isDone: results.isDone,
		};
	},
});

export const saveAnalytics = internalMutation({
	args: {
		examId: v.id("exams"),
		totalCompletions: v.number(),
		averageScore: v.number(),
		averagePercentage: v.number(),
		medianScore: v.optional(v.number()),
		top25Score: v.optional(v.number()),
		bottom25Score: v.optional(v.number()),
		averageCompletionTime: v.optional(v.number()),
		medianCompletionTime: v.optional(v.number()),
		timeVsScore: v.optional(
			v.array(
				v.object({
					timeTaken: v.number(),
					score: v.number(),
				}),
			),
		),
		groupStats: v.optional(
			v.array(
				v.object({
					groupId: v.string(),
					name: v.string(),
					averagePercentage: v.number(),
					averageCompletionTime: v.number(),
					totalCompletions: v.number(),
				}),
			),
		),
		questionStats: v.array(
			v.object({
				questionId: v.id("questions"),
				correctCount: v.number(),
				wrongCount: v.number(),
				skipCount: v.optional(v.number()),
				discriminationIndex: v.optional(v.number()),
				answerDistribution: v.optional(
					v.array(
						v.object({
							answer: v.string(),
							count: v.number(),
						}),
					),
				),
				averagePoints: v.number(),
			}),
		),
		scoreDistribution: v.array(
			v.object({
				range: v.string(),
				count: v.number(),
			}),
		),
	},
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query("examAnalytics")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.first();

		if (record) {
			// Cancel the janitor - computation finished successfully
			if (record.janitorId) {
				await ctx.scheduler.cancel(record.janitorId);
			}
			const { examId: _examId, ...updateData } = args;
			await ctx.db.patch(record._id, {
				...updateData,
				status: "ready",
				lastUpdated: Date.now(),
				janitorId: undefined,
			});
		}
	},
});

export const resetStatus = internalMutation({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		const record = await ctx.db
			.query("examAnalytics")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.first();

		if (record && record.status === "computing") {
			// Cancel the janitor if it's still pending (called from catch or by janitor itself)
			if (record.janitorId) {
				try {
					await ctx.scheduler.cancel(record.janitorId);
				} catch {
					// Janitor may have already fired; safe to ignore
				}
			}
			await ctx.db.patch(record._id, { status: "ready", janitorId: undefined });
		}
	},
});

export const getExamGroupings = internalQuery({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		return await ctx.db
			.query("examGroupings")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.collect();
	},
});

export const getExamForOwner = internalQuery({
	args: { examId: v.id("exams"), ownerId: v.id("user") },
	handler: async (ctx, args) => {
		const exam = await ctx.db.get(args.examId);
		if (!exam || exam.ownerId !== args.ownerId) return null;
		return exam;
	},
});

export const internalComputeAnalytics = internalAction({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		const canCompute = await ctx.runMutation(
			internal.exams.analytics.startComputing,
			{ examId: args.examId },
		);

		if (!canCompute) return;

		try {
			// Fetch dependencies
			const questions = await ctx.runQuery(
				internal.exams.analytics.getExamQuestions,
				{ examId: args.examId },
			);
			const groupings = await ctx.runQuery(
				internal.exams.analytics.getExamGroupings,
				{ examId: args.examId },
			);

			const groupingsMap = new Map(
				groupings.map((g) => [g._id as string, g.name]),
			);
			const totalExamPoints = questions.reduce((acc, q) => acc + q.points, 0);

			// Collect all submissions
			let cursor: string | null = null;
			let isDone = false;
			const allSubmissions: GetSubmissionBatchReturnType["items"] = [];

			while (!isDone) {
				const batch: GetSubmissionBatchReturnType = await ctx.runQuery(
					internal.exams.analytics.getSubmissionBatch,
					{
						examId: args.examId,
						cursor,
						limit: 100,
					},
				);
				allSubmissions.push(...batch.items);
				cursor = batch.nextCursor;
				isDone = batch.isDone;
			}

			const totalCompletions = allSubmissions.length;
			if (totalCompletions === 0) {
				await ctx.runMutation(internal.exams.analytics.saveAnalytics, {
					examId: args.examId,
					totalCompletions: 0,
					averageScore: 0,
					averagePercentage: 0,
					questionStats: questions.map((q) => ({
						questionId: q._id,
						correctCount: 0,
						wrongCount: 0,
						skipCount: 0,
						averagePoints: 0,
					})),
					scoreDistribution: Array.from({ length: 10 }, (_, i) => ({
						range: `${i * 10}-${(i + 1) * 10}%`,
						count: 0,
					})),
				});
				return;
			}

			// Pre-calculate per-submission derived stats
			const processedSubmissions = allSubmissions.map((sub) => {
				const timeTaken = sub.completedAt ? sub.completedAt - sub.startedAt : 0;
				const percentage =
					totalExamPoints > 0 ? (sub.score / totalExamPoints) * 100 : 0;
				const answerMap = new Map(
					sub.answers.map((answer) => [answer.questionId, answer]),
				);
				return { ...sub, timeTaken, percentage, answerMap };
			});

			// Scores and Time Taken Arrays
			const scores = processedSubmissions
				.map((s) => s.score)
				.sort((a, b) => a - b);
			const times = processedSubmissions
				.map((s) => s.timeTaken)
				.filter((t) => t > 0)
				.sort((a, b) => a - b);

			const sumScore = scores.reduce((a, b) => a + b, 0);
			const sumPercentage = processedSubmissions.reduce(
				(a, b) => a + b.percentage,
				0,
			);
			const sumTime = times.reduce((a, b) => a + b, 0);

			const averageScore = sumScore / totalCompletions;
			const averagePercentage = sumPercentage / totalCompletions;
			const averageCompletionTime =
				times.length > 0 ? sumTime / times.length : 0;

			// Median and Percentiles
			const medianScore = scores[Math.floor(scores.length / 2)] ?? 0;
			const bottom25Score = scores[Math.floor(scores.length * 0.25)] ?? 0;
			const top25Score = scores[Math.floor(scores.length * 0.75)] ?? 0;
			const medianCompletionTime = times[Math.floor(times.length / 2)] ?? 0;

			// Score Distribution (10 buckets)
			const scoreDistribution = Array.from({ length: 10 }, (_, i) => ({
				range: `${i * 10}-${(i + 1) * 10}%`,
				count: 0,
			}));

			for (const sub of processedSubmissions) {
				const bucket = Math.min(9, Math.floor(sub.percentage / 10));
				const bucketObj = scoreDistribution[bucket];
				if (bucketObj) {
					bucketObj.count++;
				}
			}

			// Time Vs Score (Include all points for the chart)
			const timeVsScore = processedSubmissions
				.filter((s) => s.timeTaken > 0)
				.map((s) => ({
					timeTaken: s.timeTaken,
					score: s.percentage,
				}));

			// Group Stats
			const groupStatsMap = new Map<
				string,
				{
					totalPercentage: number;
					totalTime: number;
					count: number;
					validTimeCount: number;
				}
			>();

			for (const sub of processedSubmissions) {
				const groupId = sub.groupingId ?? "ungrouped";
				if (!groupStatsMap.has(groupId)) {
					groupStatsMap.set(groupId, {
						totalPercentage: 0,
						totalTime: 0,
						count: 0,
						validTimeCount: 0,
					});
				}
				const gStats = groupStatsMap.get(groupId);
				if (gStats) {
					gStats.count++;
					gStats.totalPercentage += sub.percentage;
					if (sub.timeTaken > 0) {
						gStats.totalTime += sub.timeTaken;
						gStats.validTimeCount++;
					}
				}
			}

			const groupStats = Array.from(groupStatsMap.entries()).map(
				([groupId, stats]) => ({
					groupId,
					name: groupingsMap.get(groupId) ?? "Ungrouped",
					averagePercentage: stats.totalPercentage / stats.count,
					averageCompletionTime:
						stats.validTimeCount > 0
							? stats.totalTime / stats.validTimeCount
							: 0,
					totalCompletions: stats.count,
				}),
			);

			// Item Analysis & Discrimination Index
			const sortedByScoreDesc = [...processedSubmissions].sort(
				(a, b) => b.score - a.score,
			);

			const tierSize = Math.max(1, Math.floor(totalCompletions * 0.27));
			const topTierSubmissions = sortedByScoreDesc.slice(0, tierSize);
			const bottomTierSubmissions = sortedByScoreDesc.slice(-tierSize);

			const questionStats: Array<{
				questionId: import("../_generated/dataModel").Id<"questions">;
				correctCount: number;
				wrongCount: number;
				skipCount: number;
				discriminationIndex?: number;
				answerDistribution?: Array<{ answer: string; count: number }>;
				averagePoints: number;
			}> = [];

			for (const q of questions) {
				let correctCount = 0;
				let wrongCount = 0;
				let skipCount = 0;
				let totalPointsWon = 0;
				const distMap = new Map<string, number>();

				for (const sub of processedSubmissions) {
					const ans = sub.answerMap.get(q._id);

					if (!ans || !ans.answer || ans.answer.trim() === "") {
						skipCount++;
						wrongCount++; // A skip is technically wrong for scoring
					} else {
						// Track distractor
						const ansStr = ans.answer.trim().substring(0, 100); // cap length
						distMap.set(ansStr, (distMap.get(ansStr) ?? 0) + 1);

						if (ans.isCorrect) {
							correctCount++;
							totalPointsWon += q.points;
						} else {
							wrongCount++;
						}
					}
				}

				// Discrimination Index calculation
				let discriminationIndex: number | undefined;
				if (topTierSubmissions.length > 0 && bottomTierSubmissions.length > 0) {
					const getSuccessRate = (subs: typeof processedSubmissions) => {
						const correct = subs.filter(
							(s) => s.answerMap.get(q._id)?.isCorrect ?? false,
						).length;
						return correct / subs.length;
					};

					const topRate = getSuccessRate(topTierSubmissions);
					const bottomRate = getSuccessRate(bottomTierSubmissions);
					discriminationIndex = topRate - bottomRate;
				}

				const attempts = correctCount + wrongCount;
				questionStats.push({
					questionId: q._id,
					correctCount,
					wrongCount,
					skipCount,
					discriminationIndex,
					answerDistribution: Array.from(distMap.entries())
						.map(([answer, count]) => ({ answer, count }))
						.sort((a, b) => b.count - a.count),
					averagePoints: attempts > 0 ? totalPointsWon / attempts : 0,
				});
			}

			await ctx.runMutation(internal.exams.analytics.saveAnalytics, {
				examId: args.examId,
				totalCompletions,
				averageScore,
				averagePercentage,
				medianScore,
				top25Score,
				bottom25Score,
				averageCompletionTime,
				medianCompletionTime,
				timeVsScore,
				groupStats,
				questionStats,
				scoreDistribution,
			});
		} catch (error) {
			console.error("Failed to compute analytics:", error);
			await ctx.runMutation(internal.exams.analytics.resetStatus, {
				examId: args.examId,
			});
		}
	},
});

export const computeAnalyticsPublic = mutation({
	args: { examId: v.id("exams") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		await validateExamOwner(ctx, args.examId, user._id);

		// Rate limit: 5 per hour, burst of 2, keyed per user
		const { ok, retryAfter } = await rateLimiter.limit(
			ctx,
			"computeAnalytics",
			{ key: user._id },
		);
		if (!ok) {
			throw new ConvexError(
				`Too many analytics requests. Please wait ${Math.ceil((retryAfter ?? 0) / 1000 / 60)} minutes before trying again.`,
			);
		}

		await ctx.scheduler.runAfter(
			0,
			internal.exams.analytics.internalComputeAnalytics,
			{ examId: args.examId },
		);
	},
});
