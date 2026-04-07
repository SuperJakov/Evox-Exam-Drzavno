"use client";

import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoadingState } from "~/components/loading-state";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "~/components/ui/input-otp";
import { Label } from "~/components/ui/label";
import { useAuth } from "~/hooks/use-auth";
import { useConvexQuery } from "~/hooks/use-convex-query";
import { useSendVerificationOtp } from "~/hooks/use-send-verification-otp";

type Props = {
	preloadedCode: string | null;
};

export default function JoinPageClient(props: Props) {
	const { user, isLoading: isPendingAuth } = useAuth();
	const { sendOtp, isLoading: isSendingOtp } = useSendVerificationOtp();

	const router = useRouter();
	const joinExam = useMutation(api.exams.submission.studentMutations.joinExam);

	const [code, setCode] = useState(props.preloadedCode ?? "");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const exam = useConvexQuery(
		api.exams.access.getValidExamByCode,
		code.length === 6 ? { code } : "skip",
	);

	const handleJoin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		if (code.length !== 6) {
			setError("Access code must be 6 digits");
			setIsSubmitting(false);
			return;
		}

		if (!exam) {
			setError("Invalid exam code");
			setIsSubmitting(false);
			return;
		}

		try {
			const submissionId = await joinExam({
				code,
			});
			router.push(`/exams/take/${submissionId}`);
		} catch (err) {
			console.error(err);
			setError(
				err instanceof Error
					? err.message
					: "Failed to join exam. Please check the code.",
			);
			setIsSubmitting(false);
		}
	};

	const isExamFound = exam !== null && exam !== undefined;
	const isChecking = code.length === 6 && exam === undefined;
	const isNotFound = code.length === 6 && exam === null;
	const joinState = exam?.joinState;
	const hasInProgressSubmission = joinState?.type === "in_progress";
	const isJoinBlocked =
		joinState?.type === "blocked" || joinState?.type === "late_join_blocked";

	const truncatedTitle =
		exam?.examInfo.title && exam.examInfo.title.length > 15
			? `${exam.examInfo.title.substring(0, 15)}...`
			: exam?.examInfo.title;

	if (isPendingAuth) {
		return <LoadingState />;
	}

	// Not logged in - prompt to sign in
	if (!user) {
		return (
			<div className="container mx-auto flex min-h-screen items-center justify-center py-10">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-center text-2xl">
							Sign In Required
						</CardTitle>
						<CardDescription className="text-center">
							You need to be signed in as a student to join an exam.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button asChild>
							<Link href="/sign-in">Sign In</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Teacher account - block joining
	const userWithRole = user as typeof user & { role?: string };
	const isTeacher = !userWithRole.role || userWithRole.role === "teacher";

	if (isTeacher) {
		return (
			<div className="container mx-auto flex min-h-screen items-center justify-center py-10">
				<Card className="w-full max-w-md">
					<CardHeader>
						<CardTitle className="text-center text-2xl">
							Teacher Account
						</CardTitle>
						<CardDescription className="text-center">
							Teachers cannot join exams. Please use a student account to join.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex justify-center">
						<Button onClick={() => router.push("/")}>Go to Dashboard</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Verification Required
	if (!user.emailVerified) {
		return (
			<div className="container mx-auto flex min-h-screen items-center justify-center py-10">
				<Card className="w-full max-w-sm">
					<CardContent className="flex flex-col items-center gap-4 py-8 pt-8 text-center">
						<div className="rounded-full bg-warning/10 p-3 text-warning">
							<AlertTriangle className="h-6 w-6" />
						</div>
						<div className="space-y-2 pb-2">
							<CardTitle className="text-xl">Verification Required</CardTitle>
							<CardDescription className="text-balance">
								You need to verify your email address to join an exam.
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

	// Student - show join form with auto-filled name
	const userFirstName =
		(user as typeof user & { firstName?: string }).firstName ?? "";
	const userLastName =
		(user as typeof user & { lastName?: string }).lastName ?? "";

	return (
		<div className="container mx-auto flex min-h-screen items-center justify-center py-10">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-center text-2xl">Join Exam</CardTitle>
					<CardDescription className="text-center">
						Enter the access code to start the exam.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-6" onSubmit={handleJoin}>
						<div className="flex flex-col items-center space-y-3">
							<Label htmlFor="code">Access Code</Label>
							<div className="flex justify-center">
								<InputOTP
									maxLength={6}
									onChange={(value) => {
										if (/^\d*$/.test(value)) {
											setCode(value);
										}
									}}
									value={code}
								>
									<InputOTPGroup>
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
							</div>
							<div className="w-full space-y-2 text-sm">
								{isChecking && (
									<p className="text-center text-muted-foreground">
										Verifying code...
									</p>
								)}
								{isNotFound && (
									<p className="text-center font-medium text-destructive">
										Exam not found
									</p>
								)}
								{isExamFound && (
									<div className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-3 text-left">
										<div className="flex items-center justify-between gap-2">
											<span className="truncate font-medium text-green-600">
												Found: {truncatedTitle}
											</span>
											{exam.creatorProfilePictureUrl && (
												<Image
													alt="Creator"
													className="h-6 w-6 rounded-full"
													height={24}
													src={exam.creatorProfilePictureUrl}
													width={24}
												/>
											)}
										</div>
										{hasInProgressSubmission && (
											<p className="rounded-lg bg-primary/10 px-3 py-2 text-primary text-xs leading-relaxed">
												You already have an in-progress submission for this
												exam. Click below to continue it.
											</p>
										)}
										{isJoinBlocked && (
											<p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-xs leading-relaxed">
												{joinState.reason}
											</p>
										)}
									</div>
								)}
							</div>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name</Label>
								<Input disabled id="firstName" value={userFirstName} />
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name</Label>
								<Input disabled id="lastName" value={userLastName} />
							</div>
						</div>
						<p className="text-center text-muted-foreground text-xs">
							To change your name, go to{" "}
							<Link className="underline" href="/settings">
								Settings
							</Link>
							.
						</p>

						{error && (
							<p className="text-center font-medium text-red-500 text-sm">
								{error}
							</p>
						)}

						{hasInProgressSubmission ? (
							<Button asChild className="w-full">
								<Link href={`/exams/take/${joinState.submissionId}`}>
									Continue In-Progress Attempt
								</Link>
							</Button>
						) : (
							<Button
								className="w-full"
								disabled={isSubmitting || !isExamFound || isJoinBlocked}
								type="submit"
							>
								{isSubmitting
									? "Joining..."
									: isJoinBlocked
										? "Joining Disabled"
										: "Start Exam"}
							</Button>
						)}
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
