import type { Metadata } from "next";
import { RedirectType, redirect } from "next/navigation";
import { getTokenFromServer } from "~/lib/get-token-from-server";
import ExamsPageClient from "../components/exams-page-client";

export const metadata: Metadata = {
	title: "My Exams",
	description:
		"Manage your hosted exams, track student progress, and view detailed results.",
	keywords: [
		"instructor dashboard",
		"manage exams",
		"host exam",
		"exam management",
		"student results",
		"evox exam",
	],
};

export default async function ExamsPage() {
	const authToken = await getTokenFromServer();
	if (!authToken) {
		redirect("/sign-in", RedirectType.replace);
	}

	return <ExamsPageClient />;
}
