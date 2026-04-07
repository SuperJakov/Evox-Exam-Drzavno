"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LoadingState } from "~/components/loading-state";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/animated-tabs";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Progress } from "~/components/ui/progress";
import { useAuth } from "~/hooks/use-auth";
import { authClient } from "~/lib/auth-client";
import { getPasswordStrength } from "~/lib/validators";

export default function SignUpClient() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [role, setRole] = useState<"student" | "teacher">("student");
	const [loading, setLoading] = useState(false);
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();

	const { user, isAuthenticated, isLoading: isPending } = useAuth();

	const passwordStrength = useMemo(() => {
		return getPasswordStrength(password);
	}, [password]);

	const isPasswordStrong = passwordStrength === 5;

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isPasswordStrong) return;
		setLoading(true);
		const { error } = await authClient.signUp.email({
			email,
			password,
			name: `${firstName} ${lastName}`,
			firstName,
			lastName,
			role,
		});

		if (error) {
			toast.error(error.message);
			setLoading(false);
		} else {
			setLoading(false);
			setIsRedirecting(true);
			router.prefetch("/verify-email");
		}
	};

	// Redirect if logged in
	useEffect(() => {
		if (!isAuthenticated) return;

		// If user is already verified, redirect to dashboard
		if (user.emailVerified) {
			if (user.role === "teacher") {
				router.replace("/exams");
			} else {
				router.replace("/submissions");
			}
			return;
		}

		// If user is not verified, redirect to verify email
		router.replace("/verify-email");
	}, [user, isAuthenticated, router]);

	if (isPending) {
		return <LoadingState />;
	}

	if (isAuthenticated) {
		return null;
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md rounded-2xl shadow-lg">
				<CardHeader>
					<CardTitle className="text-center font-semibold text-2xl text-foreground">
						Create an Account
					</CardTitle>
					<CardDescription className="text-center">
						Enter your details to create an account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs
						className="mb-6 w-full"
						defaultValue="student"
						onValueChange={(value) => setRole(value as "student" | "teacher")}
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="student">Student</TabsTrigger>
							<TabsTrigger value="teacher">Teacher</TabsTrigger>
						</TabsList>
					</Tabs>
					<form className="space-y-4" onSubmit={handleSignUp}>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name</Label>
								<Input
									className="rounded-xl"
									disabled={loading || isRedirecting}
									id="firstName"
									onChange={(e) => setFirstName(e.target.value)}
									placeholder="First Name"
									required
									type="text"
									value={firstName}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									className="rounded-xl"
									disabled={loading || isRedirecting}
									id="lastName"
									onChange={(e) => setLastName(e.target.value)}
									placeholder="Last Name"
									required
									type="text"
									value={lastName}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								className="rounded-xl"
								disabled={loading || isRedirecting}
								id="email"
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Email"
								required
								type="email"
								value={email}
							/>
						</div>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label className="text-foreground" htmlFor="password">
									Password
								</Label>
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
							<div className="relative">
								<Input
									className="rounded-xl"
									disabled={loading || isRedirecting}
									id="password"
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Password"
									required
									type="password"
									value={password}
								/>
							</div>
							<p className="text-muted-foreground text-xs">
								Minimum of 8 characters, with upper and lowercase and a number,
								or a symbol.
							</p>
						</div>
						<div className="flex items-start space-x-2">
							<Checkbox
								checked={acceptedTerms}
								id="terms"
								onCheckedChange={(checked) =>
									setAcceptedTerms(checked as boolean)
								}
								required
							/>
							<Label
								className="font-medium text-sm leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								htmlFor="terms"
							>
								<span>
									I agree to the{" "}
									<Link className="text-primary hover:underline" href="/terms">
										Terms of Service
									</Link>{" "}
									and acknowledge the{" "}
									<Link
										className="text-primary hover:underline"
										href="/privacy"
									>
										Privacy Policy
									</Link>
									.
								</span>
							</Label>
						</div>
						<Button
							className="w-full rounded-xl"
							disabled={
								loading || !acceptedTerms || !isPasswordStrong || isRedirecting
							}
							type="submit"
						>
							{isRedirecting
								? "Redirecting..."
								: loading
									? "Signing up..."
									: "Sign Up"}
						</Button>
					</form>
					<div className="mt-4 text-center text-muted-foreground text-sm">
						Already have an account?{" "}
						<Link
							className="font-medium text-primary hover:underline"
							href="/sign-in"
						>
							Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
