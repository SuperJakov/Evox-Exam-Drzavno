"use client";

import "katex/dist/katex.min.css";
import { Fragment, useMemo } from "react";
import { BlockMath, InlineMath } from "react-katex";

interface LatexRendererProps {
	content?: string | null;
}

const LATEX_DELIMITERS = [
	{ start: "$$", end: "$$", Component: BlockMath },
	{ start: "\\(", end: "\\)", Component: InlineMath },
	{ start: "\\[", end: "\\]", Component: BlockMath },
] as const;

// Helper to escape strings for use in a regular expression
const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Generate a regex that matches any of the configured LaTeX delimiters
// It creates a pattern like ($$[\s\S]*?$$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))
const LATEX_REGEX = new RegExp(
	`(${LATEX_DELIMITERS.map(
		(d) => `${escapeRegex(d.start)}[\\s\\S]*?${escapeRegex(d.end)}`,
	).join("|")})`,
);

export function LatexRenderer({ content }: LatexRendererProps) {
	const elements = useMemo(() => {
		if (!content) return null;

		const parts = content.split(LATEX_REGEX);

		return parts.map((part, i) => {
			const key = `${i}-${part.length}`;
			if (i % 2 === 0) {
				// Even parts are text
				return (
					<span key={key}>
						{part.split(/\r?\n/).map((line, j, arr) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: indices are used as stable keys for stateless text segments where no unique IDs exist.
							<Fragment key={`${key}-${j}`}>
								{line}
								{j < arr.length - 1 && <br />}
							</Fragment>
						))}
					</span>
				);
			}

			// Odd parts are LaTeX - find the matching delimiter configuration
			const delimiter = LATEX_DELIMITERS.find(
				(d) => part.startsWith(d.start) && part.endsWith(d.end),
			);

			if (delimiter) {
				const math = part.slice(delimiter.start.length, -delimiter.end.length);
				const { Component } = delimiter;
				return <Component key={key} math={math} />;
			}

			// Fallback for any unmatched cases (should not happen with the regex above)
			return (
				<span key={key}>
					{part.split(/\r?\n/).map((line, j, arr) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: indices are used as stable keys for stateless text segments where no unique IDs exist.
						<Fragment key={`${key}-${j}`}>
							{line}
							{j < arr.length - 1 && <br />}
						</Fragment>
					))}
				</span>
			);
		});
	}, [content]);

	if (!content) return null;

	return <>{elements}</>;
}
