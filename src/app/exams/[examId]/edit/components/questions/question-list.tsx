"use client";

import type { ExamDetails } from "../shared/types";
import { QuestionCard } from "./question-card";

type QuestionListProps = {
	exam: ExamDetails;
};

export function QuestionList({ exam }: QuestionListProps) {
	const questions = exam.questions || [];
	if (questions.length === 0) {
		return (
			<div className="rounded-lg border-2 border-dashed py-10 text-center text-muted-foreground">
				No questions added yet.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{questions.map((q, index) => (
				<QuestionCard
					index={index}
					isPublished={exam.isPublished}
					key={q._id}
					question={q}
				/>
			))}
		</div>
	);
}
