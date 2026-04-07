"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth-client";

interface Props {
	prefilledEmail: string | null;
}

export default function ForgotPasswordClient(props: Props) {
	const [email, setEmail] = useState(props.prefilledEmail ?? "");
	const [isPending, setIsPending] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [cooldown, setCooldown] = useState(0);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (cooldown > 0) return;

		setIsPending(true);
		try {
			const { error } = await authClient.requestPasswordReset({
				email,
				redirectTo: "/reset-password",
			});
			if (error) {
				toast.error(error.message);
			} else {
				toast.success("Password reset link sent to your email");
				setIsSuccess(true);
				setCooldown(30);
				const interval = setInterval(() => {
					setCooldown((prev) => {
						if (prev <= 1) {
							clearInterval(interval);
							return 0;
						}
						return prev - 1;
					});
				}, 1000);
			}
		} catch {
			toast.error("An error occurred");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Forgot Password</CardTitle>
					<CardDescription>
						Enter your email address to reset your password.
					</CardDescription>
				</CardHeader>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<CardContent className="flex flex-col gap-y-4">
						{isSuccess && (
							<div className="rounded-md bg-green-50 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-400">
								<p className="text-sm">
									If an account is associated with this email, you will receive
									a password reset link shortly. Please check your inbox and
									spam folder.
								</p>
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setEmail(e.target.value)
								}
								placeholder="Enter your email"
								required
								type="email"
								value={email}
							/>
							{props.prefilledEmail && email === props.prefilledEmail && (
								<div className="flex items-center gap-2 text-muted-foreground">
									<Info className="size-3.5" />
									<p className="text-xs">Email prefilled from URL</p>
								</div>
							)}
						</div>
					</CardContent>
					<CardFooter>
						<Button
							className="w-full"
							disabled={isPending || cooldown > 0}
							type="submit"
						>
							{cooldown > 0
								? `Resend in ${cooldown}s`
								: isPending
									? "Sending..."
									: isSuccess
										? "Resend Link"
										: "Send Reset Link"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</main>
	);
}
