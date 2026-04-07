import { createStore, Provider as JotaiProvider } from "jotai";
import {
	examShuffleAnswersAtom,
	examShuffleQuestionsAtom,
	examTitleAtom,
} from "~/app/exams/atoms";
import ExamFormFields from "~/app/exams/components/exam-form-fields";

describe("ExamFormFields", () => {
	it("updates title and shuffle toggles", () => {
		const store = createStore();
		const onSubmit = cy.stub().as("onSubmit");

		cy.mount(
			<JotaiProvider store={store}>
				<ExamFormFields error="" isSubmitting={false} onSubmit={onSubmit} />
			</JotaiProvider>,
		);

		cy.get("input#title").clear().type("Physics 101");
		cy.get("button#shuffle").click({ force: true });
		cy.get("button#shuffle-answers").click({ force: true });

		cy.then(() => {
			expect(store.get(examTitleAtom)).to.equal("Physics 101");
			expect(store.get(examShuffleQuestionsAtom)).to.equal(true);
			expect(store.get(examShuffleAnswersAtom)).to.equal(true);
		});
	});

	it("submits the form", () => {
		const store = createStore();
		const onSubmit = cy.stub().as("onSubmit");

		cy.mount(
			<JotaiProvider store={store}>
				<ExamFormFields error="" isSubmitting={false} onSubmit={onSubmit} />
			</JotaiProvider>,
		);

		cy.get("form").submit();
		cy.get("@onSubmit").should("have.been.calledOnce");
	});
});
