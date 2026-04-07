import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTokenFromServer } from "~/lib/get-token-from-server";
import SubmissionsClient from "./submissions-client";

export const metadata: Metadata = {
	title: "Submissions",
	description: "View your exam submissions and history.",
};

export default async function SubmissionsPage() {
	const token = await getTokenFromServer();

	if (!token) {
		redirect("/sign-in");
	}

	return <SubmissionsClient />;
}
