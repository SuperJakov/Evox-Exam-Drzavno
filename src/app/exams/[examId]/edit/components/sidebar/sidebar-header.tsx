"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import Fuse from "fuse.js";
import { ArrowLeft, Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { Skeleton } from "~/components/ui/skeleton";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";
import CreateExamDialog from "../../../../components/create-exam-dialog";

export function SidebarHeader() {
	const params = useParams<{ examId: Id<"exams"> }>();
	const exam = useAuthedConvexQuery(api.exams.general.getExamDetails, {
		examId: params.examId,
	});

	return (
		<div className="flex flex-col gap-3">
			<Link
				className="flex items-center gap-2 font-medium text-primary text-sm transition-colors hover:text-primary/80"
				href="/exams"
			>
				<ArrowLeft className="h-4 w-4" />
				Back to all exams
			</Link>
			<div className="mt-2 flex flex-col gap-1.5">
				{exam?.title ? (
					<div className="flex items-start justify-between gap-2">
						<h1
							className="line-clamp-2 flex h-full flex-1 items-center font-bold text-xl leading-tight tracking-tight"
							title={exam.title}
						>
							{exam.title}
						</h1>
						<ExamSwitcher currentExamId={params.examId} />
					</div>
				) : (
					<div className="flex items-start justify-between gap-2">
						<Skeleton className="h-7 flex-1" />
						<Skeleton className="h-8 w-8 shrink-0 rounded-md" />
					</div>
				)}
			</div>
		</div>
	);
}

function ExamSwitcher({ currentExamId }: { currentExamId: Id<"exams"> }) {
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const myExams = useAuthedConvexQuery(api.exams.general.getMyExams);
	const router = useRouter();

	// Optimised by React Compiler on build time
	const filterExams = () => {
		if (!myExams) return [];
		if (!searchQuery) return myExams;

		const fuse = new Fuse(myExams, {
			keys: ["title"],
			threshold: 0.3,
			distance: 100,
		});

		const results = fuse.search(searchQuery);
		return results.map((result) => result.item);
	};

	const filteredExams = filterExams();

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<Button
					className="h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:text-foreground"
					size="icon"
					variant="ghost"
				>
					<ChevronsUpDown className="h-4 w-4" />
					<span className="sr-only">Switch exam</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="flex max-h-[calc(100dvh-4rem)] w-[calc(100vw-2rem)] flex-col gap-2 p-2 sm:max-h-[80vh] sm:w-[400px] md:max-h-[400px] md:w-[320px]"
			>
				<div className="relative shrink-0">
					<Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground md:top-2.5" />
					<Input
						className="h-10 border-none bg-muted/50 pl-9 text-base focus-visible:ring-0 focus-visible:ring-offset-0 md:h-9 md:text-sm"
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Find exam..."
						value={searchQuery}
					/>
				</div>
				<div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
					<div className="flex flex-col gap-1">
						{filteredExams?.length === 0 ? (
							<p className="py-4 text-center text-muted-foreground text-sm">
								No exams found.
							</p>
						) : (
							filteredExams?.map((exam) => (
								<Button
									className="h-10 w-full shrink-0 justify-start px-3 font-normal md:h-9"
									key={exam._id}
									onClick={() => {
										setOpen(false);
										router.push(`/exams/${exam._id}/edit`);
									}}
									variant="ghost"
								>
									<span className="flex-1 truncate text-left">
										{exam.title}
									</span>
									{exam._id === currentExamId && (
										<Check className="ml-2 h-4 w-4 shrink-0 text-primary" />
									)}
								</Button>
							))
						)}
					</div>
				</div>

				<div className="-mx-2 h-px shrink-0 bg-border" />

				<CreateExamDialog>
					<Button
						className="h-10 w-full shrink-0 justify-start px-3 font-normal md:h-9"
						variant="ghost"
					>
						<Plus className="mr-2 h-4 w-4" />
						Create New Exam
					</Button>
				</CreateExamDialog>
			</PopoverContent>
		</Popover>
	);
}
