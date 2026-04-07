import { v } from "convex/values";
import { components } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { resend } from "../auth_modules/resend";
import { generateEmail } from "../utils/emails";

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

/**
 * Sends a "results ready" notification email to a student after their exam
 * submission has been graded.
 *
 * @param submissionId - The graded submission's ID
 * @param participantId - The BetterAuth user ID of the student
 * @param examTitle - Title of the exam that was graded
 * @param score - Points earned
 * @param totalPoints - Maximum possible points for the exam
 */
export const sendExamGradedEmail = internalAction({
	args: {
		submissionId: v.id("submissions"),
		participantId: v.string(),
		examTitle: v.string(),
		score: v.number(),
		totalPoints: v.number(),
	},
	handler: async (ctx, args) => {
		// Fetch the participant's user record
		const user = await ctx.runQuery(components.betterAuth.user.getUserById, {
			userId: args.participantId,
		});

		// Only send to students
		if (!user || user.role !== "student") {
			return;
		}

		const email = user.email as string;
		const name = user.firstName as string | undefined;
		const submissionsUrl = `${siteUrl}/submissions`;

		const template = generateEmail({
			type: "exam-graded",
			name,
			examTitle: args.examTitle,
			score: args.score,
			totalPoints: args.totalPoints,
			submissionsUrl,
		});

		await resend.sendEmail(ctx, {
			from: `Evox Exam <${process.env.EMAIL_FROM}>`,
			to: email,
			subject: template.subject,
			html: template.html,
		});
	},
});
