import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUserOrThrow, requireTeacherRole } from "../utils/auth";
import { requireNoAccessCode, validateExamOwner } from "../utils/exams";
import { validateExamDuration } from "./util";

const booleanSettingArgs = v.union(
	v.literal("shuffleQuestions"),
	v.literal("shuffleAnswers"),
	v.literal("requireFullscreen"),
	v.literal("allowLateJoining"),
	v.literal("preventDuplicateAttempts"),
);

function getBooleanSettingLockMessage(setting: string) {
	switch (setting) {
		case "shuffleQuestions":
		case "shuffleAnswers":
			return "Cannot change shuffle settings after an access code has been created.";
		case "requireFullscreen":
			return "Cannot change fullscreen setting after an access code has been created.";
		case "allowLateJoining":
			return "Cannot change late joining setting after an access code has been created.";
		case "preventDuplicateAttempts":
			return "Cannot change security settings after an access code has been created.";
		default:
			return "Cannot change this setting after an access code has been created.";
	}
}

export const updateExamBooleanSetting = mutation({
	args: {
		examId: v.id("exams"),
		setting: booleanSettingArgs,
		value: v.boolean(),
	},
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		await validateExamOwner(ctx, args.examId, user._id);

		await requireNoAccessCode(
			ctx,
			args.examId,
			getBooleanSettingLockMessage(args.setting),
		);

		await ctx.db.patch(args.examId, {
			[args.setting]: args.value,
		});
	},
});

export const updateExamDuration = mutation({
	args: { examId: v.id("exams"), duration: v.number() },
	handler: async (ctx, args) => {
		const user = await getAuthUserOrThrow(ctx);
		requireTeacherRole(user);

		await validateExamOwner(ctx, args.examId, user._id);

		validateExamDuration(args.duration);

		await ctx.db.patch(args.examId, { duration: args.duration });
	},
});
