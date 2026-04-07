"use client";

import { api } from "convex/_generated/api";
import type { Doc, Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useAtom } from "jotai";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";
import { getDurationParts, parseDurationParts } from "~/lib/duration";
import { isDurationDialogOpenAtom } from "../shared/atoms";

export function EditDurationDialog() {
	const params = useParams<{ examId: Id<"exams"> }>();
	const exam = useAuthedConvexQuery(api.exams.general.getExamDetails, {
		examId: params.examId,
	});

	if (!exam) return null;

	return <EditDurationDialogContent exam={exam} />;
}

function EditDurationDialogContent({ exam }: { exam: Doc<"exams"> }) {
	const [isOpen, setIsOpen] = useAtom(isDurationDialogOpenAtom);
	const updateExamDuration = useMutation(api.exams.settings.updateExamDuration);

	const initialDuration = getDurationParts(exam.duration);

	const [newHours, setNewHours] = useState(initialDuration.hours);
	const [newMinutes, setNewMinutes] = useState(initialDuration.minutes);
	const [newSeconds, setNewSeconds] = useState(initialDuration.seconds);
	const [isUpdatingDuration, setIsUpdatingDuration] = useState(false);
	const [durationError, setDurationError] = useState("");

	const handleUpdateDuration = async () => {
		setIsUpdatingDuration(true);
		setDurationError("");
		try {
			const duration = parseDurationParts({
				hours: newHours,
				minutes: newMinutes,
				seconds: newSeconds,
			});

			if (duration < 60000) {
				setDurationError("Duration must be at least 1 minute.");
				setIsUpdatingDuration(false);
				return;
			}

			await updateExamDuration({ examId: exam._id, duration });
			setIsOpen(false);
		} catch (error) {
			console.error("Failed to update duration:", error);
			if (error instanceof Error) {
				setDurationError(error.message);
			} else {
				setDurationError("An unexpected error occurred");
			}
		} finally {
			setIsUpdatingDuration(false);
		}
	};

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Duration</DialogTitle>
					<DialogDescription>
						Set the time limit for this exam.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="flex gap-4">
						<div className="flex-1 space-y-1">
							<Label className="text-muted-foreground text-xs" htmlFor="hours">
								Hours
							</Label>
							<Input
								id="hours"
								min="0"
								onChange={(e) => setNewHours(e.target.value)}
								placeholder="1"
								type="number"
								value={newHours}
							/>
						</div>
						<div className="flex-1 space-y-1">
							<Label
								className="text-muted-foreground text-xs"
								htmlFor="minutes"
							>
								Minutes
							</Label>
							<Input
								id="minutes"
								max="59"
								min="0"
								onChange={(e) => setNewMinutes(e.target.value)}
								placeholder="0"
								type="number"
								value={newMinutes}
							/>
						</div>
						<div className="flex-1 space-y-1">
							<Label
								className="text-muted-foreground text-xs"
								htmlFor="seconds"
							>
								Seconds
							</Label>
							<Input
								id="seconds"
								max="59"
								min="0"
								onChange={(e) => setNewSeconds(e.target.value)}
								placeholder="0"
								type="number"
								value={newSeconds}
							/>
						</div>
					</div>

					{durationError && (
						<p className="text-destructive text-sm">{durationError}</p>
					)}
				</div>
				<DialogFooter>
					<Button
						disabled={isUpdatingDuration}
						onClick={() => setIsOpen(false)}
						variant="outline"
					>
						Cancel
					</Button>
					<Button disabled={isUpdatingDuration} onClick={handleUpdateDuration}>
						{isUpdatingDuration && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						Save Changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
