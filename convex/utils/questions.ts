import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Fetches a question by its ID or throws a ConvexError if not found.
 *
 * @param ctx - The Convex mutation or query context.
 * @param questionId - The ID of the question to fetch.
 * @returns The question document.
 * @throws {ConvexError} "Question not found" if the question does not exist.
 */
export async function getQuestionOrThrow(
	ctx: MutationCtx | QueryCtx,
	questionId: Id<"questions">,
) {
	const question = await ctx.db.get(questionId);
	if (!question) {
		throw new ConvexError("Question not found");
	}
	return question;
}
