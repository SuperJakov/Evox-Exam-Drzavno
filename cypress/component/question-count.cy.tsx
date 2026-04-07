import type { Id } from "convex/_generated/dataModel";
import { QuestionCount } from "~/app/exams/[examId]/edit/components/questions/question-count";
import type { ExamDetails } from "~/app/exams/[examId]/edit/components/shared/types";

describe("QuestionCount", () => {
	it("renders the number of questions", () => {
		cy.mount(
			<QuestionCount
				exam={
					{
						questions: [
							{ _id: "question-1" as Id<"questions"> },
							{ _id: "question-2" as Id<"questions"> },
						],
					} as unknown as ExamDetails
				}
			/>,
		);

		cy.contains("Questions (2)").should("be.visible");
	});
});
