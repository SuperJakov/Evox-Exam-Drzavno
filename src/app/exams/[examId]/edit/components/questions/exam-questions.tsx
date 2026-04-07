import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";
import { QuestionCount } from "./question-count";
import { QuestionList } from "./question-list";

const AddQuestionDialog = dynamic(() =>
	import("./add-question-dialog").then((mod) => mod.AddQuestionDialog),
);

const DeleteQuestionDialog = dynamic(() =>
	import("./delete-question-dialog").then((mod) => mod.DeleteQuestionDialog),
);

const EditQuestionDialog = dynamic(() =>
	import("./edit-question-dialog").then((mod) => mod.EditQuestionDialog),
);

export function ExamQuestions() {
	const params = useParams<{ examId: Id<"exams"> }>();
	const exam = useAuthedConvexQuery(api.exams.general.getExamDetails, {
		examId: params.examId,
	});

	if (!exam) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<>
			<div className="mb-4 flex flex-col justify-between gap-4 rounded-2xl border border-dashed bg-muted/30 p-4 empty:hidden md:flex-row md:items-center md:p-6 [&:not(:has(>*))]:hidden">
				<QuestionCount exam={exam} />
				<AddQuestionDialog />
			</div>
			<QuestionList exam={exam} />
			<DeleteQuestionDialog />
			<EditQuestionDialog />
		</>
	);
}
