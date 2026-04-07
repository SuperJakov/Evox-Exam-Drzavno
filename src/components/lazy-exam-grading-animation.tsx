"use client";

import dynamic from "next/dynamic";

export const LazyExamGradingAnimation = dynamic(
	() =>
		import("~/components/exam-grading-animation").then(
			(mod) => mod.ExamGradingAnimation,
		),
	{
		ssr: false,
		loading: () => (
			<div className="w-full max-w-full sm:w-[400px]">
				<div className="relative">
					<div className="absolute top-2 right-1 left-1 h-full rounded-lg border bg-card/80 shadow-sm" />
					<div className="absolute top-1 right-0.5 left-0.5 h-full rounded-lg border bg-card/90 shadow-sm" />
					<div className="relative rounded-lg border bg-card px-6 py-5 shadow-xl">
						<div className="mb-5 flex h-14 items-center justify-between border-foreground/10 border-b-2 pb-4">
							<div className="space-y-1.5">
								<div className="h-4 w-32 rounded bg-muted/60" />
								<div className="h-3 w-20 rounded bg-muted/40" />
							</div>
							<div className="h-12 w-12 rounded-full bg-muted/20" />
						</div>
						<div className="space-y-1">
							{[1, 2, 3, 4].map((i) => (
								<div
									className="flex h-[38px] items-center justify-between rounded-md px-3"
									key={i}
								>
									<div className="flex items-center gap-3">
										<div className="h-4 w-6 rounded bg-muted/60" />
										<div className="h-4 w-48 rounded bg-muted/40" />
									</div>
									<div className="h-6 w-6 rounded-full bg-muted/20" />
								</div>
							))}
						</div>
						<div className="mt-5 flex items-center justify-between border-t pt-4">
							<div className="h-3 w-10 rounded bg-muted/40" />
							<div className="h-2 w-32 rounded-full bg-muted/20" />
						</div>
					</div>
				</div>
			</div>
		),
	},
);
