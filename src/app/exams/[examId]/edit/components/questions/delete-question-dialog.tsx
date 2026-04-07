"use client";

import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { questionToDeleteAtom } from "../shared/atoms";

export function DeleteQuestionDialog() {
	const [questionId, setQuestionId] = useAtom(questionToDeleteAtom);
	const deleteQuestion = useMutation(api.exams.questions.deleteQuestion);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleOpenChange = (open: boolean) => {
		if (!open) setQuestionId(null);
	};

	const handleConfirm = async () => {
		if (!questionId) return;
		setIsDeleting(true);
		try {
			await deleteQuestion({ questionId });
			handleOpenChange(false);
		} catch (error) {
			console.error("Failed to delete question:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog onOpenChange={handleOpenChange} open={!!questionId}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you sure?</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will permanently delete the
						question.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						disabled={isDeleting}
						onClick={() => handleOpenChange(false)}
						variant="outline"
					>
						Cancel
					</Button>
					<Button
						disabled={isDeleting}
						onClick={handleConfirm}
						variant="destructive"
					>
						{isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
