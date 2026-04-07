import { v } from "convex/values";
import { query } from "../../_generated/server";
import { getAuthUserOrThrow, requireStudentRole } from "../../utils/auth";
import { getExamOrThrow } from "../../utils/exams";
import {
	calculateScore,
	validateSubmissionParticipant,
} from "../../utils/submissions";
import { getShuffledAnswerIndices, seededShuffle } from "../util";

export const getExamStaticData = query({
	args: { submissionId: v.id("submissions") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		const submission = await validateSubmissionParticipant(
			ctx,
			args.submissionId,
			user._id,
		);

		const exam = await getExamOrThrow(ctx, submission.examId);

		const questions = await ctx.db
			.query("questions")
			.withIndex("by_examId", (q) => q.eq("examId", submission.examId))
			.collect();

		const sanitizedQuestions = questions.map((q, index) => {
			let options = q.options;
			// Shuffle answer options if enabled and seed exists
			const shouldShuffleAnswers =
				submission.isAnswersShuffled ?? exam.shuffleAnswers;

			if (
				shouldShuffleAnswers &&
				submission.shuffleSeed !== undefined &&
				q.options &&
				q.type === "multiple_choice"
			) {
				const answerOrder = getShuffledAnswerIndices(
					q.options.length,
					submission.shuffleSeed,
					index,
				);
				const currentOptions = q.options;
				options = answerOrder.map((i) => currentOptions[i] as string);
			}
			return {
				_id: q._id,
				text: q.text,
				type: q.type,
				options,
				points: q.points,
				order: q.order,
			};
		});

		// Shuffle questions if enabled and seed exists
		const shouldShuffleQuestions =
			submission.isQuestionsShuffled ?? exam.shuffleQuestions;

		const shuffledQuestions =
			shouldShuffleQuestions && submission.shuffleSeed !== undefined
				? seededShuffle(sanitizedQuestions, submission.shuffleSeed)
				: sanitizedQuestions;

		const finalQuestions = await Promise.all(
			shuffledQuestions.map(async (q) => {
				const originalQ = questions.find((oq) => oq._id === q._id);

				let imageUrl: string | null = null;
				if (originalQ?.image) {
					imageUrl = await ctx.storage.getUrl(originalQ.image);
				}
				return { ...q, imageUrl };
			}),
		);

		const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

		// Omit shuffle settings from the exam object returned to the client
		const {
			shuffleAnswers: _shuffleAnswers,
			shuffleQuestions: _shuffleQuestions,
			...examRest
		} = exam;

		return {
			exam: { ...examRest, totalPoints },
			questions: finalQuestions,
		};
	},
});

export const getMarkedQuestionsForSubmission = query({
	args: { submissionId: v.id("submissions") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		await validateSubmissionParticipant(ctx, args.submissionId, user._id);

		const markedQuestionsRaw = await ctx.db
			.query("markedQuestions")
			.withIndex("by_submissionId", (q) =>
				q.eq("submissionId", args.submissionId),
			)
			.collect();

		return markedQuestionsRaw.map((mq) => mq.questionId);
	},
});

export const getSubmissionState = query({
	args: { submissionId: v.id("submissions") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		const submission = await validateSubmissionParticipant(
			ctx,
			args.submissionId,
			user._id,
		);

		let score: number | undefined;
		if (submission.status === "completed") {
			const questions = await ctx.db
				.query("questions")
				.withIndex("by_examId", (q) => q.eq("examId", submission.examId))
				.collect();
			const answers = await ctx.db
				.query("submissionAnswers")
				.withIndex("by_submissionId", (q) =>
					q.eq("submissionId", args.submissionId),
				)
				.collect();

			score = calculateScore(questions, answers);
		}

		return {
			status: submission.status,
			startedAt: submission.startedAt,
			completedAt: submission.completedAt,
			participantId: submission.participantId,
			score,
			duration: submission.duration,
		};
	},
});
export const getSubmissionAnswers = query({
	args: { submissionId: v.id("submissions") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		await validateSubmissionParticipant(ctx, args.submissionId, user._id);

		const studentAnswers = await ctx.db
			.query("submissionAnswers")
			.withIndex("by_submissionId", (q) =>
				q.eq("submissionId", args.submissionId),
			)
			.collect();

		return studentAnswers;
	},
});
export const getStudentSubmissions = query({
	args: {},
	handler: async (ctx) => {
		const user = await getAuthUserOrThrow(ctx);
		requireStudentRole(user);

		const submissions = await ctx.db
			.query("submissions")
			.withIndex("by_participantId", (q) => q.eq("participantId", user._id))
			.collect();

		// Fetch exam details for each submission
		const submissionsWithExams = await Promise.all(
			submissions.map(async (submission) => {
				const exam = await ctx.db.get(submission.examId);
				const questions = await ctx.db
					.query("questions")
					.withIndex("by_examId", (q) => q.eq("examId", submission.examId))
					.collect();

				const examTotalPoints = questions.reduce((sum, q) => sum + q.points, 0);

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

				// Omit shuffle flags from submission object
				const {
					isQuestionsShuffled: _qs,
					isAnswersShuffled: _as,
					shuffleSeed: _ss,
					...submissionRest
				} = submission;

				return {
					...submissionRest,
					allowLateJoining: exam?.allowLateJoining ?? false,
					score,
					examTitle: exam?.title ?? "Unknown Exam",
					examTotalPoints,
				};
			}),
		);

		// Sort by completedAt descending, fallback to startedAt
		return submissionsWithExams.sort((a, b) => {
			const timeA = a.completedAt ?? a.startedAt;
			const timeB = b.completedAt ?? b.startedAt;
			return timeB - timeA;
		});
	},
});
