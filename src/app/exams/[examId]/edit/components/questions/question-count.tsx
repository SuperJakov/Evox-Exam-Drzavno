"use client";

import type { ExamDetails } from "../shared/types";

type QuestionCountProps = {
	exam: ExamDetails;
};

export function QuestionCount({ exam }: QuestionCountProps) {
	const questionCount = exam.questions?.length ?? 0;

	return <h2 className="font-semibold text-xl">Questions ({questionCount})</h2>;
}
