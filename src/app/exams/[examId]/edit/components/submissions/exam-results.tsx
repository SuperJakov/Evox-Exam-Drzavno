"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { format } from "date-fns";
import { useSetAtom } from "jotai";
import { AlertTriangle, Eye, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "~/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import {
	useAuthedConvexPaginatedQuery,
	useAuthedConvexQuery,
} from "~/hooks/use-authed-convex-query";
import { submissionToDeleteAtom } from "../shared/atoms";
import { DeleteSubmissionDialog } from "./delete-submission-dialog";

const ITEMS_PER_PAGE = 10;

export function ExamResults() {
	const params = useParams();
	const examId = params.examId as Id<"exams">;

	const [page, setPage] = useState<number>(1);
	const [selectedGroupingId, setSelectedGroupingId] = useState<string>("all");
	const setSubmissionToDelete = useSetAtom(submissionToDeleteAtom);

	const {
		results: submissions,
		status,
		loadMore,
	} = useAuthedConvexPaginatedQuery(
		api.exams.submission.host.getExamSubmissions,
		{
			examId,
			groupingId:
				selectedGroupingId === "all"
					? undefined
					: selectedGroupingId === "ungrouped"
						? "ungrouped"
						: (selectedGroupingId as Id<"examGroupings">),
		},
		{ initialNumItems: ITEMS_PER_PAGE },
	);

	const exam = useAuthedConvexQuery(api.exams.general.getExamDetails, {
		examId,
	});

	const groupingsQuery = useAuthedConvexQuery(
		api.exams.submission.host.getExamGroupings,
		{
			examId,
		},
	);
	const groupings = groupingsQuery || [];

	const hasUngrouped =
		useAuthedConvexQuery(api.exams.submission.host.hasUngroupedSubmissions, {
			examId,
		}) ?? false;

	const totalItems = submissions.length;

	// Preload next page automatically
	useEffect(() => {
		const itemsNeededForNextPage = (page + 1) * ITEMS_PER_PAGE;
		if (totalItems < itemsNeededForNextPage && status === "CanLoadMore") {
			loadMore(ITEMS_PER_PAGE);
		}
	}, [page, totalItems, status, loadMore]);

	const totalKnownPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	// Reset to last valid page if real-time updates shrink the data
	useEffect(() => {
		if (status === "Exhausted" && page > Math.max(1, totalKnownPages)) {
			setPage(Math.max(1, totalKnownPages));
		}
	}, [status, page, totalKnownPages]);

	if (status === "LoadingFirstPage" || !exam) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const currentData = submissions.slice(
		(page - 1) * ITEMS_PER_PAGE,
		page * ITEMS_PER_PAGE,
	);

	const hasMorePages =
		status === "CanLoadMore" ||
		status === "LoadingMore" ||
		(status === "Exhausted" && totalKnownPages > page);

	const totalPagesToDisplay =
		status === "Exhausted" ? totalKnownPages : totalKnownPages + 1;

	const generatePagination = (currentPage: number, totalPages: number) => {
		const total = Math.max(1, totalPages);

		// If there are 7 or fewer pages, render all of them without ellipses
		if (total <= 7) {
			return Array.from({ length: total }, (_, i) => i + 1);
		}

		// If the current page is close to the start, show the first 4 pages,
		// an ellipsis, and the last 2 pages
		if (currentPage <= 3) {
			return [1, 2, 3, 4, "ellipsis-end", total - 1, total];
		}

		// If the current page is close to the end, show the first 2 pages,
		// an ellipsis, and the last 4 pages
		if (currentPage >= total - 2) {
			return [1, 2, "ellipsis-start", total - 3, total - 2, total - 1, total];
		}

		// If the current page is somewhere in the middle, flank it with its
		// adjacent neighbors, bounded by an ellipsis before the last page
		// and after the first page
		return [
			1,
			"ellipsis-start",
			currentPage - 1,
			currentPage,
			currentPage + 1,
			"ellipsis-end",
			total,
		];
	};

	const pages = generatePagination(page, totalPagesToDisplay);

	const handlePageChange = (newPage: number) => {
		if (newPage < 1) return;

		const needsMoreItems = newPage * ITEMS_PER_PAGE > totalItems;
		if (needsMoreItems && status === "CanLoadMore") {
			const itemsToFetch = newPage * ITEMS_PER_PAGE - totalItems;
			loadMore(itemsToFetch);
		}

		setPage(newPage);
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<CardTitle>Submissions</CardTitle>
						<CardDescription>
							List of all students who have taken this exam.
						</CardDescription>
					</div>
					{groupings.length > 0 && (
						<Select
							onValueChange={(val) => {
								setSelectedGroupingId(val);
								setPage(1);
							}}
							value={selectedGroupingId}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by group" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Groups</SelectItem>
								{hasUngrouped && (
									<SelectItem value="ungrouped">Ungrouped</SelectItem>
								)}
								{groupings.map((group) => (
									<SelectItem key={group._id} value={group._id}>
										{group.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Participant</TableHead>
							<TableHead>Group</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Score</TableHead>
							<TableHead>Started At</TableHead>
							<TableHead>Completed At</TableHead>
							<TableHead>Alerts</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentData.length === 0 ? (
							<TableRow>
								<TableCell
									className="py-8 text-center text-muted-foreground"
									colSpan={8}
								>
									{status === "LoadingMore" ? (
										<Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
									) : (
										"No submissions yet."
									)}
								</TableCell>
							</TableRow>
						) : (
							currentData.map((submission) => (
								<TableRow key={submission._id}>
									<TableCell className="font-medium">
										{submission.participantName}
									</TableCell>
									<TableCell>
										{submission.groupingName || (
											<span className="text-muted-foreground text-xs italic">
												None
											</span>
										)}
									</TableCell>
									<TableCell>
										<span
											className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
												submission.status === "completed"
													? "bg-primary/15 text-primary"
													: "bg-muted text-muted-foreground"
											}`}
										>
											{submission.status === "completed"
												? "Completed"
												: "In Progress"}
										</span>
									</TableCell>
									<TableCell>
										{submission.score !== undefined ? (
											<span className="font-bold">
												{submission.score} / {exam.totalPoints || 0}
											</span>
										) : (
											"-"
										)}
									</TableCell>
									<TableCell>
										{format(submission.startedAt, "MMM d, yyyy HH:mm:ss")}
									</TableCell>
									<TableCell>
										{submission.completedAt
											? format(submission.completedAt, "MMM d, yyyy HH:mm:ss")
											: "-"}
									</TableCell>
									<TableCell>
										{submission.cheatingCount > 0 ? (
											<span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 font-medium text-destructive text-xs">
												<AlertTriangle className="h-3 w-3" />
												{submission.cheatingCount}
											</span>
										) : (
											<span className="text-muted-foreground text-xs italic">
												Clean
											</span>
										)}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button asChild size="sm" variant="ghost">
												<Link
													href={`/exams/${examId}/results/${submission._id}`}
													scroll={true}
												>
													<Eye className="mr-2 h-4 w-4" />
													View
												</Link>
											</Button>
											<Button
												aria-label="Delete submission"
												className="text-destructive hover:bg-destructive/10 hover:text-destructive"
												disabled={submission.status === "in_progress"}
												onClick={() =>
													setSubmissionToDelete({
														id: submission._id,
														participantName: submission.participantName,
													})
												}
												size="sm"
												title={
													submission.status === "in_progress"
														? "Cannot delete a submission that is currently in progress"
														: "Delete submission"
												}
												variant="ghost"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
				<div className="mt-4 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
					{totalItems > 0 && (
						<div className="text-center text-muted-foreground text-sm sm:text-left">
							Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, totalItems)}-
							{Math.min(page * ITEMS_PER_PAGE, totalItems)} of{" "}
							{status === "Exhausted" ? totalItems : `${totalItems}+`}{" "}
							submissions
						</div>
					)}

					{totalPagesToDisplay > 1 && (
						<Pagination className="mx-0 w-auto">
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										className={
											page === 1 ? "pointer-events-none opacity-50" : ""
										}
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (page > 1) handlePageChange(page - 1);
										}}
									/>
								</PaginationItem>

								{pages.map((p) => {
									if (typeof p === "string") {
										return (
											<PaginationItem key={p}>
												<PaginationEllipsis />
											</PaginationItem>
										);
									}

									return (
										<PaginationItem key={p}>
											<PaginationLink
												href="#"
												isActive={page === p}
												onClick={(e) => {
													e.preventDefault();
													handlePageChange(p);
												}}
											>
												{p}
											</PaginationLink>
										</PaginationItem>
									);
								})}

								<PaginationItem>
									<PaginationNext
										className={
											!hasMorePages ? "pointer-events-none opacity-50" : ""
										}
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (hasMorePages) handlePageChange(page + 1);
										}}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					)}
				</div>
			</CardContent>
			<DeleteSubmissionDialog />
		</Card>
	);
}
