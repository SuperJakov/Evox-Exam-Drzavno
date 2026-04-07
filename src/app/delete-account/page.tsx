import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "~/components/loading-state";
import { DeleteAccountClient } from "./delete-account-client";

export const metadata: Metadata = {
	title: "Delete Account",
	description:
		"Permanently delete your Evox Exam account and all associated data.",
	keywords: [
		"delete account",
		"permanently delete",
		"account management",
		"evox exam",
	],
};

export default function DeleteAccountPage() {
	return (
		<Suspense fallback={<LoadingState />}>
			<DeleteAccountClient />
		</Suspense>
	);
}
