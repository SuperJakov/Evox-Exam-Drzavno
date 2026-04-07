import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "~/components/loading-state";
import ResetPasswordClient from "./reset-password-client";

export const metadata: Metadata = {
	title: "Reset Password",
	description: "Set a new password for your Evox Exam account.",
	keywords: ["reset password", "account security", "evox exam"],
};

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<LoadingState />}>
			<ResetPasswordClient />
		</Suspense>
	);
}
