import type { Id } from "convex/_generated/dataModel";
import type { Metadata } from "next";
import TakeExamClient from "./take-exam-client";

export const metadata: Metadata = {
	title: "Take Exam",
	description:
		"Securely take your exam on Evox Exam. Your progress is saved automatically.",
	keywords: ["take exam", "online test", "student assessment", "evox exam"],
};

interface PageProps {
	params: Promise<{
		submissionId: Id<"submissions">;
	}>;
}

export default async function TakeExamPage(props: PageProps) {
	const params = await props.params;
	const submissionId = params.submissionId;

	return <TakeExamClient submissionId={submissionId} />;
}
