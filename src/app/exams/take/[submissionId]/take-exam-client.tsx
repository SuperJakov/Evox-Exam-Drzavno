"use client";

import type { Id } from "convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { ExamFooter } from "./components/exam-footer";
import { ExamHeader } from "./components/exam-header";
import { QuestionList } from "./components/question-list";
import { QuestionNavigation } from "./components/question-navigation";
import { useTakeExam } from "./hooks/use-take-exam";

const CheatingTracker = dynamic(
	() =>
		import("./components/cheating-tracker").then((mod) => mod.CheatingTracker),
	{ ssr: false },
);

const ExamCompleted = dynamic(() =>
	import("./components/exam-completed").then((mod) => mod.ExamCompleted),
);

interface TakeExamClientProps {
	submissionId: Id<"submissions">;
}

export default function TakeExamClient({ submissionId }: TakeExamClientProps) {
	const {
		examStaticData,
		submissionState,
		markedQuestionsSet,
		answers,
		isSubmitting,
		isOnline,
		isFullscreenWarningOpen,
		isLoading,
		handleFinishExam,
		handleAnswerChange,
		handleToggleMark,
		handleNavigate,
	} = useTakeExam({ submissionId });

	const exam = examStaticData?.exam;
	const questions = examStaticData?.questions;
	const startedAt = submissionState?.startedAt;
	const completedAt = submissionState?.completedAt;

	if (submissionState?.status === "completed") {
		return (
			<ExamCompleted
				score={submissionState.score}
				totalPoints={exam?.totalPoints || 0}
			/>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<div
				className={`flex flex-1 flex-col ${
					isFullscreenWarningOpen ? "pointer-events-none blur-md" : ""
				}`}
			>
				<ExamHeader
					answers={answers}
					duration={submissionState?.duration ?? exam?.duration}
					isCompleted={!!completedAt}
					markedQuestions={markedQuestionsSet}
					onNavigate={handleNavigate}
					questions={questions ?? []}
					startedAt={startedAt}
					title={exam?.title}
					totalPoints={exam?.totalPoints || 0}
				/>

				<div className="container mx-auto max-w-3xl flex-1 space-y-8 px-4 py-10 pb-32">
					{isLoading ? (
						<div className="flex h-[50vh] items-center justify-center">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : (
						<>
							<QuestionNavigation
								answers={answers}
								markedQuestions={markedQuestionsSet}
								onNavigate={handleNavigate}
								questions={questions ?? []}
							/>

							<QuestionList
								answers={answers}
								markedQuestions={markedQuestionsSet}
								onAnswerChange={handleAnswerChange}
								onToggleMark={handleToggleMark}
								questions={questions ?? []}
							/>

							<ExamFooter
								isOnline={isOnline}
								isSubmitting={isSubmitting}
								onFinish={handleFinishExam}
							/>
						</>
					)}
				</div>
			</div>
			{!isLoading && exam && (
				<CheatingTracker
					requireFullscreen={exam.requireFullscreen}
					submissionId={submissionId}
				/>
			)}
		</div>
	);
}
