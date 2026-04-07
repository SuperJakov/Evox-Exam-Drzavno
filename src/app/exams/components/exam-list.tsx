"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useStore } from "jotai";
import { Clock, Copy, Loader2, MoreVertical, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Loading from "~/app/loading";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";
import { formatDuration } from "~/lib/duration";
import { activeTabAtomFamily } from "../[examId]/edit/components/shared/atoms";
import CreateExamDialog from "./create-exam-dialog";

export function ExamList() {
	const myExams = useAuthedConvexQuery(api.exams.general.getMyExams, {});
	const duplicateExam = useMutation(api.exams.general.duplicateExam);
	const deleteExam = useMutation(api.exams.general.deleteExam);
	const router = useRouter();
	const [duplicatingId, setDuplicatingId] = useState<Id<"exams"> | null>(null);
	const [deletingId, setDeletingId] = useState<Id<"exams"> | null>(null);
	const [examToDelete, setExamToDelete] = useState<Id<"exams"> | null>(null);
	const store = useStore();

	if (!myExams) {
		return (
			<div className="relative min-h-[300px]">
				<Loading />
			</div>
		);
	}

	const handleDuplicate = async (examId: Id<"exams">) => {
		setDuplicatingId(examId);
		try {
			const newExamId = await duplicateExam({ examId });
			toast.success("Exam duplicated");
			router.push(`/exams/${newExamId}/edit`);
		} catch (error) {
			console.error("Failed to duplicate exam:", error);
			toast.error("Failed to duplicate exam");
		} finally {
			setDuplicatingId(null);
		}
	};

	const handleDelete = async (examId: Id<"exams">) => {
		setDeletingId(examId);
		try {
			await deleteExam({ examId });
			toast.success("Exam deleted");
		} catch (error) {
			console.error("Failed to delete exam:", error);
			toast.error("Failed to delete exam");
		} finally {
			setDeletingId(null);
			setExamToDelete(null);
		}
	};

	return (
		<div className="space-y-4">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{/* Create New Exam Card */}
				<CreateExamDialog>
					<Card className="group flex h-full cursor-pointer flex-col items-center justify-center border-2 border-muted-foreground/25 border-dashed bg-muted/30 transition-all hover:border-primary/50 hover:bg-muted/50">
						<CardContent className="flex flex-col items-center justify-center gap-3 py-8">
							<h3 className="font-semibold text-lg">Create New Exam</h3>

							<Plus className="h-8 w-8 rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20" />
						</CardContent>
					</Card>
				</CreateExamDialog>

				{myExams?.map((exam) => (
					<Card
						className="flex h-full flex-col transition-colors hover:bg-muted/50"
						key={exam._id}
					>
						<CardHeader>
							<div className="flex min-w-0 items-start justify-between gap-2">
								<CardTitle className="min-w-0 truncate">{exam.title}</CardTitle>
								{exam.isPublished ? (
									<span className="rounded-full bg-primary/15 px-2 py-1 font-medium text-primary text-xs">
										Published
									</span>
								) : (
									<span className="rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground text-xs">
										Draft
									</span>
								)}
							</div>
						</CardHeader>
						<CardContent className="flex flex-1 flex-col">
							<div className="mt-auto mb-4 flex items-center gap-4 text-muted-foreground text-sm">
								<div className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 font-mono">
									<Clock className="h-4 w-4" />
									{formatDuration(exam.duration)}
								</div>
								<div className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 font-mono">
									Code: {exam.accessCode || "Inactive"}
								</div>
								<div className="flex items-center gap-1 rounded bg-muted px-2 py-0.5 font-mono">
									{exam.totalPoints || 0} pts
								</div>
							</div>
							<div className="mt-auto flex gap-2">
								<Button asChild className="flex-1" variant="outline">
									<Link href={`/exams/${exam._id}/edit`}>Edit</Link>
								</Button>
								<Button
									className="flex-1"
									onClick={() => {
										store.set(activeTabAtomFamily(exam._id), "results");
										router.push(`/exams/${exam._id}/edit`);
									}}
								>
									Results
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button size="icon" variant="outline">
											<MoreVertical className="h-4 w-4" />
											<span className="sr-only">More options</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											disabled={duplicatingId !== null || deletingId !== null}
											onClick={() => handleDuplicate(exam._id)}
										>
											{duplicatingId === exam._id ? (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<Copy className="mr-2 h-4 w-4" />
											)}
											Duplicate
										</DropdownMenuItem>
										<DropdownMenuItem
											disabled={duplicatingId !== null || deletingId !== null}
											onClick={() => setExamToDelete(exam._id)}
											variant="destructive"
										>
											{deletingId === exam._id ? (
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											) : (
												<Trash2 className="mr-2 h-4 w-4" />
											)}
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Dialog
				onOpenChange={(open) => !open && setExamToDelete(null)}
				open={examToDelete !== null}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Are you absolutely sure?</DialogTitle>
						<DialogDescription>
							This action cannot be undone. This will permanently delete the
							exam and all associated questions, submissions, and results.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							disabled={deletingId !== null}
							onClick={() => setExamToDelete(null)}
							variant="outline"
						>
							Cancel
						</Button>
						<Button
							disabled={deletingId !== null}
							onClick={() => examToDelete && handleDelete(examToDelete)}
							variant="destructive"
						>
							{deletingId !== null ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : null}
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
