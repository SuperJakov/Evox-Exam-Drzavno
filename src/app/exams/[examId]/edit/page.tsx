import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTokenFromServer } from "~/lib/get-token-from-server";
import EditExamView from "./edit-exam-view";

export const metadata: Metadata = {
	title: "Edit Exam",
	description: "Modify your exam questions and settings.",
	keywords: ["edit exam", "exam settings", "evox exam"],
};

export default async function EditExamPage() {
	// We need to fetch the token to ensure the user is authenticated on the server side
	const token = await getTokenFromServer();

	if (!token) {
		redirect("/sign-in");
	}

	return <EditExamView />;
}
