"use client";

import { Loader2, Trash2 } from "lucide-react";
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

interface DeleteAccountDialogProps {
	children: React.ReactNode;
	email: string;
}

export function DeleteAccountDialog({
	children,
	email,
}: DeleteAccountDialogProps) {
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

	const handleSendEmail = async (event: React.FormEvent) => {
		event.preventDefault();
		if (cooldown > 0) return;

		setIsPending(true);

		try {
			const { error } = await authClient.deleteUser();

			if (error) {
				toast.error(error.message || "Failed to send deletion email");
			} else {
				const message = "Deletion confirmation link sent to your email";
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
					<div className="rounded-full bg-destructive/10 p-3">
						<Trash2 className="h-6 w-6 text-destructive" />
					</div>
					<div className="text-center">
						<DialogTitle className="text-xl">Delete Account</DialogTitle>
						<DialogDescription className="mt-2 px-2">
							{resultMessage
								? `Check your inbox (${email}) for the confirmation link.`
								: `Are you sure you want to delete your account? We'll send a confirmation link to ${email} to proceed.`}
						</DialogDescription>
					</div>
				</div>

				{resultMessage && (
					<div className="rounded-lg border border-yellow-100 bg-yellow-50/50 p-4 text-yellow-800 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-400">
						<p className="text-center font-medium text-sm">
							All your data will be permanently deleted after confirmation.
						</p>
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
						onClick={(e) => handleSendEmail(e)}
						variant={resultMessage ? "outline" : "destructive"}
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
							"Send Deletion Email"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
