import { createStore, Provider as JotaiProvider } from "jotai";
import {
	examHoursAtom,
	examMinutesAtom,
	examSecondsAtom,
} from "~/app/exams/atoms";
import DurationInputs from "~/app/exams/components/duration-inputs";

describe("DurationInputs", () => {
	it("binds the three duration fields to jotai state", () => {
		const store = createStore();

		cy.mount(
			<JotaiProvider store={store}>
				<DurationInputs />
			</JotaiProvider>,
		);

		cy.get("input#hours").clear().type("2");
		cy.get("input#minutes").clear().type("15");
		cy.get("input#seconds").clear().type("30");

		cy.then(() => {
			expect(store.get(examHoursAtom)).to.equal("2");
			expect(store.get(examMinutesAtom)).to.equal("15");
			expect(store.get(examSecondsAtom)).to.equal("30");
		});
	});
});
