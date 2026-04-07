"use client";

import { useAction } from "convex/react";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { api } from "../../../convex/_generated/api";

export function DeleteAccountClient() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const email = searchParams.get("email");
	const router = useRouter();
	const deleteUser = useAction(api.users.functions.deleteUser);

	const [countdown, setCountdown] = useState(5);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	useEffect(() => {
		if (countdown > 0) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [countdown]);

	const handleDelete = async () => {
		if (!token) {
			toast.error("Invalid or missing deletion token");
			return;
		}

		setIsDeleting(true);
		try {
			await deleteUser({ token });
			setIsSuccess(true);
			toast.success("Account deleted successfully");
			setTimeout(() => {
				router.push("/");
			}, 3000);
		} catch (error) {
			console.error(error);
			toast.error("An error occurred. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	if (isSuccess) {
		return (
			<div className="flex min-h-[80vh] items-center justify-center p-4">
				<Card className="w-full max-w-md border-green-100 bg-green-50/30 text-center dark:border-green-900/20 dark:bg-green-900/10">
					<CardHeader className="space-y-4">
						<div className="mx-auto rounded-full bg-green-100 p-3 dark:bg-green-900/30">
							<Trash2 className="h-8 w-8 text-green-600 dark:text-green-400" />
						</div>
						<CardTitle className="text-2xl text-green-800 dark:text-green-400">
							Account Deleted
						</CardTitle>
						<CardDescription className="text-green-700 dark:text-green-500">
							Your account has been permanently removed. We're sorry to see you
							go.
						</CardDescription>
					</CardHeader>
					<CardFooter className="flex justify-center pb-8">
						<p className="text-muted-foreground text-sm">
							Redirecting you to the home page...
						</p>
					</CardFooter>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-4 text-center">
					<div className="mx-auto rounded-full bg-destructive/10 p-3">
						<Trash2 className="h-8 w-8 text-destructive" />
					</div>
					<div>
						<CardTitle className="text-2xl">Delete Account?</CardTitle>
						<CardDescription className="mt-2 text-base">
							{email}
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
						<p className="mb-3 font-medium text-destructive text-sm">
							All your data will be permanently deleted:
						</p>
						<ul className="space-y-2 text-muted-foreground text-sm">
							<li className="flex items-center gap-2">
								<div className="h-1.5 w-1.5 rounded-full bg-destructive" />
								Exams, results, and submissions
							</li>
							<li className="flex items-center gap-2">
								<div className="h-1.5 w-1.5 rounded-full bg-destructive" />
								Profile and personal information
							</li>
						</ul>
					</div>
				</CardContent>

				<CardFooter className="flex flex-col gap-3">
					<Button
						className="h-11 w-full font-semibold"
						disabled={countdown > 0 || isDeleting}
						onClick={handleDelete}
						variant="destructive"
					>
						{isDeleting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Deleting...
							</>
						) : countdown > 0 ? (
							`Wait ${countdown}s...`
						) : (
							"Delete My Account"
						)}
					</Button>
					<Button asChild className="h-11 w-full" variant="outline">
						<a href="/">Cancel</a>
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
