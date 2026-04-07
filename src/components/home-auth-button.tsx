"use client";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/use-auth";

export function HomeAuthButton() {
	const { user, isLoading: loading } = useAuth();

	// Loading UI
	if (loading) {
		return (
			<Button
				className="h-12 min-w-[180px] px-8 text-lg"
				disabled
				size="lg"
				variant="outline"
			/>
		);
	}

	// Not authenticated
	if (user === null) {
		return (
			<Link href="/sign-up">
				<Button
					className="h-12 min-w-[180px] px-8 text-lg"
					size="lg"
					variant="outline"
				>
					Host an Exam
				</Button>
			</Link>
		);
	}

	// Authenticated
	if (user.role === "student") {
		return (
			<Link href={"/submissions" as Route}>
				<Button
					className="h-12 min-w-[180px] px-8 text-lg"
					size="lg"
					variant="outline"
				>
					View your submissions
				</Button>
			</Link>
		);
	}

	return (
		<Link href="/exams">
			<Button
				className="h-12 min-w-[180px] px-8 text-lg"
				size="lg"
				variant="outline"
			>
				Go to Dashboard
			</Button>
		</Link>
	);
}
