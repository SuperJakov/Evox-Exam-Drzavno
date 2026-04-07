import { v } from "convex/values";
import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { internalMutation, type MutationCtx } from "../../_generated/server";
import { calculateScore, getSubmissionOrThrow } from "../../utils/submissions";

export const finishExamInternal = internalMutation({
	args: { submissionId: v.id("submissions") },
	handler: async (ctx, args) => {
		const submission = await getSubmissionOrThrow(ctx, args.submissionId);

		if (submission.status === "completed") {
			console.log("Submission is already completed. Returning...");
			return;
		}

		console.log("Finishing submission with id:", args.submissionId);

		await ctx.db.patch("submissions", args.submissionId, {
			status: "completed",
			completedAt: Date.now(),
		});

		// Clean up marked questions
		const markedQuestions = await ctx.db
			.query("markedQuestions")
			.withIndex("by_submissionId", (q) =>
				q.eq("submissionId", args.submissionId),
			)
			.collect();

		console.log(`Deleting ${markedQuestions.length} marked questions`);
		await Promise.all(markedQuestions.map((mq) => ctx.db.delete(mq._id)));

		// Schedule grading and email sending
		await ctx.scheduler.runAfter(
			0,
			internal.exams.submission.internal.gradeAndSendEmailInternal,
			{ submissionId: args.submissionId },
		);
		await ctx.scheduler.runAfter(
			0,
			internal.exams.analytics.internalComputeAnalytics,
			{ examId: submission.examId },
		);
	},
});
export const gradeAndSendEmailInternal = internalMutation({
	args: { submissionId: v.id("submissions") },
	handler: async (ctx, args) => {
		const submission = await ctx.db.get("submissions", args.submissionId);
		// Important check if submission exists here, if not just return
		if (!submission) return;

		// Parallelize fetching questions and answers
		const [questions, answers] = await Promise.all([
			ctx.db
				.query("questions")
				.withIndex("by_examId", (q) => q.eq("examId", submission.examId))
				.collect(),
			ctx.db
				.query("submissionAnswers")
				.withIndex("by_submissionId", (q) =>
					q.eq("submissionId", args.submissionId),
				)
				.collect(),
		]);

		const totalScore = calculateScore(questions, answers);

		// Calculate total points at submission time for historical accuracy
		const submissionTotalPoints = questions.reduce(
			(sum, q) => sum + q.points,
			0,
		);

		// Fire-and-forget: notify the student via email (only if they have a student role)
		if (submission.participantId) {
			const exam = await ctx.db.get(submission.examId);
			if (exam) {
				await ctx.scheduler.runAfter(
					0,
					internal.exams.notifications.sendExamGradedEmail,
					{
						submissionId: args.submissionId,
						participantId: submission.participantId,
						examTitle: exam.title,
						score: totalScore,
						totalPoints: submissionTotalPoints,
					},
				);
			}
		}
	},
});
export const internalDeleteSubmission = internalMutation({
	args: { submissionId: v.id("submissions") },
	handler: async (ctx, args) => {
		const submission = await ctx.db.get(args.submissionId);
		if (!submission) return;

		await deleteSubmissionById(ctx, args.submissionId);

		await ctx.scheduler.runAfter(
			0,
			internal.exams.analytics.internalComputeAnalytics,
			{ examId: submission.examId },
		);
	},
});

export async function deleteSubmissionById(
	ctx: MutationCtx,
	submissionId: Id<"submissions">,
) {
	const submission = await ctx.db.get(submissionId);
	if (!submission) return;

	// Delete associated records in parallel
	const [answers, markedQuestions, cheatingLogs] = await Promise.all([
		ctx.db
			.query("submissionAnswers")
			.withIndex("by_submissionId", (q) => q.eq("submissionId", submissionId))
			.collect(),
		ctx.db
			.query("markedQuestions")
			.withIndex("by_submissionId", (q) => q.eq("submissionId", submissionId))
			.collect(),
		ctx.db
			.query("cheatingLogs")
			.withIndex("by_submissionId", (q) => q.eq("submissionId", submissionId))
			.collect(),
	]);

	const deletePromises = [
		...answers.map((a) => ctx.db.delete(a._id)),
		...markedQuestions.map((mq) => ctx.db.delete(mq._id)),
		...cheatingLogs.map((log) => ctx.db.delete(log._id)),
		ctx.db.delete(submissionId),
	];

	await Promise.all(deletePromises);
}
