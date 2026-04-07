"use client";

import { Pencil, Trash2 } from "lucide-react";
import { ChangePasswordDialog } from "~/components/settings/change-password-dialog";
import { DeleteAccountDialog } from "~/components/settings/delete-account-dialog";
import { Button } from "~/components/ui/button";
import { SessionItem } from "./session-item";

interface SecuritySectionProps {
	user: {
		email: string;
	};
	sessions: {
		_id: string;
		ipAddress: string | null | undefined;
		userAgent: string | null | undefined;
		createdAt: number;
		token: string;
	}[];
	currentSession:
		| {
				_id: string;
				ipAddress: string | null | undefined;
				userAgent: string | null | undefined;
		  }
		| null
		| undefined;
}

export function SecuritySection({
	user,
	sessions,
	currentSession,
}: SecuritySectionProps) {
	return (
		<div className="space-y-6">
			{/* Active Sessions Card */}
			<div className="rounded-lg border bg-card">
				<div className="border-b p-6">
					<h3 className="font-semibold text-lg">Active Sessions</h3>
					<p className="text-muted-foreground text-sm">
						Manage your active logged-in devices and sessions.
					</p>
				</div>
				<div className="divide-y">
					{sessions.length === 0 ? (
						<div className="p-6 text-center text-muted-foreground">
							No active sessions found.
						</div>
					) : (
						sessions.map((sess) => {
							const isCurrent =
								// Primary check: Session ID
								(currentSession?._id && sess._id === currentSession._id) ||
								// Fallback check: IP and User Agent
								(!currentSession?._id &&
									sess.ipAddress === currentSession?.ipAddress &&
									sess.userAgent === currentSession?.userAgent);

							return (
								<SessionItem
									isCurrent={!!isCurrent}
									key={sess._id}
									session={sess}
								/>
							);
						})
					)}
				</div>
			</div>

			{/* Password Card */}
			<div className="rounded-lg border bg-card">
				<div className="border-b p-6">
					<h3 className="font-semibold text-lg">Password</h3>
					<p className="text-muted-foreground text-sm">
						Update your account password.
					</p>
				</div>
				<div className="p-6">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="mb-1 font-medium text-muted-foreground text-sm">
								Password
							</p>
							<p className="font-medium">Configured</p>
						</div>
						<ChangePasswordDialog email={user.email}>
							<Button className="h-9 w-9 p-0" size="sm" variant="outline">
								<Pencil className="h-4 w-4" />
							</Button>
						</ChangePasswordDialog>
					</div>
				</div>
			</div>

			{/* Danger Zone Card */}
			<div className="rounded-lg border border-destructive/50 bg-card">
				<div className="border-destructive/50 border-b p-6">
					<h3 className="font-semibold text-destructive text-lg">
						Danger Zone
					</h3>
					<p className="text-muted-foreground text-sm">
						Irreversible and destructive actions.
					</p>
				</div>
				<div className="p-6">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<p className="mb-1 font-medium">Delete Account</p>
							<p className="text-muted-foreground text-sm">
								Permanently delete your account and all associated data. This
								action cannot be undone.
							</p>
						</div>
						<DeleteAccountDialog email={user.email}>
							<Button className="ml-4" size="sm" variant="destructive">
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</Button>
						</DeleteAccountDialog>
					</div>
				</div>
			</div>
		</div>
	);
}
