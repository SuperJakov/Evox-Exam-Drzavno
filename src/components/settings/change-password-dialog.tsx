"use client";

import { Loader2, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { authClient } from "~/lib/auth-client";

interface ChangePasswordDialogProps {
	children: React.ReactNode;
	email: string;
}

export function ChangePasswordDialog({
	children,
	email,
}: ChangePasswordDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [cooldown, setCooldown] = useState(0);
	const [resultMessage, setResultMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen) {
			setResultMessage(null);
		}
	}, [isOpen]);

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (cooldown > 0) {
			interval = setInterval(() => {
				setCooldown((prev) => prev - 1);
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [cooldown]);

	const handleSendEmail = async () => {
		if (cooldown > 0) return;

		setIsPending(true);
		if (!email) {
			toast.error("User email not found");
			setIsPending(false);
			return;
		}

		try {
			const { error } = await authClient.requestPasswordReset({
				email,
				redirectTo: "/reset-password",
			});

			if (error) {
				toast.error(error.message || "Failed to send reset email");
			} else {
				const message = "Password reset link sent to your email";
				setResultMessage(message);
				setCooldown(30);
				toast.success(message);
			}
		} catch (error) {
			console.error(error);
			toast.error("An error occurred. Please try again.");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<div className="flex flex-col items-center justify-center space-y-4 py-4">
					<div className="rounded-full bg-primary/10 p-3">
						<Mail className="h-6 w-6 text-primary" />
					</div>
					<div className="text-center">
						<DialogTitle className="text-xl">Change Password</DialogTitle>
						<DialogDescription className="mt-2">
							{resultMessage
								? "Check your inbox for the password reset link."
								: "We'll send a secure link to your email address to help you reset your password."}
						</DialogDescription>
					</div>
				</div>

				{resultMessage && (
					<div className="rounded-lg border border-green-100 bg-green-50/50 p-4 text-green-800 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
						<p className="text-center font-medium text-sm">{resultMessage}</p>
					</div>
				)}

				<DialogFooter className="flex-col gap-2 sm:flex-row">
					<Button
						className="w-full sm:w-auto"
						onClick={() => setIsOpen(false)}
						variant="ghost"
					>
						{resultMessage ? "Close" : "Cancel"}
					</Button>
					<Button
						className="w-full sm:w-auto"
						disabled={isPending || cooldown > 0}
						onClick={handleSendEmail}
					>
						{isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Sending...
							</>
						) : cooldown > 0 ? (
							`Resend in ${cooldown}s`
						) : resultMessage ? (
							"Resend Email"
						) : (
							"Send Email"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
