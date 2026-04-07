"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Input } from "~/components/ui/input";
import { useAuth } from "~/hooks/use-auth";
import { authClient } from "~/lib/auth-client";

export default function SignInClient() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();

	const { user, isLoading: isPending } = useAuth();

	// Redirect if already logged in or if we just signed in
	// and are waiting for the user state to update
	useEffect(() => {
		if (user) {
			if (user.role === "teacher") {
				router.push("/exams");
			} else {
				router.push("/submissions");
			}
		}
	}, [user, router]);

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		const { error } = await authClient.signIn.email({
			email,
			password,
		});

		if (error) {
			toast.error(error.message);
			setLoading(false);
		} else {
			toast.success("Signed in successfully!");
			setLoading(false);
			setIsRedirecting(true);
		}
	};

	if (isPending) {
		return <LoadingState />;
	}

	if (user) {
		return <LoadingState />;
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md rounded-2xl shadow-lg">
				<CardHeader>
					<CardTitle className="text-center font-semibold text-2xl text-foreground">
						Sign In
					</CardTitle>
					<CardDescription className="text-center">
						Welcome back! Sign in to your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={handleSignIn}>
						<Input
							className="rounded-xl"
							disabled={loading || isRedirecting}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Email"
							required
							type="email"
							value={email}
						/>
						<Input
							className="rounded-xl"
							disabled={loading || isRedirecting}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Password"
							required
							type="password"
							value={password}
						/>
						<Button
							className="w-full rounded-xl"
							disabled={loading || !email || !password || isRedirecting}
							type="submit"
						>
							{isRedirecting
								? "Redirecting..."
								: loading
									? "Signing in..."
									: "Sign In"}
						</Button>
					</form>

					<div className="mt-4 space-y-2">
						<div className="text-center text-muted-foreground text-sm">
							Don't have an account?{" "}
							<Link
								className="font-medium text-primary hover:underline"
								href="/sign-up"
							>
								Sign up
							</Link>
						</div>
						<div className="text-center text-muted-foreground text-sm">
							Forgot password?{" "}
							<Link
								className="font-medium text-primary hover:underline"
								href={
									email
										? `/forgot-password?email=${encodeURIComponent(email)}`
										: "/forgot-password"
								}
								prefetch={false}
							>
								Recover it.
							</Link>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
