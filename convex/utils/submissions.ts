import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Fetches a submission by its ID or throws a ConvexError if not found.
 *
 * @param ctx - The Convex mutation or query context.
 * @param submissionId - The ID of the submission to fetch.
 * @returns The submission document.
 * @throws {ConvexError} "Submission not found" if the submission does not exist.
 */
export async function getSubmissionOrThrow(
	ctx: MutationCtx | QueryCtx,
	submissionId: Id<"submissions">,
) {
	const submission = await ctx.db.get(submissionId);
	if (!submission) {
		throw new ConvexError("Submission not found");
	}
	return submission;
}

/**
 * Ensures the user is the participant of the specified submission.
 *
 * @param ctx - The Convex mutation or query context.
 * @param submissionId - The ID of the submission to check.
 * @param userId - The ID of the user to verify as the participant.
 * @returns The submission document if the user is the participant.
 * @throws {ConvexError} "Unauthorized: You do not have access to this submission" if the user is not the participant or if the submission is not found.
 */
export async function validateSubmissionParticipant(
	ctx: MutationCtx | QueryCtx,
	submissionId: Id<"submissions">,
	userId: string,
) {
	const submission = await getSubmissionOrThrow(ctx, submissionId);
	if (submission.participantId !== userId) {
		throw new ConvexError(
			"Unauthorized: You do not have access to this submission",
		);
	}
	return submission;
}

/**
 * Validates that a question belongs to a specific exam.
 *
 * @param ctx - The Convex mutation or query context.
 * @param questionId - The ID of the question to validate.
 * @param examId - The ID of the exam the question should belong to.
 * @returns The question document if the validation is successful.
 * @throws {ConvexError} "Unauthorized: Question does not belong to this exam" if the validation fails.
 */
export async function validateQuestionInExam(
	ctx: MutationCtx | QueryCtx,
	questionId: Id<"questions">,
	examId: Id<"exams">,
) {
	const question = await ctx.db.get(questionId);
	if (!question || question.examId !== examId) {
		throw new ConvexError(
			"Unauthorized: Question does not belong to this exam",
		);
	}
	return question;
}

/**
 * Calculates the score for a list of questions and their corresponding answers.
 *
 * @param questions - An array of question objects containing points and correct answers.
 * @param answers - An array of answer objects containing the question reference and the provided answer.
 * @returns The total score calculated based on correct answers.
 */
export function calculateScore(
	questions: Pick<Doc<"questions">, "_id" | "correctAnswer" | "points">[],
	answers: Pick<Doc<"submissionAnswers">, "questionId" | "answer">[],
) {
	let score = 0;
	// Create a map for faster lookup if there are many answers
	const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));

	for (const question of questions) {
		const userAnswer = answerMap.get(question._id);
		if (
			userAnswer &&
			userAnswer.toLowerCase().trim() ===
				question.correctAnswer.toLowerCase().trim()
		) {
			score += question.points;
		}
	}
	return score;
}
