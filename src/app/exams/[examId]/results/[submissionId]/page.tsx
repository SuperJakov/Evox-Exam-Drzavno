import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTokenFromServer } from "~/lib/get-token-from-server";
import ExamSubmissionClient from "./exam-submission-client";

export const metadata: Metadata = {
	title: "Submission Details",
	description: "View detailed results for a specific exam submission.",
	keywords: [
		"submission details",
		"exam review",
		"student result",
		"evox exam",
	],
};

export default async function SubmissionDetailsPage() {
	// We need to fetch the token to ensure the user is authenticated on the server side
	const token = await getTokenFromServer();

	if (!token) {
		redirect("/sign-in");
	}

	return <ExamSubmissionClient />;
}
