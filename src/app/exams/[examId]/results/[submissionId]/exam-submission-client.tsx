"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { format } from "date-fns";
import { useSetAtom } from "jotai";
import {
	AlertTriangle,
	ArrowLeft,
	CheckCircle,
	ExternalLink,
	LogIn,
	Minimize2,
	Monitor,
	Shuffle,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LoadingState } from "~/components/loading-state";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { LatexRenderer } from "~/components/ui/latex-renderer";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { useAuth } from "~/hooks/use-auth";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";
import { activeTabAtomFamily } from "../../edit/components/shared/atoms";
import { SubmissionOnlineBadge } from "../submission-online-badge";

// Mulberry32 PRNG - same as backend
function mulberry32(seed: number): () => number {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// Deterministic Fisher-Yates shuffle using seeded PRNG
function seededShuffle<T>(array: T[], seed: number): T[] {
	const shuffled = [...array];
	const random = mulberry32(seed);
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j] as T, shuffled[i] as T];
	}
	return shuffled;
}

// Generate shuffled answer indices for a question
function getShuffledAnswerIndices(
	optionsLength: number,
	seed: number,
	questionIndex: number,
): number[] {
	const combinedSeed = seed + questionIndex * 31337;
	const indices = Array.from({ length: optionsLength }, (_, i) => i);
	return seededShuffle(indices, combinedSeed);
}

