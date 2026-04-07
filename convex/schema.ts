import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	exams: defineTable({
		ownerId: v.string(),
		title: v.string(),
		isPublished: v.boolean(),
		duration: v.number(), // in milliseconds
		shuffleQuestions: v.boolean(),
		shuffleAnswers: v.boolean(),
		requireFullscreen: v.boolean(),
		allowLateJoining: v.optional(v.boolean()),
		preventDuplicateAttempts: v.optional(v.boolean()),
	}).index("by_ownerId", ["ownerId"]),

	examGroupings: defineTable({
		examId: v.id("exams"),
		name: v.string(),
	})
		.index("by_examId", ["examId"])
		.index("by_examId_name", ["examId", "name"]),

	examAccessCodes: defineTable({
		examId: v.id("exams"),
		accessCode: v.string(),
		accessCodeContextId: v.string(), // Unique ID for the current access code session
		activatedAt: v.number(), // When access code was activated
		expiresAt: v.number(), // When access code expires
		expirationJobId: v.optional(v.id("_scheduled_functions")), // ID of the scheduled expiration job
		groupingId: v.optional(v.id("examGroupings")), // Link to specific group if applicable
	})
		.index("by_examId", ["examId"])
		.index("by_accessCode", ["accessCode"]),

	questions: defineTable({
		examId: v.id("exams"),
		text: v.string(),
		type: v.union(
			v.literal("multiple_choice"),
			v.literal("short_answer"),
			v.literal("true_false"),
		),
		options: v.optional(v.array(v.string())), // For multiple choice
		correctAnswer: v.string(),
		points: v.number(),
		order: v.number(),
		image: v.optional(v.id("_storage")),
	}).index("by_examId", ["examId"]),

	submissions: defineTable({
		examId: v.id("exams"),
		participantId: v.string(), // User ID of the student who joined
		startedAt: v.number(),
		completedAt: v.optional(v.number()),
		status: v.union(v.literal("in_progress"), v.literal("completed")),
		shuffleSeed: v.optional(v.number()),
		isQuestionsShuffled: v.boolean(),
		isAnswersShuffled: v.boolean(),
		duration: v.optional(v.number()), // Recorded at the time of joining
		groupingId: v.optional(v.id("examGroupings")), // Link to the submission's group
	})
		.index("by_examId", ["examId"])
		.index("by_participantId", ["participantId"])
		.index("by_examId_participantId", ["examId", "participantId"])
		.index("by_examId_participantId_status", [
			"examId",
			"participantId",
			"status",
		])
		.index("by_examId_groupingId", ["examId", "groupingId"])
		.index("by_examId_status", ["examId", "status"]),

	markedQuestions: defineTable({
		submissionId: v.id("submissions"),
		questionId: v.id("questions"),
	})
		.index("by_submissionId", ["submissionId"])
		.index("by_submissionId_and_questionId", ["submissionId", "questionId"]),

	submissionAnswers: defineTable({
		submissionId: v.id("submissions"),
		questionId: v.id("questions"),
		answer: v.string(),
	})
		.index("by_submissionId", ["submissionId"])
		.index("by_submissionId_and_questionId", ["submissionId", "questionId"]),

	cheatingLogs: defineTable({
		submissionId: v.id("submissions"),
		eventType: v.union(
			v.literal("tab_switch"),
			v.literal("window_blur"),
			v.literal("exit_fullscreen"),
		),
		timestamp: v.number(),
	}).index("by_submissionId", ["submissionId"]),

	profilePictures: defineTable({
		userId: v.string(),
		storageId: v.id("_storage"),
		blurDataUrl: v.optional(v.string()),
	}).index("by_userId", ["userId"]),

	examAnalytics: defineTable({
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
		lastUpdated: v.number(),
		status: v.union(v.literal("computing"), v.literal("ready")),
		janitorId: v.optional(v.id("_scheduled_functions")),
	}).index("by_examId", ["examId"]),
});
