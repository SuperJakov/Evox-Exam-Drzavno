/** biome-ignore-all lint/complexity/noUselessStringRaw: Even though it can sometimes be usless, if we wanted to edit these strings, it would require more work and knowledge to know that we also have to add String.raw */
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { LatexRenderer } from "~/components/ui/latex-renderer";
import { Separator } from "~/components/ui/separator";

export const metadata: Metadata = {
	title: "LaTeX Guide | Evox Exam",
	description:
		"Learn how to use LaTeX to render mathematical expressions on Evox Exam.",
	alternates: {
		canonical: "https://www.evoxexam.xyz/latex-guide",
	},
};

export default function LatexGuidePage() {
	return (
		<div className="container mx-auto max-w-4xl px-4 py-16">
			<Link href="/faq">
				<Button className="mb-8 gap-2" size="sm" variant="ghost">
					<ChevronLeft className="h-4 w-4" />
					Back to FAQ
				</Button>
			</Link>

			<div className="mb-12">
				<h1 className="mb-4 font-extrabold text-4xl tracking-tight">
					LaTeX Rendering Guide
				</h1>
				<p className="text-lg text-muted-foreground">
					Evox Exam supports LaTeX for rendering complex mathematical
					expressions. Use the delimiters below to include math in your
					questions, answers, and descriptions.
				</p>
			</div>

			<section className="mb-12">
				<h2 className="mb-4 font-bold text-2xl tracking-tight">How it Works</h2>
				<p className="text-muted-foreground leading-relaxed">
					We use <strong>KaTeX</strong> to provide high-quality mathematical
					typography. When you wrap text in specific delimiters, our system
					automatically converts the LaTeX code into beautiful formulas. This
					works anywhere you can enter text, including question titles and
					answer choices.
				</p>
			</section>

			<section className="mb-12">
				<h2 className="mb-6 font-bold text-2xl tracking-tight">Delimiters</h2>
				<div className="overflow-hidden rounded-lg border">
					<table className="w-full text-left text-sm">
						<thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider">
							<tr>
								<th className="px-6 py-4 font-semibold">Delimiter</th>
								<th className="px-6 py-4 font-semibold">Type</th>
								<th className="px-6 py-4 font-semibold">Result</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							<tr>
								<td className="px-6 py-4 font-mono">{"\\( ... \\)"}</td>
								<td className="px-6 py-4">Inline</td>
								<td className="px-6 py-4 text-muted-foreground">
									Renders within the sentence
								</td>
							</tr>
							<tr>
								<td className="px-6 py-4 font-mono">{"$$ ... $$"}</td>
								<td className="px-6 py-4">Block</td>
								<td className="px-6 py-4 text-muted-foreground">
									Renders on a new line, centered
								</td>
							</tr>
							<tr>
								<td className="px-6 py-4 font-mono">{"\\[ ... \\]"}</td>
								<td className="px-6 py-4">Block</td>
								<td className="px-6 py-4 text-muted-foreground">
									Renders on a new line, centered
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<section className="mb-12">
				<h2 className="mb-6 font-bold text-2xl tracking-tight">Examples</h2>
				<div className="space-y-8">
					<ExampleCard
						code="The area of a circle is defined by \( A = \pi r^2 \), where \( r \) is the radius."
						description="Use inline delimiters to include symbols or small equations directly in your text."
						title="Inline Math"
					/>

					<ExampleCard
						code="The fundamental theorem of calculus states: $$ \int_a^b f(x) \, dx = F(b) - F(a) $$"
						description="Use block delimiters ($$ ... $$ or \[ ... \]) for larger equations that should stand out on their own line."
						title="Block Math"
					/>

					<ExampleCard
						code={`In physics, the relationship between mass and energy is one of the most famous equations: \\[ E = mc^2 \\] Where \\( E \\) is energy, \\( m \\) is mass, and \\( c \\) is the speed of light (approximately \\( 3 \\times 10^8 \\text{ m/s} \\)).`}
						description="You can mix normal text, inline math, and block math to create detailed explanations."
						title="Complex Combinations"
					/>
				</div>
			</section>

			<section className="mb-12">
				<h2 className="mb-6 font-bold text-2xl tracking-tight">
					Common Math Symbols & Formulas
				</h2>
				<div className="overflow-hidden rounded-lg border">
					<table className="w-full text-left text-sm">
						<thead className="bg-muted/50 text-muted-foreground uppercase tracking-wider">
							<tr>
								<th className="px-6 py-4 font-semibold">Description</th>
								<th className="px-6 py-4 font-semibold">LaTeX Code</th>
								<th className="px-6 py-4 font-semibold">Preview</th>
							</tr>
						</thead>
						<tbody className="divide-y">
							{[
								{
									desc: "Fractions",
									code: String.raw`\frac{a}{b}`,
									preview: String.raw`\( \frac{a}{b} \)`,
								},
								{
									desc: "Exponents",
									code: String.raw`x^2`,
									preview: String.raw`\( x^2 \)`,
								},
								{
									desc: "Subscripts",
									code: String.raw`a_n`,
									preview: String.raw`\( a_n \)`,
								},
								{
									desc: "Square Root",
									code: String.raw`\sqrt{x}`,
									preview: String.raw`\( \sqrt{x} \)`,
								},
								{
									desc: "n-th Root",
									code: String.raw`\sqrt[n]{x}`,
									preview: String.raw`\( \sqrt[n]{x} \)`,
								},
								{
									desc: "Summation",
									code: String.raw`\sum_{i=1}^{n} a_i`,
									preview: String.raw`\( \sum_{i=1}^{n} a_i \)`,
								},
								{
									desc: "Integrals",
									code: String.raw`\int_{a}^{b} x^2 \, dx`,
									preview: String.raw`\( \int_{a}^{b} x^2 \, dx \)`,
								},
								{
									desc: "Limits",
									code: String.raw`\lim_{x \to \infty} f(x)`,
									preview: String.raw`\( \lim_{x \to \infty} f(x) \)`,
								},
								{
									desc: "Greek Letters",
									code: String.raw`\alpha, \beta, \gamma, \pi`,
									preview: String.raw`\( \alpha, \beta, \gamma, \pi \)`,
								},
								{
									desc: "Trigonometry",
									code: String.raw`\sin(x), \cos(\theta)`,
									preview: String.raw`\( \sin(x), \cos(\theta) \)`,
								},
								{
									desc: "Matrices",
									code: String.raw`\begin{pmatrix} a & b \\ c & d \end{pmatrix}`,
									preview: String.raw`\( \begin{pmatrix} a & b \\ c & d \end{pmatrix} \)`,
								},
								{
									desc: "Vectors",
									code: String.raw`\vec{v} \text{ or } \mathbf{u}`,
									preview: String.raw`\( \vec{v} \text{ or } \mathbf{u} \)`,
								},
								{
									desc: "Set Notation",
									code: String.raw`\forall x \in A, \exists y`,
									preview: String.raw`\( \forall x \in A, \exists y \)`,
								},
								{
									desc: "Relations",
									code: String.raw`\neq, \approx, \leq, \geq`,
									preview: String.raw`\( \neq, \approx, \leq, \geq \)`,
								},
							].map((item) => (
								<tr key={item.desc}>
									<td className="px-6 py-4">{item.desc}</td>
									<td className="px-6 py-4 font-mono text-muted-foreground">
										{item.code}
									</td>
									<td className="px-6 py-4 text-lg">
										<LatexRenderer content={item.preview} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section className="rounded-xl border bg-muted/30 p-8">
				<h3 className="mb-3 font-bold text-xl">Quick Tips</h3>
				<ul className="list-inside list-disc space-y-2 text-muted-foreground">
					<li>Use backslashes to escape special LaTeX characters if needed.</li>
					<li>
						For block math, ensure there are no other characters on the same
						line as the delimiters for best results.
					</li>
					<li>
						Complex symbols like square roots <code>{"\\sqrt{x}"}</code> and
						fractions <code>{"\\frac{a}{b}"}</code> work in both inline and
						block modes.
					</li>
				</ul>
			</section>
		</div>
	);
}

function ExampleCard({
	title,
	description,
	code,
}: {
	title: string;
	description: string;
	code: string;
}) {
	return (
		<Card className="overflow-hidden">
			<CardHeader>
				<CardTitle className="text-lg">{title}</CardTitle>
				<p className="text-muted-foreground text-sm">{description}</p>
			</CardHeader>
			<CardContent className="p-0">
				<div className="px-6 pt-0 pb-3">
					<p className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
						What you type:
					</p>
					<pre className="overflow-x-auto rounded-md bg-zinc-950 p-4 font-mono text-sm text-zinc-50">
						{code}
					</pre>
				</div>
				<Separator />
				<div className="p-6">
					<p className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
						How it looks:
					</p>
					<div className="rounded-md border bg-background p-6">
						<LatexRenderer content={code} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
