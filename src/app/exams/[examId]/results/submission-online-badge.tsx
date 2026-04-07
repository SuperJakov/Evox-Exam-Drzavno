"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useConvexQuery } from "~/hooks/use-convex-query";

interface SubmissionOnlineBadgeProps {
	submissionId: Id<"submissions">;
	participantName: string;
}

/**
 * Shows a real-time presence status sentence for an in-progress exam submission.
 * Uses the presence component to check if the student is currently active.
 */
export function SubmissionOnlineBadge({
	submissionId,
	participantName,
}: SubmissionOnlineBadgeProps) {
	const isOnline = useConvexQuery(
		api.submission_presence.getSubmissionOnlineStatus,
		{
			submissionId,
		},
	);

	if (isOnline === undefined) return null;

	return (
		<p
			className={`mt-1 flex items-center gap-1.5 text-sm ${
				isOnline ? "text-green-600 dark:text-green-400" : "text-destructive"
			}`}
		>
			<span
				className={`inline-block h-2 w-2 shrink-0 rounded-full ${
					isOnline ? "animate-pulse bg-green-500" : "bg-destructive"
				}`}
			/>
			{isOnline
				? `${participantName} is currently taking the exam and has a stable internet connection.`
				: `${participantName} is not currently active - they may have finished, left, or lost their internet connection.`}
		</p>
	);
}
