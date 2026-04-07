import type { Id } from "convex/_generated/dataModel";
import { Bookmark, LayoutGrid } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";
import { ExamTimer, ExamTimerSkeleton } from "./exam-timer";
import { QuestionGrid, QuestionProgress } from "./question-navigation";

interface ExamHeaderProps {
	title?: string;
	questions?: { _id: Id<"questions">; order: number }[];
	answers?: Record<string, string>;
	markedQuestions?: Set<string>;
	onNavigate?: (index: number) => void;
	totalPoints?: number;
	duration?: number;
	isCompleted?: boolean;
	startedAt?: number;
}

export function ExamHeader({
	title,
	questions,
	answers = {},
	markedQuestions = new Set(),
	onNavigate,
	duration,
	isCompleted,
	startedAt,
}: ExamHeaderProps) {
	const questionCount = questions?.length || 0;
	const answeredCount = questions?.filter((q) => !!answers[q._id]).length || 0;
	const markedCount = markedQuestions.size;
	const progress =
		questionCount > 0 ? (answeredCount / questionCount) * 100 : 0;
	const [sheetOpen, setSheetOpen] = useState(false);

	return (
		<header className="sticky top-0 z-10 flex w-full items-center justify-between border-b bg-background/80 px-3 py-3 backdrop-blur-md supports-backdrop-filter:bg-background/60 md:px-8">
			<div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
				{/* Mobile Navigation Trigger */}
				<div className="xl:hidden">
					<Sheet onOpenChange={setSheetOpen} open={sheetOpen}>
						<SheetTrigger asChild>
							<Button
								className="relative h-9 w-9 rounded-full"
								size="icon"
								variant="outline"
							>
								<LayoutGrid className="h-4 w-4" />
								{markedCount > 0 && (
									<span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-warning px-1 font-bold text-[10px] text-warning-foreground shadow-sm">
										{markedCount}
									</span>
								)}
							</Button>
						</SheetTrigger>
						<SheetContent side="left">
							<SheetHeader className="border-b pb-4">
								<SheetTitle className="flex items-center gap-2">
									<LayoutGrid className="h-5 w-5 text-primary" />
									Question Map
								</SheetTitle>
								<SheetDescription>
									Quickly jump to any question or review marked items.
								</SheetDescription>
							</SheetHeader>
							<div className="mt-6 flex flex-col items-center gap-6">
								<div className="flex flex-col items-center gap-4 min-[400px]:flex-row min-[400px]:gap-8">
									<div className="flex flex-col items-center gap-1">
										<span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
											Overall Progress
										</span>
										<QuestionProgress progress={progress} />
									</div>
									<div className="flex items-center gap-4 min-[400px]:flex-col min-[400px]:items-start min-[400px]:gap-2">
										<div className="flex items-center gap-2 text-xs">
											<div className="h-2 w-2 rounded-full bg-primary" />
											<span className="font-semibold">{answeredCount}</span>
											<span className="text-muted-foreground">Answered</span>
										</div>
										<div className="flex items-center gap-2 text-xs">
											<div className="h-2 w-2 rounded-full bg-warning" />
											<span className="font-semibold">{markedCount}</span>
											<span className="text-muted-foreground">Marked</span>
										</div>
									</div>
								</div>

								<div className="scrollbar-thin w-full overflow-y-auto pt-4 pb-8">
									<QuestionGrid
										answers={answers}
										centered
										disableTooltips
										markedQuestions={markedQuestions}
										onNavigate={(i) => {
											setSheetOpen(false);
											onNavigate?.(i);
										}}
										questions={questions || []}
									/>
								</div>
							</div>
						</SheetContent>
					</Sheet>
				</div>

				<div className="min-w-0 flex-1 overflow-hidden">
					{title ? (
						<>
							<h1 className="truncate font-bold text-base md:text-xl">
								{title}
							</h1>
							<div className="hidden items-center gap-2 text-muted-foreground text-xs sm:flex md:text-sm">
								<span className="font-medium text-foreground">
									{answeredCount}/{questionCount}
								</span>
								<span>Answered</span>
								{markedCount > 0 && (
									<>
										<span>•</span>
										<span className="flex items-center gap-1 font-bold text-warning">
											<Bookmark className="h-3 w-3 fill-current" />
											{markedCount} Marked
										</span>
									</>
								)}
							</div>
						</>
					) : (
						<div className="space-y-2">
							<div className="h-6 w-48 animate-pulse rounded bg-muted" />
							<div className="h-4 w-32 animate-pulse rounded bg-muted/60" />
						</div>
					)}
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-2 md:gap-4">
				<ThemeToggle />
				{duration !== undefined &&
				startedAt !== undefined &&
				isCompleted !== undefined ? (
					<ExamTimer
						duration={duration}
						isCompleted={isCompleted}
						startedAt={startedAt}
					/>
				) : (
					<ExamTimerSkeleton />
				)}
			</div>
		</header>
	);
}
