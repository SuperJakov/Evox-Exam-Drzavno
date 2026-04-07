import type { Id } from "convex/_generated/dataModel";
import { Bookmark } from "lucide-react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { LatexRenderer } from "~/components/ui/latex-renderer";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

interface QuestionItemProps {
	question: {
		_id: Id<"questions">;
		text: string;
		points: number;
		type: "multiple_choice" | "true_false" | "short_answer";
		options?: string[];
		imageUrl?: string | null;
	};
	index: number;
	answer: string | undefined;
	isMarked: boolean;
	onAnswerChange: (questionId: Id<"questions">, value: string) => void;
	onToggleMark: (questionId: Id<"questions">) => void;
}

export function QuestionItem({
	question,
	index,
	answer,
	isMarked,
	onAnswerChange,
	onToggleMark,
}: QuestionItemProps) {
	return (
		<Card
			className={cn(
				"transition-all duration-300",
				isMarked && "border-warning/50 shadow-lg shadow-warning/10",
			)}
			id={`question-${index}`}
		>
			<CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
				<div className="min-w-0 flex-1 space-y-2">
					<CardTitle className="wrap-break-word text-lg leading-tight">
						<span className="mr-2 text-muted-foreground">{index + 1}.</span>
						<div className="inline-block max-w-full overflow-x-auto overflow-y-hidden py-1 align-middle">
							<LatexRenderer content={question.text} />
						</div>
					</CardTitle>
					{question.imageUrl && (
						<div className="relative mt-2 mb-2 h-64 w-full">
							<Image
								alt={`Question ${index + 1}`}
								className="rounded-md object-contain"
								fill
								src={question.imageUrl}
								unoptimized
							/>
						</div>
					)}
				</div>
				<div className="flex shrink-0 items-center gap-2 pt-0.5">
					<p className="whitespace-nowrap font-medium text-muted-foreground text-xs">
						{question.points} pts
					</p>
					<Button
						className={cn(
							"h-8 w-8 transition-colors",
							isMarked && "text-warning hover:text-warning/80",
						)}
						onClick={() => onToggleMark(question._id)}
						size="icon"
						variant="ghost"
					>
						<Bookmark className={cn("h-5 w-5", isMarked && "fill-current")} />
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{question.type === "multiple_choice" && (
					<RadioGroup
						onValueChange={(val) => onAnswerChange(question._id, val)}
						value={answer || ""}
					>
						{question.options?.map((opt, i) => (
							<label
								className={cn(
									"flex cursor-pointer items-center space-x-3 rounded-xl border p-4 transition-all hover:bg-accent/70",
									answer === opt
										? "border-primary/50 bg-primary/10 text-primary shadow-lg shadow-primary/10"
										: "border-border/40 bg-card/40 text-muted-foreground hover:border-border/60 hover:bg-card/60",
								)}
								htmlFor={`${question._id}-${i}`}
								key={opt}
							>
								<RadioGroupItem id={`${question._id}-${i}`} value={opt} />
								<div className="wrap-break-word min-w-0 grow font-medium">
									<div className="inline-block max-w-full overflow-x-auto overflow-y-hidden py-1 align-middle">
										<LatexRenderer content={opt} />
									</div>
								</div>
							</label>
						))}
					</RadioGroup>
				)}

				{question.type === "true_false" && (
					<RadioGroup
						onValueChange={(val) => onAnswerChange(question._id, val)}
						value={answer || ""}
					>
						{["true", "false"].map((val) => (
							<label
								className={cn(
									"flex cursor-pointer items-center space-x-3 rounded-xl border p-4 transition-all hover:bg-accent/70",
									answer === val
										? "border-primary bg-accent/50"
										: "border-muted/50 bg-card",
								)}
								htmlFor={`${question._id}-${val}`}
								key={val}
							>
								<RadioGroupItem id={`${question._id}-${val}`} value={val} />
								<span className="grow font-medium capitalize">{val}</span>
							</label>
						))}
					</RadioGroup>
				)}

				{question.type === "short_answer" && (
					<Textarea
						onChange={(e) => onAnswerChange(question._id, e.target.value)}
						placeholder="Type your answer here..."
						value={answer || ""}
					/>
				)}
			</CardContent>
		</Card>
	);
}
