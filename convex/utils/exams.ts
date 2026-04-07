import { ConvexError } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id as AuthId } from "../better-auth/_generated/dataModel";

/**
 * Fetches an exam by its ID or throws a ConvexError if not found.
 *
 * @param ctx - The Convex mutation or query context.
 * @param examId - The ID of the exam to fetch.
 * @returns The exam document.
 * @throws {ConvexError} "Exam not found" if the exam does not exist.
 */
export async function getExamOrThrow(
	ctx: MutationCtx | QueryCtx,
	examId: Id<"exams">,
) {
	const exam = await ctx.db.get(examId);
	if (!exam) {
		throw new ConvexError("Exam not found");
	}
	return exam;
}

/**
 * Ensures the user is the owner of the specified exam.
 *
 * @param ctx - The Convex mutation or query context.
 * @param examId - The ID of the exam to check.
 * @param userId - The ID of the user to verify as the owner.
 * @returns The exam document if the user is the owner.
 * @throws {ConvexError} "Unauthorized" if the user is not the owner or if the exam is not found.
 */
export async function validateExamOwner(
	ctx: MutationCtx | QueryCtx,
	examId: Id<"exams">,
	userId: AuthId<"user">,
) {
	const exam = await getExamOrThrow(ctx, examId);
	if (exam.ownerId !== userId) {
		throw new ConvexError("Unauthorized");
	}
	return exam;
}

/**
 * Calculates the total points from a list of questions.
 *
 * @param questions - The list of questions to sum points from.
 * @returns The total sum of points.
 */
export function calculateTotalPoints(questions: Doc<"questions">[]) {
	return questions.reduce((sum, q) => sum + q.points, 0);
}

/**
 * Checks if an active access code exists for an exam.
 *
 * @param ctx - The Convex mutation or query context.
 * @param examId - The ID of the exam to check.
 * @returns The access code record if found, otherwise null.
 */
export async function getActiveAccessCode(
	ctx: MutationCtx | QueryCtx,
	examId: Id<"exams">,
) {
	return await ctx.db
		.query("examAccessCodes")
		.withIndex("by_examId", (q) => q.eq("examId", examId))
		.first();
}

/**
 * Ensures that no access code exists for the exam before allowing configuration changes.
 *
 * @param ctx - The Convex mutation or query context.
 * @param examId - The ID of the exam to check.
 * @param message - Custom error message.
 * @throws {ConvexError} if an access code exists.
 */
export async function requireNoAccessCode(
	ctx: MutationCtx | QueryCtx,
	examId: Id<"exams">,
	message: string,
) {
	const accessCode = await getActiveAccessCode(ctx, examId);
	if (accessCode) {
		throw new ConvexError(message);
	}
}

/**
 * Deletes an active access code and cancels its expiration job.
 *
 * @param ctx - The Convex mutation or query context.
 * @param examId - The ID of the exam for which to delete the access code.
 */
export async function deleteAccessCode(ctx: MutationCtx, examId: Id<"exams">) {
	const accessCodeRecord = await getActiveAccessCode(ctx, examId);
	if (accessCodeRecord) {
		if (accessCodeRecord.expirationJobId) {
			try {
				await ctx.scheduler.cancel(accessCodeRecord.expirationJobId);
			} catch {
				console.warn(
					"Failed to cancel expiration job for access code",
					accessCodeRecord._id,
				);
			}
		}
		await ctx.db.delete(accessCodeRecord._id);
	}
}
