import { LatexRenderer } from "~/components/ui/latex-renderer";

describe("LatexRenderer", () => {
	it("renders null if content is empty string", () => {
		cy.mount(
			<div data-testid="container">
				<LatexRenderer content="" />
			</div>,
		);
		cy.get('[data-testid="container"]').should("be.empty");
	});

	it("renders null if content is undefined", () => {
		cy.mount(
			<div data-testid="container">
				<LatexRenderer />
			</div>,
		);
		cy.get('[data-testid="container"]').should("be.empty");
	});

	it("renders plain text without latex", () => {
		cy.mount(<LatexRenderer content="Just some plain text." />);
		cy.contains("Just some plain text.").should("be.visible");
		cy.get(".katex").should("not.exist");
	});

	it("renders block latex using $$...$$", () => {
		cy.mount(<LatexRenderer content="$$E = mc^2$$" />);
		cy.get(".katex-display").should("exist");
	});

	it("renders inline latex using \\(...\\)", () => {
		cy.mount(<LatexRenderer content="\(E = mc^2\)" />);
		cy.get(".katex").should("exist");
	});

	it("renders block latex using \\[...\\]", () => {
		cy.mount(<LatexRenderer content="\[E = mc^2\]" />);
		cy.get(".katex-display").should("exist");
	});

	it("renders mixed text and latex", () => {
		cy.mount(
			<LatexRenderer content="The formula is \(a^2 + b^2 = c^2\) which is Pythagoras theorem. And here is a block: $$x = y$$" />,
		);
		cy.contains("The formula is ").should("be.visible");
		cy.contains(" which is Pythagoras theorem. And here is a block: ").should(
			"be.visible",
		);
		cy.get(".katex").should("have.length.at.least", 2);
		cy.get(".katex-display").should("exist");
	});

	it("renders multiple latex instances of the same type", () => {
		cy.mount(<LatexRenderer content="\(x\) and \(y\) and \(z\)" />);
		cy.get(".katex").should("have.length.at.least", 3);
	});

	it("renders multi-line block latex", () => {
		cy.mount(
			<LatexRenderer
				content={`$$\n\\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}\n$$`}
			/>,
		);
		cy.get(".katex-display").should("exist");
	});

	it("handles unclosed latex as plain text", () => {
		cy.mount(
			<LatexRenderer content="Here is some $$ malformed latex without closing delimiter." />,
		);
		cy.contains(
			"Here is some $$ malformed latex without closing delimiter.",
		).should("be.visible");
		cy.get(".katex").should("not.exist");
	});

	it("handles consecutive latex blocks", () => {
		cy.mount(<LatexRenderer content="$$x=1$$$$y=2$$" />);
		cy.get(".katex-display").should("have.length", 2);
	});

	it("renders correctly with newlines in text segments", () => {
		cy.mount(<LatexRenderer content={`Line 1\nLine 2\n$$x=1$$`} />);
		cy.contains("Line 1").should("exist");
		cy.contains("Line 2").should("exist");
		cy.get("br").should("have.length", 2);
		cy.get(".katex-display").should("exist");
	});

	it("handles content that is only whitespace characters", () => {
		const string = "    \n   \t\n";
		cy.mount(
			<div data-testid="container">
				<LatexRenderer content={string} />
			</div>,
		);
		cy.get('[data-testid="container"]').should("exist");
		cy.get("br").should("have.length", 2);
	});

	it("handles invalid/unknown LaTeX commands gracefully", () => {
		cy.mount(<LatexRenderer content="$$ \invalidcommand $$" />);
		cy.get(".katex-display").should("exist");
		cy.get('[style*="color:#cc0000"]').should("exist");
		cy.contains("\\invalidcommand").should("exist");
	});

	it("handles empty block latex delimiters ($$$$)", () => {
		cy.mount(<LatexRenderer content="$$$$" />);
		// Just ensure it doesn't crash and renders some katex container
		cy.get(".katex").should("exist");
	});

	it("renders HTML special characters in plain text safely (XSS safety)", () => {
		const string = "<script>alert(1)</script>&lt;";
		cy.mount(<LatexRenderer content={string} />);
		cy.contains(string).should("be.visible");
	});

	it("renders LaTeX block at the very start of the string with no leading text", () => {
		cy.mount(<LatexRenderer content="$$x=1$$ trailing text" />);
		cy.get(".katex-display").should("exist");
		cy.contains(" trailing text").should("be.visible");
	});

	it("renders LaTeX expression at the very end of the string with no trailing text", () => {
		cy.mount(<LatexRenderer content="leading text $$x=1$$" />);
		cy.get(".katex-display").should("exist");
		cy.contains("leading text ").should("be.visible");
	});

	it("handles mixed delimiter types in the same content", () => {
		const string = "\\[a\\] \\(b\\) $$c$$";
		cy.mount(<LatexRenderer content={string} />);
		cy.get(".katex-display").should("have.length", 2);
		cy.get(".katex").should("have.length.at.least", 3);
	});

	it("renders Unicode characters in plain text alongside LaTeX", () => {
		cy.mount(<LatexRenderer content="Привет 👋 $$x=1$$" />);
		cy.contains("Привет 👋 ").should("be.visible");
		cy.get(".katex-display").should("exist");
	});

	it("renders complex nested LaTeX (fractions, subscripts, superscripts)", () => {
		cy.mount(<LatexRenderer content="$$ \\frac{a_1^2}{b_2^3} $$" />);
		cy.get(".katex-display").should("exist");
	});

	it("treats unclosed \\( delimiter as plain text", () => {
		const string = "Here is \\( unclosed";

		cy.mount(<LatexRenderer content={string} />);
		cy.contains(string).should("be.visible");
		cy.get(".katex").should("not.exist");
	});

	it("handles large number of consecutive inline expressions (performance/stability)", () => {
		const content = "\\(x^2\\) ".repeat(1000);
		cy.mount(<LatexRenderer content={content} />);
		cy.get(".katex").should("have.length", 1000);
	});

	it("handles Windows-style line endings (\\r\\n) in content", () => {
		cy.mount(<LatexRenderer content={`Line 1\r\nLine 2`} />);
		cy.contains("Line 1").should("exist");
		cy.contains("Line 2").should("exist");
		cy.get("br").should("have.length", 1);
	});
});
