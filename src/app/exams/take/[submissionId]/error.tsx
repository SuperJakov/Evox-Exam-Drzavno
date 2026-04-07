"use client";

import { motion } from "framer-motion";
import { AlertCircle, Home, LogIn, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Only log non-auth errors to avoid noise
		if (
			!error.message?.includes("Not authenticated") &&
			!error.message?.includes("Unauthorized")
		) {
			console.error(error);
		}
	}, [error]);

	const isAuthError =
		error.message?.includes("Not authenticated") ||
		error.message?.includes("Unauthorized");

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans antialiased">
			<div className="mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />

			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="flex max-w-md flex-col items-center gap-8 text-center"
				initial={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.5 }}
			>
				<div className="flex flex-col items-center gap-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-sm ring-1 ring-destructive/20">
						<AlertCircle size={32} />
					</div>
					<div className="space-y-2">
						<h1 className="font-bold text-2xl tracking-tight">
							{isAuthError ? "Access Denied" : "We hit an error"}
						</h1>
						<p className="max-w-[350px] text-muted-foreground text-sm">
							{isAuthError
								? "You do not have permission to access this exam submission. Please make sure you are logged in with the correct account."
								: error.message ||
									"An unexpected error occurred while loading the exam."}
						</p>
					</div>
				</div>

				<div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
					{isAuthError ? (
						<Button asChild={true} className="gap-2" size="lg">
							<Link href="/sign-in">
								<LogIn className="h-4 w-4" />
								Sign in
							</Link>
						</Button>
					) : (
						<Button className="gap-2" onClick={() => reset()} size="lg">
							<RotateCcw className="h-4 w-4" />
							Try again
						</Button>
					)}
					<Button asChild={true} className="gap-2" size="lg" variant="outline">
						<Link href="/exams">
							<Home className="h-4 w-4" />
							Go to Exams
						</Link>
					</Button>
				</div>
			</motion.div>
		</div>
	);
}
