"use client";

import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useAtom } from "jotai";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { useAuth } from "~/hooks/use-auth";
import { useSendVerificationOtp } from "~/hooks/use-send-verification-otp";
import { parseDurationParts } from "~/lib/duration";
import {
	examHoursAtom,
	examMinutesAtom,
	examSecondsAtom,
	examShuffleAnswersAtom,
	examShuffleQuestionsAtom,
	examTitleAtom,
} from "../atoms";
import type { ExamFormData, TimeInputs } from "../types";
import ExamFormFields from "./exam-form-fields";

export default function CreateExamDialog({
	children,
}: {
	children?: React.ReactNode;
}) {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	const createExam = useMutation(api.exams.general.createExam);
	const [isOpen, setIsOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const { sendOtp, isLoading: isSendingOtp } = useSendVerificationOtp();

	const [title, setTitle] = useAtom(examTitleAtom);
	const [hours, setHours] = useAtom(examHoursAtom);
	const [minutes, setMinutes] = useAtom(examMinutesAtom);
	const [seconds, setSeconds] = useAtom(examSecondsAtom);
	const [shuffleQuestions, setShuffleQuestions] = useAtom(
		examShuffleQuestionsAtom,
	);
	const [shuffleAnswers, setShuffleAnswers] = useAtom(examShuffleAnswersAtom);

	const handleCreateExam = async (
		formData: ExamFormData,
		timeInputs: TimeInputs,
	) => {
		setIsSubmitting(true);
		setError("");

		try {
			const duration = parseDurationParts(timeInputs);

			if (duration < 60000) {
				setError("Duration must be at least 1 minute.");
				setIsSubmitting(false);
				return;
			}

			const examId = await createExam({
				title: formData.title,
				duration,
				shuffleQuestions: formData.shuffleQuestions,
				shuffleAnswers: formData.shuffleAnswers,
				preventDuplicateAttempts: false,
			});

			setIsOpen(false);

			// Reset form
			setTitle("");
			setHours("1");
			setMinutes("0");
			setSeconds("0");
			setShuffleQuestions(false);
			setShuffleAnswers(false);

			router.push(`/exams/${examId}/edit`);
		} catch (error) {
			console.error("Failed to create exam:", error);

			if (error instanceof ConvexError) {
				const msg =
					typeof error.data === "string"
						? error.data
						: "An application error occurred";
				setError(msg);
			} else if (error instanceof Error) {
				setError("Unexpected server error");
			} else {
				setError("An unexpected error occurred");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await handleCreateExam(
			{ title, shuffleQuestions, shuffleAnswers },
			{ hours, minutes, seconds },
		);
	};

	const userWithRole = user as typeof user & { role?: string };
	if (userWithRole?.role === "student") {
		return null;
	}

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogTrigger asChild>
				{children ?? <Button>Create Exam</Button>}
			</DialogTrigger>
			<DialogContent
				className={
					!isLoading && !user?.emailVerified ? "max-w-sm" : "max-w-2xl"
				}
			>
				{isLoading ? (
					<div className="flex h-40 flex-col items-center justify-center">
						<DialogTitle className="sr-only">Loading</DialogTitle>
						<DialogDescription className="sr-only">
							Checking account status...
						</DialogDescription>
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : !user?.emailVerified ? (
					<div className="flex flex-col items-center gap-4 py-4 text-center">
						<div className="rounded-full bg-warning/10 p-3 text-warning">
							<AlertTriangle className="h-6 w-6" />
						</div>
						<div className="space-y-2">
							<DialogTitle>Verification Required</DialogTitle>
							<DialogDescription className="text-balance">
								You need to verify your email address to create an exam.
							</DialogDescription>
						</div>
						<Button
							className="w-full"
							disabled={isSendingOtp}
							onClick={async () => {
								try {
									router.prefetch("/verify-email");
									await sendOtp(user?.email);
									setIsOpen(false);
									router.push("/verify-email");
								} catch (error) {
									console.error("Failed to send verification code:", error);
								}
							}}
						>
							{isSendingOtp ? "Sending code..." : "Verify Email"}
						</Button>
					</div>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Create New Exam</DialogTitle>
							<DialogDescription>
								Set up the basic details for your exam.
							</DialogDescription>
						</DialogHeader>
						<ExamFormFields
							error={error}
							isSubmitting={isSubmitting}
							onSubmit={handleSubmit}
						/>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
