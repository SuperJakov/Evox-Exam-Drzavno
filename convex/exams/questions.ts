import { ConvexError, v } from "convex/values";
import { internal } from "../_generated/api";
import { mutation } from "../_generated/server";
import { getAuthUserOrThrow, requireTeacherRole } from "../utils/auth";
import { validateExamOwner } from "../utils/exams";
import { getQuestionOrThrow } from "../utils/questions";

function normalizeAnswer(value: string) {
	return value.trim().toLowerCase();
}

function validateMultipleChoiceQuestion(
	options: string[] | undefined,
	correctAnswer: string,
) {
	if (!options || options.length < 2) {
		throw new ConvexError(
			"Multiple choice questions must have at least 2 options",
		);
	}

	const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);
	const hasCorrectAnswer = options.some(
		(option) => normalizeAnswer(option) === normalizedCorrectAnswer,
	);

	if (!hasCorrectAnswer) {
		throw new ConvexError(
			"Correct answer must match one of the multiple choice options",
		);
	}
}

export const addQuestion = mutation({
	args: {
		examId: v.id("exams"),
		text: v.string(),
		type: v.union(
			v.literal("multiple_choice"),
			v.literal("short_answer"),
			v.literal("true_false"),
		),
		options: v.optional(v.array(v.string())),
		correctAnswer: v.string(),
		points: v.number(),
		image: v.optional(v.id("_storage")),
	},
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		const exam = await validateExamOwner(ctx, args.examId, user._id);

		// Structural lock: prevent adding questions to published exams
		if (exam.isPublished) {
			throw new ConvexError(
				"Cannot add questions to a published exam. Duplicate the exam to make changes.",
			);
		}

		if (!args.correctAnswer)
			throw new ConvexError("Correct answer is required");

		// Get current question count for order
		const questions = await ctx.db
			.query("questions")
			.withIndex("by_examId", (q) => q.eq("examId", args.examId))
			.collect();

		if (args.type === "multiple_choice") {
			validateMultipleChoiceQuestion(args.options, args.correctAnswer);
		}

		const nextOrder =
			questions.reduce((max, question) => Math.max(max, question.order), -1) +
			1;

		await ctx.db.insert("questions", {
			examId: args.examId,
			text: args.text,
			type: args.type,
			options: args.options,
			correctAnswer: args.correctAnswer,
			points: args.points,
			order: nextOrder,
			image: args.image,
		});
	},
});

export const updateQuestion = mutation({
	args: {
		questionId: v.id("questions"),
		text: v.string(),
		type: v.union(
			v.literal("multiple_choice"),
			v.literal("short_answer"),
			v.literal("true_false"),
		),
		options: v.optional(v.array(v.string())),
		correctAnswer: v.string(),
		points: v.number(),
		image: v.optional(v.id("_storage")),
	},
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		const question = await getQuestionOrThrow(ctx, args.questionId);
		const exam = await validateExamOwner(ctx, question.examId, user._id);

		if (args.type === "multiple_choice") {
			validateMultipleChoiceQuestion(
				exam.isPublished ? question.options : args.options,
				args.correctAnswer,
			);
		}

		// Prevent changing question text, type, or answer options
		if (exam.isPublished) {
			// Check if trying to change structural elements
			const isChangingText = args.text !== question.text;
			const isChangingType = args.type !== question.type;
			const isChangingOptions =
				JSON.stringify(args.options) !== JSON.stringify(question.options);
			const isChangingImage = args.image !== question.image;

			if (
				isChangingText ||
				isChangingType ||
				isChangingOptions ||
				isChangingImage
			) {
				throw new ConvexError(
					"Cannot change question text, image, or answer options on a published exam. You can only edit points and correct answers.",
				);
			}

			// Only update points and correctAnswer
			await ctx.db.patch("questions", args.questionId, {
				correctAnswer: args.correctAnswer,
				points: args.points,
			});
		} else {
			// Exam is not published, allow all changes
			await ctx.db.patch("questions", args.questionId, {
				text: args.text,
				type: args.type,
				options: args.options,
				correctAnswer: args.correctAnswer,
				points: args.points,
				image: args.image,
			});
		}

		await ctx.scheduler.runAfter(
			0,
			internal.exams.analytics.internalComputeAnalytics,
			{ examId: exam._id },
		);
	},
});

export const deleteQuestion = mutation({
	args: { questionId: v.id("questions") },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		const question = await getQuestionOrThrow(ctx, args.questionId);
		const exam = await validateExamOwner(ctx, question.examId, user._id);

		// Structural lock: prevent deleting questions from published exams
		if (exam.isPublished) {
			throw new ConvexError(
				"Cannot delete questions from a published exam. Duplicate the exam to make changes.",
			);
		}

		await ctx.db.delete(args.questionId);

		const remainingQuestions = await ctx.db
			.query("questions")
			.withIndex("by_examId", (q) => q.eq("examId", question.examId))
			.collect();

		const sortedQuestions = remainingQuestions.sort(
			(a, b) => a.order - b.order,
		);
		await Promise.all(
			sortedQuestions.map((remainingQuestion, index) =>
				remainingQuestion.order === index
					? Promise.resolve()
					: ctx.db.patch(remainingQuestion._id, { order: index }),
			),
		);
	},
});
