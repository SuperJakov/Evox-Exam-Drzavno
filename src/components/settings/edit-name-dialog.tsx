"use client";

import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface EditNameDialogProps {
	children: React.ReactNode;
	currentFirstName: string;
	currentLastName: string;
}

export function EditNameDialog({
	children,
	currentFirstName,
	currentLastName,
}: EditNameDialogProps) {
	const [open, setOpen] = useState(false);
	const [firstName, setFirstName] = useState(currentFirstName);
	const [lastName, setLastName] = useState(currentLastName);
	const [isLoading, setIsLoading] = useState(false);
	const updateName = useMutation(api.users.functions.updateName);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!firstName.trim() || !lastName.trim()) {
			toast.error("First name and last name are required");
			return;
		}

		setIsLoading(true);
		try {
			await updateName({
				firstName,
				lastName,
			});

			toast.success("Name updated successfully");
			setOpen(false);
		} catch (error) {
			console.error("Error updating name:", error);
			toast.error("Failed to update name");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Name</DialogTitle>
					<DialogDescription>
						Update your first name and last name. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="firstName">First Name</Label>
							<Input
								disabled={isLoading}
								id="firstName"
								onChange={(e) => setFirstName(e.target.value)}
								placeholder="Enter your first name"
								required
								type="text"
								value={firstName}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input
								disabled={isLoading}
								id="lastName"
								onChange={(e) => setLastName(e.target.value)}
								placeholder="Enter your last name"
								required
								type="text"
								value={lastName}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							disabled={isLoading}
							onClick={() => setOpen(false)}
							type="button"
							variant="outline"
						>
							Cancel
						</Button>
						<Button disabled={isLoading} type="submit">
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