export default function ExamSubmissionClient() {
	const params = useParams();
	const examId = params.examId as Id<"exams">;
	const setEditTab = useSetAtom(activeTabAtomFamily(examId));
	const { submissionId } = params as { submissionId: Id<"submissions"> };
	const { user, isLoading: authLoading } = useAuth();

	const [viewAsParticipant, setViewAsParticipant] = useState(false);

	const data = useAuthedConvexQuery(
		api.exams.submission.host.getSubmissionForHost,
		{
			submissionId,
		},
	);

	// Ensure page starts at the top when navigating to a specific submission
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	// Compute shuffled questions when viewing as participant
	const displayQuestions = useMemo(() => {
		if (!data) return [];
		const { exam, questions, submission } = data;

		// Capture seed to ensure type narrowing persists in closures
		const seed = submission.shuffleSeed;

		if (!viewAsParticipant || seed === undefined) {
			return questions;
		}

		let processedQuestions = [...questions];

		// If answer shuffling is enabled, we need to shuffle the options FIRST using original indices
		// This matches the backend logic where answers are shuffled before questions are reordered
		if (exam.shuffleAnswers) {
			processedQuestions = processedQuestions.map((q, index) => {
				if (q.type === "multiple_choice" && q.options) {
					const currentOptions = q.options;
					const answerOrder = getShuffledAnswerIndices(
						currentOptions.length,
						seed,
						index,
					);
					return {
						...q,
						options: answerOrder.map((i) => currentOptions[i] as string),
					};
				}
				return q;
			});
		}

		// Apply same shuffling as participant saw
		if (exam.shuffleQuestions) {
			processedQuestions = seededShuffle(processedQuestions, seed);
		}

		return processedQuestions;
	}, [data, viewAsParticipant]);

	if (!data) {
		return <LoadingState />;
	}

	if (!authLoading && user && user.role !== "teacher") {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
				<h1 className="font-bold text-2xl">
					You don't have permission to view this page
				</h1>
				<Button asChild>
					<Link href="/">Go Home</Link>
				</Button>
			</div>
		);
	}

	const { exam, submission, answers, cheatingLogs } = data;

	const questionsShuffled =
		submission.isQuestionsShuffled ?? exam.shuffleQuestions;
	const answersShuffled = submission.isAnswersShuffled ?? exam.shuffleAnswers;

	const qText = questionsShuffled
		? "shuffled questions"
		: "unshuffled questions";
	const aText = answersShuffled ? "shuffled answers" : "unshuffled answers";

	const shuffleInfoText = `This submission had ${qText} and ${aText}.`;

	// Helper to find the user's answer for a question
	const getUserAnswer = (questionId: Id<"questions">) => {
		return answers?.find((a) => a.questionId === questionId);
	};

	const isLive = submission.status === "in_progress";
	const hasShuffling = submission.shuffleSeed !== undefined;
	const allowLateJoining = exam.allowLateJoining ?? false;

	return (
		<div className="container mx-auto max-w-3xl space-y-8 px-4 py-10 pb-32 md:px-6">
			<div className="mb-8">
				<Button
					asChild
					className="mb-4 pl-0 transition-all hover:pl-2"
					variant="ghost"
				>
					<Link
						href={`/exams/${examId}/edit`}
						onClick={() => {
							setEditTab("results");
						}}
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Results
					</Link>
				</Button>
				<div>
					<div className="flex items-center justify-between">
						<h1 className="font-bold text-3xl tracking-tight">{exam.title}</h1>
						{isLive && (
							<div className="group relative flex cursor-help items-center gap-2 rounded-full bg-info/20 px-3 py-1 font-medium text-info text-sm dark:bg-info/30 dark:text-info-foreground">
								<span className="relative flex h-2 w-2">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-75"></span>
									<span className="relative inline-flex h-2 w-2 rounded-full bg-info"></span>
								</span>
								Live View
								<div className="absolute top-full right-0 z-50 mt-2 hidden w-64 rounded-md border bg-popover p-2 text-popover-foreground text-xs shadow-md group-hover:block">
									Exam is not yet submitted. You are viewing live updates of
									user&apos;s submissions.
								</div>
							</div>
						)}
					</div>
					<div className="mt-2 flex items-center gap-4 text-muted-foreground">
						<p>
							Participant:{" "}
							<span className="font-semibold text-foreground">
								{submission.participantName}
							</span>
						</p>
						<span>•</span>
						<p>
							Score:{" "}
							<span className="font-semibold text-foreground">
								{isLive
									? "Pending"
									: `${submission.score ?? 0} / ${exam.totalPoints || 0}`}
							</span>{" "}
							{isLive ? "" : "Points"}
						</p>
						<span>•</span>
						<p>
							Group:{" "}
							<span className="font-semibold text-foreground">
								{data.groupName}
							</span>
						</p>
					</div>
					{isLive && (
						<SubmissionOnlineBadge
							participantName={submission.participantName}
							submissionId={submissionId}
						/>
					)}
				</div>
			</div>

			{cheatingLogs && cheatingLogs.length > 0 && (
				<Card className="border-destructive/50 bg-destructive/5 dark:bg-destructive/10">
					<CardContent className="flex items-center justify-between py-4">
						<div className="flex items-center gap-3">
							<div className="rounded-full bg-destructive/20 p-2 text-destructive">
								<AlertTriangle className="h-5 w-5" />
							</div>
							<div>
								<h3 className="font-semibold text-destructive">
									Session Activity Alerts Detected
								</h3>
								<p className="text-muted-foreground text-sm">
									This student triggered {cheatingLogs.length} suspicious
									activity alerts (tab switching or focus loss) during their
									session.
								</p>
							</div>
						</div>
						<Button
							className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
							onClick={() =>
								document
									.getElementById("tracking-logs")
									?.scrollIntoView({ behavior: "smooth" })
							}
							size="sm"
							variant="outline"
						>
							Review Logs History
						</Button>
					</CardContent>
				</Card>
			)}

			{/* View mode toggle */}
			{hasShuffling && (
				<div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
					<div className="flex items-center gap-3">
						<div
							className={`rounded-full p-2 ${viewAsParticipant ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
						>
							<Shuffle className="h-4 w-4" />
						</div>
						<div>
							<p className="font-medium text-sm">
								{viewAsParticipant ? "Participant's View" : "Original Order"}
							</p>
							<p className="text-muted-foreground text-xs">
								{viewAsParticipant
									? shuffleInfoText
									: "Showing questions in original exam order"}
							</p>
						</div>
					</div>
					<Button
						onClick={() => setViewAsParticipant(!viewAsParticipant)}
						size="sm"
						variant={viewAsParticipant ? "default" : "outline"}
					>
						<Shuffle className="mr-2 h-4 w-4" />
						{viewAsParticipant ? "View Original Order" : "View as Participant"}
					</Button>
				</div>
			)}

			{/* Late joining badge */}
			<div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5">
				<div
					className={`rounded-full p-1.5 ${
						allowLateJoining
							? "bg-primary/20 text-primary"
							: "bg-muted text-muted-foreground"
					}`}
				>
					<LogIn className="h-3.5 w-3.5" />
				</div>
				<p className="text-sm">
					<span className="font-medium">Late Joining:</span>{" "}
					<span className="text-muted-foreground">
						{allowLateJoining
							? "Enabled - this participant was allowed to rejoin the exam after leaving."
							: "Disabled - the participant had to complete the exam in one sitting."}
					</span>
				</p>
			</div>

			<div className="space-y-8">
				{displayQuestions.map((q, index) => {
					const userAnswer = getUserAnswer(q._id);
					const isCorrect =
						userAnswer &&
						userAnswer.answer.toLowerCase().trim() ===
							q.correctAnswer.toLowerCase().trim();
					const userResponse = userAnswer?.answer;

					return (
						<Card
							className={`border-l-4 ${
								isLive
									? "border-l-info"
									: isCorrect
										? "border-l-primary"
										: "border-l-destructive"
							}`}
							key={q._id}
						>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="space-y-2">
										<div className="font-medium text-lg">
											<span className="mr-2 text-muted-foreground">
												{index + 1}.
											</span>
											<div className="inline-block max-w-full overflow-x-auto overflow-y-hidden py-1 align-middle">
												<LatexRenderer content={q.text} />
											</div>
										</div>
										{q.imageUrl && (
											<div className="mt-2 mb-2">
												{/* biome-ignore lint/performance/noImgElement: No need to optimize with next/image */}
												<img
													alt={`Question ${index + 1}`}
													className="h-48 max-w-full rounded-md object-contain"
													src={q.imageUrl}
												/>
											</div>
										)}
									</div>
									<div className="flex items-center gap-2">
										{isLive ? (
											<span className="flex items-center font-medium text-muted-foreground text-sm">
												Not Graded Yet
											</span>
										) : isCorrect ? (
											<span className="flex items-center font-medium text-primary text-sm">
												<CheckCircle className="mr-1 h-4 w-4" />
												Correct {q.points}/{q.points}
											</span>
										) : (
											<span className="flex items-center font-medium text-destructive text-sm">
												<XCircle className="mr-1 h-4 w-4" />
												Incorrect 0/{q.points}
											</span>
										)}
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* User Answer Section */}
								<div className="space-y-2">
									<Label className="text-muted-foreground text-xs uppercase tracking-wider">
										Student Answer
									</Label>

									{q.type === "multiple_choice" && (
										<RadioGroup disabled value={userResponse || ""}>
											{q.options?.map((opt, i) => {
												const isCorrectOption = opt === q.correctAnswer;
												const isSelected = opt === userResponse;

												let className =
													"flex items-center space-x-2 rounded p-2 ";

												if (isLive) {
													if (isSelected)
														className += "bg-info/10 dark:bg-info/20";
												} else {
													if (isCorrectOption) {
														className +=
															"bg-primary/10 dark:bg-primary/20 ring-1 ring-primary/50";
													} else if (isSelected) {
														className +=
															"bg-destructive/10 dark:bg-destructive/20 ring-1 ring-destructive/50";
													}
												}

												return (
													<div className={className} key={opt}>
														<RadioGroupItem id={`${q._id}-${i}`} value={opt} />
														<Label
															className="flex-1 cursor-pointer opacity-100"
															htmlFor={`${q._id}-${i}`}
														>
															<div className="inline-block max-w-full overflow-x-auto overflow-y-hidden py-1 align-middle">
																<LatexRenderer content={opt} />
															</div>
															{!isLive && isCorrectOption && (
																<span className="ml-auto font-medium text-primary text-xs">
																	(Correct)
																</span>
															)}
														</Label>
													</div>
												);
											})}
										</RadioGroup>
									)}

									{q.type === "true_false" && (
										<RadioGroup disabled value={userResponse || ""}>
											{["true", "false"].map((opt) => {
												const isCorrectOption = opt === q.correctAnswer;
												const isSelected = userResponse === opt;

												let className =
													"flex items-center space-x-2 rounded p-2 ";

												if (isLive) {
													if (isSelected)
														className += "bg-info/10 dark:bg-info/20";
												} else {
													if (isCorrectOption) {
														className +=
															"bg-primary/10 dark:bg-primary/20 ring-1 ring-primary/50";
													} else if (isSelected) {
														className +=
															"bg-destructive/10 dark:bg-destructive/20 ring-1 ring-destructive/50";
													}
												}

												return (
													<div className={className} key={opt}>
														<RadioGroupItem
															id={`${q._id}-${opt}`}
															value={opt}
														/>
														<Label
															className="flex-1 cursor-pointer opacity-100"
															htmlFor={`${q._id}-${opt}`}
														>
															{opt === "true" ? "True" : "False"}
															{!isLive && isCorrectOption && (
																<span className="ml-2 font-medium text-primary text-xs">
																	(Correct)
																</span>
															)}
														</Label>
													</div>
												);
											})}
										</RadioGroup>
									)}

									{q.type === "short_answer" && (
										<div className="space-y-2">
											<div
												className={`rounded-md border p-3 ${
													isLive
														? "border-info/30 bg-info/10 dark:border-info/30 dark:bg-info/20"
														: isCorrect
															? "border-primary/30 bg-primary/10 dark:border-primary/30 dark:bg-primary/20"
															: "border-destructive/30 bg-destructive/10 dark:border-destructive/30 dark:bg-destructive/20"
												}`}
											>
												<div className="text-sm">
													<div className="inline-block max-w-full overflow-x-auto overflow-y-hidden py-1 align-middle">
														<LatexRenderer
															content={userResponse || "No answer provided"}
														/>
													</div>
												</div>
											</div>
											{!isLive && !isCorrect && (
												<div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
													<span className="mr-2 font-semibold text-primary">
														Correct Answer:
													</span>
													<div className="inline-block max-w-full overflow-x-auto overflow-y-hidden py-1 align-middle">
														<LatexRenderer content={q.correctAnswer} />
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<div className="space-y-6 pt-10" id="tracking-logs">
				<div className="flex items-center gap-2 border-b pb-2">
					<AlertTriangle className="h-5 w-5 text-destructive" />
					<h2 className="font-bold text-xl tracking-tight">
						Focus & Fullscreen Tracking
					</h2>
				</div>

				<div className="rounded-lg bg-muted/50 p-4 text-muted-foreground text-sm">
					<p className="mb-1 font-semibold text-foreground">
						Notice to Exam Owner:
					</p>
					The events below track when the student switched tabs, lost window
					focus, or exited fullscreen mode. Please note that some of these
					triggers can be accidental (e.g., a system notification or a low
					battery warning). Evaluate these logs alongside the submission timing
					and answers to determine if they indicate intentional cheating.
				</div>

				{!cheatingLogs || cheatingLogs.length === 0 ? (
					<Card>
						<CardContent className="py-10 text-center text-muted-foreground">
							No suspicious focus or fullscreen events detected for this
							submission.
						</CardContent>
					</Card>
				) : (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								Detected Events ({cheatingLogs.length})
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="relative w-full overflow-auto">
								<table className="w-full caption-bottom text-sm">
									<thead className="[&_tr]:border-b">
										<tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
											<th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
												Event Type
											</th>
											<th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
												Timestamp
											</th>
											<th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
												Details
											</th>
										</tr>
									</thead>
									<tbody className="[&_tr:last-child]:border-0">
										{cheatingLogs.map((log) => (
											<tr
												className="border-b transition-colors hover:bg-muted/50"
												key={log._id}
											>
												<td className="p-2 align-middle font-medium capitalize">
													<div className="flex items-center gap-2">
														{log.eventType === "tab_switch" && (
															<Monitor className="h-4 w-4 text-orange-500" />
														)}
														{log.eventType === "window_blur" && (
															<ExternalLink className="h-4 w-4 text-orange-500" />
														)}
														{log.eventType === "exit_fullscreen" && (
															<Minimize2 className="h-4 w-4 text-destructive" />
														)}
														{log.eventType.replace("_", " ")}
													</div>
												</td>
												<td className="p-2 align-middle text-muted-foreground">
													{format(log.timestamp, "MMM d, HH:mm:ss")}
												</td>
												<td className="p-2 align-middle text-xs italic">
													{log.eventType === "tab_switch" &&
														"User switched to another tab or minimized window"}
													{log.eventType === "window_blur" &&
														"Window lost focus (clicked outside or system prompt)"}
													{log.eventType === "exit_fullscreen" &&
														"User exited the browser fullscreen mode"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
