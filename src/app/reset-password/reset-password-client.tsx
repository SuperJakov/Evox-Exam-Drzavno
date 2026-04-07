"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
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
import { Progress } from "~/components/ui/progress";
import { authClient } from "~/lib/auth-client";
import { getPasswordStrength } from "~/lib/validators";

export default function ResetPasswordClient() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isPending, setIsPending] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();

	const passwordStrength = useMemo(() => {
		return getPasswordStrength(password);
	}, [password]);

	const isPasswordStrong = passwordStrength === 5;
	const passwordsMatch = password === confirmPassword;

	const handleSubmit = async (e: React.FormEvent) => {
		const token = searchParams.get("token");

		e.preventDefault();
		if (!passwordsMatch) {
			return;
		}
		if (!isPasswordStrong) {
			toast.error("Password is too weak");
			return;
		}
		if (!token) {
			toast.error("Invalid token");
			return;
		}
		setIsPending(true);
		try {
			const { error } = await authClient.resetPassword({
				newPassword: password,
				token,
			});
			if (error) {
				toast.error(error.message);
			} else {
				toast.success("Password reset successfully");
				router.push("/");
			}
		} catch {
			toast.error("An error occurred");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<main className="flex min-h-screen flex-col items-center justify-center">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Reset Password</CardTitle>
					<CardDescription>Enter your new password below.</CardDescription>
				</CardHeader>
				<form className="space-y-4" onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="password">New Password</Label>
								{password && (
									<div className="flex items-center gap-2">
										<span
											className={`font-medium text-xs ${
												passwordStrength <= 2
													? "text-destructive"
													: passwordStrength <= 3
														? "text-warning"
														: "text-primary"
											}`}
										>
											{passwordStrength <= 2
												? "Weak"
												: passwordStrength <= 3
													? "Medium"
													: "Strong"}
										</span>
										<Progress
											className={`h-1.5 w-16 ${
												passwordStrength <= 2
													? "bg-destructive/20 [&>div]:bg-destructive"
													: passwordStrength <= 3
														? "bg-warning/20 [&>div]:bg-warning"
														: "bg-primary/20 [&>div]:bg-primary"
											}`}
											value={passwordStrength * 20}
										/>
									</div>
								)}
							</div>
							<Input
								id="password"
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setPassword(e.target.value)
								}
								placeholder="New password"
								required
								type="password"
								value={password}
							/>
							<p className="text-muted-foreground text-xs">
								Minimum of 8 characters, with upper and lowercase and a number,
								or a symbol.
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setConfirmPassword(e.target.value)
								}
								placeholder="Confirm new password"
								required
								type="password"
								value={confirmPassword}
							/>
							{!passwordsMatch && confirmPassword && (
								<p className="text-destructive text-xs">
									Passwords do not match
								</p>
							)}
						</div>
					</CardContent>
					<CardFooter>
						<Button
							className="w-full"
							disabled={isPending || !isPasswordStrong || !passwordsMatch}
							type="submit"
						>
							{isPending ? "Resetting..." : "Reset Password"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</main>
	);
}
