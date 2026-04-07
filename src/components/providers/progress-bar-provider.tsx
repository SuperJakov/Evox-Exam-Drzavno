"use client";

import { AppProgressProvider as ProgressBar } from "@bprogress/next";

export function ProgressBarProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ProgressBar
			color="var(--primary)"
			height="4px"
			options={{ showSpinner: false }}
			shallowRouting
		>
			{children}
		</ProgressBar>
	);
}
