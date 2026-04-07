import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "~/components/loading-state";
import { VerifyEmailContent } from "./verify-email-client";

export const metadata: Metadata = {
	title: "Verify Email",
	description: "Verify your email address to secure your Evox Exam account.",
	keywords: ["verify email", "account security", "evox exam"],
};

export default function VerifyEmailPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Suspense fallback={<LoadingState />}>
				<VerifyEmailContent />
			</Suspense>
		</div>
	);
}
