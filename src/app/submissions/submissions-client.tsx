"use client";

import { api } from "convex/_generated/api";
import { format } from "date-fns";
import {
	AlertTriangle,
	CheckCircle,
	Clock,
	FileText,
	LogIn,
	LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { useAuth } from "~/hooks/use-auth";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";
import { useSendVerificationOtp } from "~/hooks/use-send-verification-otp";
import Loading from "../loading";

export default function SubmissionsClient() {
	const router = useRouter();
	const { user, isLoading: isAuthLoading } = useAuth();
	const { sendOtp, isLoading: isSendingOtp } = useSendVerificationOtp();

	const submissions = useAuthedConvexQuery(
		api.exams.submission.studentQueries.getStudentSubmissions,
		!user || user.role !== "student" ? "skip" : {},
	);
	const isSubmissionsLoading = submissions === undefined;

	useEffect(() => {
		if (!isAuthLoading && !user) {
			router.push("/sign-in");
		}
	}, [user, isAuthLoading, router]);

	if (isAuthLoading || (user?.role === "student" && isSubmissionsLoading)) {
		return <Loading />;
	}

	if (!user) {
		return null; // Return null while redirecting
	}

	if (user.role !== "student") {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
				<h1 className="font-bold text-2xl">
					You don't have permission to view this page
				</h1>

				{user.role === "teacher" ? (
					<Button asChild>
						<Link href="/exams">Go to Exams</Link>
					</Button>
				) : (
					<Button asChild>
						<Link href="/">Go Home</Link>
					</Button>
				)}
			</div>
		);
	}

	if (!user.emailVerified) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 p-4 py-10">
				<Card className="w-full max-w-sm">
					<CardContent className="flex flex-col items-center gap-4 py-8 pt-8 text-center">
						<div className="rounded-full bg-warning/10 p-3 text-warning">
							<AlertTriangle className="h-6 w-6" />
						</div>
						<div className="space-y-2 pb-2">
							<CardTitle className="text-xl">Verification Required</CardTitle>
							<CardDescription className="text-balance">
								You need to verify your email address to view your submissions.
							</CardDescription>
						</div>
						<Button
							className="w-full"
							disabled={isSendingOtp}
							onClick={async () => {
								try {
									router.prefetch("/verify-email");
									await sendOtp(user?.email);
									router.push("/verify-email");
								} catch (error) {
									console.error("Failed to send verification code:", error);
								}
							}}
						>
							{isSendingOtp ? "Sending code..." : "Verify Email"}
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!submissions) return null;

	return (
		<main className="container mx-auto space-y-8 px-4 py-10">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-4xl tracking-tight">
						Your Submissions
					</h1>
					<p className="mt-2 text-muted-foreground">
						History of exams you have participated in.
					</p>
				</div>
			</div>

			{submissions.length === 0 ? (
				<Card className="flex flex-col items-center justify-center py-12 text-center">
					<div className="mb-4 rounded-full bg-muted p-3">
						<FileText className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="mb-1 font-semibold text-xl">No submissions yet</h3>
					<p className="mb-4 max-w-sm text-muted-foreground">
						When you complete an exam, it will appear here.
					</p>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{submissions.map((submission) => {
						const isCompleted = submission.status === "completed";

						return (
							<Card className="flex flex-col" key={submission._id}>
								<CardHeader className="pb-3">
									<div className="flex items-start justify-between gap-2">
										<CardTitle className="line-clamp-2 text-xl">
											{submission.examTitle}
										</CardTitle>
										<span
											className={`mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-xs ${
												isCompleted
													? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
													: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
											}`}
										>
											{isCompleted ? (
												<>
													<CheckCircle className="h-3 w-3" />
													Completed
												</>
											) : (
												<>
													<div className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-500" />
													In Progress
												</>
											)}
										</span>
									</div>
								</CardHeader>

								<CardContent className="mt-auto flex-1 border-t pt-4">
									<div className="flex flex-col gap-3">
										{/* Started At */}
										<div className="flex items-center gap-2 text-sm">
											<LogIn className="h-4 w-4 shrink-0 text-muted-foreground" />
											<div>
												<span className="text-muted-foreground">Started: </span>
												<span className="font-medium">
													{format(
														new Date(submission.startedAt),
														"MMM d, yyyy • h:mm a",
													)}
												</span>
											</div>
										</div>

										{/* Finished At */}
										{isCompleted && submission.completedAt && (
											<div className="flex items-center gap-2 text-sm">
												<LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
												<div>
													<span className="text-muted-foreground">
														Finished:{" "}
													</span>
													<span className="font-medium">
														{format(
															new Date(submission.completedAt),
															"MMM d, yyyy • h:mm a",
														)}
													</span>
												</div>
											</div>
										)}

										{/* In-progress time indicator */}
										{!isCompleted && (
											<div className="flex flex-col gap-3">
												<div className="flex items-center gap-2 text-sm">
													<Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
													<span className="text-muted-foreground">
														Not yet finished
													</span>
												</div>
												{submission.allowLateJoining && (
													<Button
														asChild
														className="w-full"
														size="sm"
														variant="outline"
													>
														<Link href={`/exams/take/${submission._id}`}>
															Resume Exam
														</Link>
													</Button>
												)}
											</div>
										)}

										{/* Score */}
										{isCompleted &&
											submission.score !== undefined &&
											submission.examTotalPoints !== undefined && (
												<div className="mt-1 border-t pt-3">
													<p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
														Score
													</p>
													<div className="flex items-baseline gap-1">
														<span className="font-bold text-2xl text-foreground">
															{submission.score}
														</span>
														<span className="font-medium text-muted-foreground">
															/ {submission.examTotalPoints} pts
														</span>
													</div>
												</div>
											)}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</main>
	);
}
