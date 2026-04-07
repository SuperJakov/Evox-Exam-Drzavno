"use client";

import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { submissionToDeleteAtom } from "../shared/atoms";

export function DeleteSubmissionDialog() {
	const [submissionToDelete, setSubmissionToDelete] = useAtom(
		submissionToDeleteAtom,
	);
	const deleteSubmission = useMutation(
		api.exams.submission.host.deleteSubmission,
	);
	const [isDeleting, setIsDeleting] = useState(false);

	// Reset the atom on unmount to prevent reopening dialog unintentionally
	useEffect(() => {
		return () => {
			setSubmissionToDelete(null);
		};
	}, [setSubmissionToDelete]);

	const handleOpenChange = (open: boolean) => {
		if (isDeleting) return;
		if (!open) setSubmissionToDelete(null);
	};

	const handleConfirm = async () => {
		if (!submissionToDelete) return;
		setIsDeleting(true);
		try {
			await deleteSubmission({ submissionId: submissionToDelete.id });
			toast.success("Submission deleted successfully");
			setSubmissionToDelete(null);
		} catch (error) {
			console.error("Failed to delete submission:", error);
			toast.error("Failed to delete submission");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Dialog onOpenChange={handleOpenChange} open={!!submissionToDelete}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you sure?</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will permanently delete the
						submission for{" "}
						<span className="font-semibold text-foreground">
							{submissionToDelete?.participantName}
						</span>{" "}
						and all its associated answers.
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
