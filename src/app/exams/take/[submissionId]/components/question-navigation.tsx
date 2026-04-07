import type { Id } from "convex/_generated/dataModel";
import { Bookmark, CheckCircle2, Circle } from "lucide-react";
import { memo } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

interface QuestionNavigationProps {
	questions: {
		_id: Id<"questions">;
		order: number;
	}[];
	answers: Record<string, string>;
	markedQuestions: Set<string>;
	onNavigate: (index: number) => void;
}

interface QuestionNavigationItemProps {
	index: number;
	isAnswered: boolean;
	isMarked: boolean;
	onNavigate: (index: number) => void;
	disableTooltip?: boolean;
}

export const QuestionNavigationItem = memo(function QuestionNavigationItem({
	index,
	isAnswered,
	isMarked,
	onNavigate,
	disableTooltip = false,
}: QuestionNavigationItemProps) {
	const button = (
		<button
			className={cn(
				"group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-all duration-300",
				"hover:shadow-lg active:scale-95",
				isAnswered
					? "border-primary/50 bg-primary/10 text-primary shadow-lg shadow-primary/10"
					: "border-border/40 bg-card/40 text-muted-foreground hover:border-border/60 hover:bg-card/60",
				isMarked &&
					"ring-1 ring-warning ring-offset-2 ring-offset-background/40",
			)}
			onClick={() => onNavigate(index)}
			type="button"
		>
			<span className="z-10 font-bold text-xs">{index + 1}</span>

			{/* Marking Indicator */}
			{isMarked && (
				<div className="fade-in zoom-in absolute -top-1 -right-1 animate-in duration-300">
					<div className="rounded-full bg-warning p-0.5 shadow-lg shadow-warning/50">
						<Bookmark className="h-1.5 w-1.5 fill-current text-warning-foreground" />
					</div>
				</div>
			)}

			{/* Status Indicator */}
			<div className="absolute bottom-1 flex gap-0.5">
				{isAnswered ? (
					<div className="h-0.5 w-0.5 rounded-full bg-primary" />
				) : (
					<div className="h-0.5 w-0.5 rounded-full bg-muted-foreground/20" />
				)}
			</div>
		</button>
	);

	if (disableTooltip) {
		return button;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{button}</TooltipTrigger>
			<TooltipContent side="left" sideOffset={15}>
				<div className="flex flex-col gap-1.5 p-1">
					<div className="flex items-center gap-2 border-border/10 border-b pb-1.5">
						<span className="font-bold">Question {index + 1}</span>
					</div>
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2 text-[10px]">
							{isAnswered ? (
								<>
									<CheckCircle2 className="h-3 w-3" />
									<span className="font-medium tracking-tight">COMPLETED</span>
								</>
							) : (
								<>
									<Circle className="h-3 w-3" />
									<span className="font-medium tracking-tight">PENDING</span>
								</>
							)}
						</div>
						{isMarked && (
							<div className="flex items-center gap-2 text-[10px]">
								<Bookmark className="h-3 w-3 fill-warning text-warning" />
								<span className="font-bold text-warning tracking-tight">
									FOR REVIEW
								</span>
							</div>
						)}
					</div>
				</div>
			</TooltipContent>
		</Tooltip>
	);
});

export const QuestionGrid = ({
	questions,
	answers,
	markedQuestions,
	onNavigate,
	className,
	disableTooltips = false,
	centered = false,
}: {
	questions: { _id: Id<"questions"> }[];
	answers: Record<string, string>;
	markedQuestions: Set<string>;
	onNavigate: (index: number) => void;
	className?: string;
	disableTooltips?: boolean;
	centered?: boolean;
}) => {
	return (
		<div
			className={cn(
				centered
					? "flex flex-wrap justify-center gap-2"
					: "grid grid-cols-4 gap-2",
				className,
			)}
		>
			{questions.map((q, i) => (
				<QuestionNavigationItem
					disableTooltip={disableTooltips}
					index={i}
					isAnswered={!!answers[q._id]}
					isMarked={markedQuestions.has(q._id)}
					key={q._id}
					onNavigate={onNavigate}
				/>
			))}
		</div>
	);
};

export const QuestionProgress = ({ progress }: { progress: number }) => {
	return (
		<div className="relative flex h-16 w-16 items-center justify-center">
			<svg aria-hidden="true" className="h-full w-full -rotate-90 transform">
				<circle
					className="text-muted-foreground/20"
					cx="32"
					cy="32"
					fill="transparent"
					r="28"
					stroke="currentColor"
					strokeWidth="4"
				/>
				<circle
					className="text-primary transition-all duration-500 ease-out"
					cx="32"
					cy="32"
					fill="transparent"
					r="28"
					stroke="currentColor"
					strokeDasharray={175.9}
					strokeDashoffset={175.9 - (175.9 * progress) / 100}
					strokeLinecap="round"
					strokeWidth="4"
				/>
			</svg>
			<span className="absolute font-bold text-foreground text-xs">
				{Math.round(progress)}%
			</span>
		</div>
	);
};

export function QuestionNavigation({
	questions,
	answers,
	markedQuestions,
	onNavigate,
}: QuestionNavigationProps) {
	if (questions.length === 0) {
		return null;
	}

	const answeredCount = questions.filter((q) => !!answers[q._id]).length;
	const progress = (answeredCount / questions.length) * 100;

	return (
		<div className="pointer-events-none fixed top-[140px] right-12 bottom-[140px] hidden flex-col justify-center xl:flex">
			<TooltipProvider>
				<div className="pointer-events-auto relative flex max-h-full flex-col gap-4 rounded-[2rem] border border-border/40 bg-background/40 p-4 shadow-2xl ring-1 ring-border/10 backdrop-blur-xl">
					{/* Progress Header */}
					<div className="flex flex-col items-center gap-1 border-border/10 border-b pb-4">
						<span className="font-bold text-[10px] text-muted-foreground/60 uppercase tracking-widest">
							Progress
						</span>
						<QuestionProgress progress={progress} />
					</div>

					{/* Question Grid */}
					<div className="scrollbar-thin max-h-full overflow-y-auto pr-2">
						<QuestionGrid
							answers={answers}
							className="px-2 py-4"
							markedQuestions={markedQuestions}
							onNavigate={onNavigate}
							questions={questions}
						/>
					</div>

					{/* Bottom Footer Info */}
					<div className="flex flex-col items-center border-border/10 border-t pt-4 font-medium text-[9px] text-muted-foreground/40 tracking-tighter">
						<span>CLICK TO JUMP</span>
					</div>
				</div>
			</TooltipProvider>
		</div>
	);
}
