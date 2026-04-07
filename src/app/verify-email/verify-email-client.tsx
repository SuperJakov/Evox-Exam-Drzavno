"use client";
import { api } from "convex/_generated/api";
import { useAction } from "convex/react";
import { motion, useAnimation } from "framer-motion";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LoadingState } from "~/components/loading-state";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "~/components/ui/input-otp";
import { useAuth } from "~/hooks/use-auth";
import { useSendVerificationOtp } from "~/hooks/use-send-verification-otp";

export function VerifyEmailContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { user, isLoading: isPending } = useAuth();
	const controls = useAnimation();
	const defaultReturnPath =
		user?.role === "teacher" ? "/exams" : "/submissions";
	const returnTo = searchParams.get("returnTo") || defaultReturnPath;
	const email = user?.email;

	const verifyEmail = useAction(api.auth.verification.verifyEmail);
	const { sendOtp } = useSendVerificationOtp();

	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [resendTimer, setResendTimer] = useState(30);
	const [error, setError] = useState<string | null>(null);

	// This will redirect when email becomes verified
	// Query will automatically update emailVerified
	useEffect(() => {
		if (user?.emailVerified) {
			router.push(returnTo as Route);
		}
	}, [user, returnTo, router]);

	// Redirect to sign-in if no session and not pending
	useEffect(() => {
		if (!isPending && user === null) {
			router.push("/sign-in");
		}
	}, [isPending, user, router]);

	useEffect(() => {
		if (resendTimer > 0) {
			const interval = setInterval(() => {
				setResendTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [resendTimer]);

	const handleVerify = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!email) {
			toast.error("Email is missing");
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const result = await verifyEmail({
				email,
				otp,
			});

			if (!result.success) {
				const errorMessage =
					result.error === "INVALID_OTP"
						? "Invalid code"
						: "Failed to verify email";
				setError(errorMessage);
				controls.start({
					x: [0, -5, 5, -5, 5, 0],
					transition: { duration: 0.4 },
				});
				setLoading(false);
				return;
			}

			toast.success("Email verified successfully");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to verify email",
			);
			setLoading(false);
		}
	};

	const handleResend = async () => {
		if (!email) return;

		setLoading(true);
		try {
			await sendOtp(email);
			setResendTimer(30);
		} catch {
			// Error handled by hook
		} finally {
			setLoading(false);
		}
	};

	if (isPending) {
		return <LoadingState />;
	}

	if (user === null) {
		return null;
	}

	return (
		<motion.div animate={controls}>
			<Card className="w-full max-w-md rounded-2xl shadow-lg">
				<CardHeader>
					<CardTitle className="text-center font-semibold text-2xl text-foreground">
						Verify Email
					</CardTitle>
					<CardDescription className="text-center">
						Enter the 6-digit code sent to{" "}
						<span className="font-bold">{email}</span>
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<form
						className="flex flex-col items-center space-y-4"
						onSubmit={handleVerify}
					>
						<div className="flex flex-col items-center gap-2">
							<InputOTP
								maxLength={6}
								onChange={(value) => {
									setOtp(value);
									if (error) setError(null);
								}}
								pattern="^[0-9]*$"
								value={otp}
							>
								<InputOTPGroup>
									{[0, 1, 2].map((index) => (
										<InputOTPSlot
											aria-invalid={!!error}
											className="h-12 w-12 text-lg sm:h-14 sm:w-14"
											index={index}
											key={index}
										/>
									))}
								</InputOTPGroup>
								<InputOTPSeparator />
								<InputOTPGroup>
									{[3, 4, 5].map((index) => (
										<InputOTPSlot
											aria-invalid={!!error}
											className="h-12 w-12 text-lg sm:h-14 sm:w-14"
											index={index}
											key={index}
										/>
									))}
								</InputOTPGroup>
							</InputOTP>
							<div className="min-h-[20px]">
								{error && (
									<p className="fade-in slide-in-from-top-1 animate-in font-medium text-destructive text-sm">
										{error}
									</p>
								)}
							</div>
						</div>

						<Button
							className="w-full rounded-xl"
							disabled={loading || otp.length < 6}
							type="submit"
						>
							{loading ? "Verifying..." : "Verify"}
						</Button>

						<Button
							className="text-muted-foreground text-sm hover:text-foreground"
							disabled={loading || resendTimer > 0}
							onClick={handleResend}
							size="sm"
							type="button"
							variant="link"
						>
							{loading
								? "Sending..."
								: resendTimer > 0
									? `Resend Code (${resendTimer}s)`
									: "Resend Code"}
						</Button>
					</form>
					<div className="text-center text-muted-foreground text-sm">
						<Link
							className="font-medium text-primary hover:underline"
							href={defaultReturnPath as Route}
						>
							Maybe later
						</Link>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
