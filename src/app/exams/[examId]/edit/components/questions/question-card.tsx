"use client";

import type { Id } from "convex/_generated/dataModel";
import { useSetAtom } from "jotai";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { LatexRenderer } from "~/components/ui/latex-renderer";
import { cn } from "~/lib/utils";
import { questionToDeleteAtom, questionToEditAtom } from "../shared/atoms";

interface QuestionCardProps {
	question: {
		_id: Id<"questions">;
		text: string;
		type: "multiple_choice" | "short_answer" | "true_false";
		points: number;
		options?: string[];
		correctAnswer: string;
		imageUrl?: string | null;
	};
	index: number;
	isPublished?: boolean;
}

export function QuestionCard({
	question,
	index,
	isPublished,
}: QuestionCardProps) {
	const setQuestionToDelete = useSetAtom(questionToDeleteAtom);
	const setQuestionToEdit = useSetAtom(questionToEditAtom);

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
				<div className="min-w-0 flex-1 space-y-1">
					<CardTitle className="wrap-break-word font-medium text-base">
						<div className="inline-block max-w-full overflow-x-auto overflow-y-hidden py-1 align-middle">
							<LatexRenderer content={`${index + 1}. ${question.text}`} />
						</div>
					</CardTitle>
					{question.imageUrl && (
						<div className="mt-2 mb-2">
							{/* biome-ignore lint/performance/noImgElement: No need to optimize with next/image */}
							<img
								alt={`Question ${index + 1}`}
								className="h-48 max-w-full rounded-md object-contain"
								src={question.imageUrl}
							/>
						</div>
					)}
					<CardDescription>
						{question.type === "multiple_choice" && "Multiple Choice"}
						{question.type === "short_answer" && "Short Answer"}
						{question.type === "true_false" && "True/False"}
						{" • "}
						{question.points} points
					</CardDescription>
				</div>
				<div className="flex gap-1">
					<Button
						onClick={() => setQuestionToEdit(question._id)}
						size="icon"
						title={
							isPublished ? "Edit points and correct answer" : "Edit question"
						}
						variant="ghost"
					>
						<Pencil className="h-4 w-4" />
					</Button>
					{!isPublished && (
						<Button
							onClick={() => setQuestionToDelete(question._id)}
							size="icon"
							title="Delete question"
							variant="ghost"
						>
							<Trash2 className="h-4 w-4 text-destructive" />
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{question.type === "multiple_choice" && (
					<ul className="list-inside list-disc text-muted-foreground text-sm">
						{question.options?.map((opt, i) => (
							<li
								className={cn(
									"wrap-break-word min-w-0",
									opt === question.correctAnswer
										? "font-bold text-secondary-foreground"
										: "",
								)}
								key={`${question._id}-option-${
									// biome-ignore lint/suspicious/noArrayIndexKey: Options are static and cannot be reordered
									i
								}`}
							>
								<div className="inline-block max-w-full overflow-x-auto overflow-y-hidden py-1 align-middle">
									<LatexRenderer content={opt} />
								</div>
							</li>
						))}
					</ul>
				)}
				{question.type !== "multiple_choice" && (
					<div className="wrap-break-word min-w-0 text-muted-foreground text-sm">
						<span className="text-muted-foreground">Answer:</span>{" "}
						<div className="inline-block max-w-full overflow-x-auto overflow-y-hidden py-1 align-middle font-bold text-secondary-foreground">
							<LatexRenderer content={question.correctAnswer} />
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
