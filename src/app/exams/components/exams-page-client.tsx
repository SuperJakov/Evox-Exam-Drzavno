"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/use-auth";
import { ExamList } from "./exam-list";

export default function ExamPageClient() {
	const { user, isLoading } = useAuth();

	// Usually, we show a loading state while auth is loading
	// But since user is already authenticated on the server
	// We can just subscribe to changes and not do anything when loading auth
	if (!isLoading && !user) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
				<h1 className="font-bold text-2xl">Please sign in to access exams</h1>
				<Button asChild>
					<Link href="/sign-in">Sign In</Link>
				</Button>
			</div>
		);
	}

	if (!isLoading && user && user.role !== "teacher") {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
				<h1 className="font-bold text-2xl">
					You don't have permission to view this page
				</h1>

				{user.role === "student" ? (
					<Button asChild>
						<Link href="/submissions">Go to Submissions</Link>
					</Button>
				) : (
					<Button asChild>
						<Link href="/">Go Home</Link>
					</Button>
				)}
			</div>
		);
	}

	return (
		<div className="container mx-auto space-y-8 px-4 py-10">
			<div className="flex items-center justify-between">
				<h1 className="font-bold text-4xl tracking-tight">Exams</h1>
			</div>

			<ExamList />
		</div>
	);
}
