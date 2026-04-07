import usePresence from "@convex-dev/presence/react";
import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "~/hooks/use-auth";
import { useConvexQuery } from "~/hooks/use-convex-query";
import { isFullscreenWarningOpenAtom } from "../atoms";

interface UseTakeExamProps {
	submissionId: Id<"submissions">;
}

export function useTakeExam({ submissionId }: UseTakeExamProps) {
	const { user } = useAuth();
	const examStaticData = useConvexQuery(
		api.exams.submission.studentQueries.getExamStaticData,
		{
			submissionId,
		},
	);
	const submissionState = useConvexQuery(
		api.exams.submission.studentQueries.getSubmissionState,
		{
			submissionId,
		},
	);
	const submissionAnswers = useConvexQuery(
		api.exams.submission.studentQueries.getSubmissionAnswers,
		{
			submissionId,
		},
	);
	const markedQuestions =
		useConvexQuery(
			api.exams.submission.studentQueries.getMarkedQuestionsForSubmission,
			{
				submissionId,
			},
		) ?? [];

	const submitAnswer = useMutation(
		api.exams.submission.studentMutations.submitAnswer,
	).withOptimisticUpdate((localStore, args) => {
		const { submissionId, questionId, answer } = args;
		const existingAnswers = localStore.getQuery(
			api.exams.submission.studentQueries.getSubmissionAnswers,
			{
				submissionId,
			},
		);

		if (existingAnswers) {
			const existingAnswerIndex = existingAnswers.findIndex(
				(a) => a.questionId === questionId,
			);

			const newAnswer = {
				submissionId,
				questionId,
				answer,
				_id: "temp-id" as Id<"submissionAnswers">, // Temporary ID
				_creationTime: Date.now(),
			} as Doc<"submissionAnswers">;

			const newAnswers = [...existingAnswers];
			if (existingAnswerIndex !== -1) {
				const currentAnswer = newAnswers[existingAnswerIndex];
				if (currentAnswer) {
					newAnswers[existingAnswerIndex] = {
						...currentAnswer,
						answer,
					};
				}
			} else {
				newAnswers.push(newAnswer);
			}

			localStore.setQuery(
				api.exams.submission.studentQueries.getSubmissionAnswers,
				{ submissionId },
				newAnswers,
			);
		}
	});

	const finishExam = useMutation(
		api.exams.submission.studentMutations.finishExam,
	);

	const toggleMarkQuestion = useMutation(
		api.exams.submission.studentMutations.toggleMarkQuestion,
	).withOptimisticUpdate((localStore, args) => {
		const { submissionId, questionId, shouldMark } = args;
		const existingState = localStore.getQuery(
			api.exams.submission.studentQueries.getMarkedQuestionsForSubmission,
			{
				submissionId,
			},
		);

		if (existingState) {
			const markedQuestions = existingState || [];
			const newMarkedQuestions = shouldMark
				? [...new Set([...markedQuestions, questionId])]
				: markedQuestions.filter((id) => id !== questionId);

			localStore.setQuery(
				api.exams.submission.studentQueries.getMarkedQuestionsForSubmission,
				{ submissionId },
				newMarkedQuestions,
			);
		}
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isOnline, setIsOnline] = useState(true);
	const [isFullscreenWarningOpen] = useAtom(isFullscreenWarningOpenAtom);

	// Track presence for this exam session (heartbeat every 5 seconds)
	const presenceState = usePresence(
		api.submission_presence,
		submissionId,
		user?._id ?? "",
		5_000,
	);

	// Derived answers map from query data
	const answers =
		submissionAnswers?.reduce(
			(acc, curr) => {
				acc[curr.questionId] = curr.answer;
				return acc;
			},
			{} as Record<string, string>,
		) || {};

	const handleFinishExam = async () => {
		if (isSubmitting) return;
		setIsSubmitting(true);
		try {
			await finishExam({ submissionId });
		} catch (error) {
			console.error("Failed to finish exam:", error);
			setIsSubmitting(false);
		}
	};

	const handleAnswerChange = async (
		questionId: Id<"questions">,
		value: string,
	) => {
		// Auto-save answer
		await submitAnswer({
			submissionId,
			questionId,
			answer: value,
		});
	};

	const handleToggleMark = async (questionId: Id<"questions">) => {
		const isMarked = markedQuestions?.includes(questionId) ?? false;
		await toggleMarkQuestion({
			submissionId,
			questionId,
			shouldMark: !isMarked,
		});
	};

	const handleNavigate = (index: number) => {
		const element = document.getElementById(`question-${index}`);
		if (element) {
			const headerOffset = 100;
			const elementPosition = element.getBoundingClientRect().top;
			const offsetPosition =
				elementPosition + window.pageYOffset - headerOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		}
	};

	// Monitor online/offline status
	useEffect(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		// Set initial state
		if (typeof navigator !== "undefined") {
			setIsOnline(navigator.onLine);
		}

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	// Exit fullscreen when exam is completed
	useEffect(() => {
		if (submissionState?.status === "completed" && document.fullscreenElement) {
			document.exitFullscreen().catch((err) => {
				console.error("Failed to exit fullscreen:", err);
			});
		}
	}, [submissionState?.status]);

	// Check if data is loading
	const isLoading = !examStaticData || !submissionState || !submissionAnswers;

	const markedQuestionsSet = useMemo(
		() => new Set(markedQuestions),
		[markedQuestions],
	);

	return {
		examStaticData,
		submissionState,
		submissionAnswers,
		markedQuestions,
		markedQuestionsSet,
		answers,
		isSubmitting,
		isOnline,
		isFullscreenWarningOpen,
		isLoading,
		presenceState,
		handleFinishExam,
		handleAnswerChange,
		handleToggleMark,
		handleNavigate,
	};
}
