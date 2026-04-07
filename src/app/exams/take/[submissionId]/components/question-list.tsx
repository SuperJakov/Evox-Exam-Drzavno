import type { Id } from "convex/_generated/dataModel";
import { QuestionItem } from "./question-item";

interface QuestionListProps {
	questions: {
		_id: Id<"questions">;
		text: string;
		points: number;
		type: "multiple_choice" | "true_false" | "short_answer";
		options?: string[];
	}[];
	answers: Record<string, string>;
	markedQuestions: Set<string>;
	onAnswerChange: (questionId: Id<"questions">, value: string) => void;
	onToggleMark: (questionId: Id<"questions">) => void;
}

export function QuestionList({
	questions,
	answers,
	markedQuestions,
	onAnswerChange,
	onToggleMark,
}: QuestionListProps) {
	return (
		<div className="space-y-8">
			{questions.map((q, index) => (
				<QuestionItem
					answer={answers[q._id]}
					index={index}
					isMarked={markedQuestions.has(q._id)}
					key={q._id}
					onAnswerChange={onAnswerChange}
					onToggleMark={onToggleMark}
					question={q}
				/>
			))}
		</div>
	);
}
