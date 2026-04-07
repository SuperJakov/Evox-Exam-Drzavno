import type { Metadata } from "next";
import JoinPageClient from "./join-page-client";

export const metadata: Metadata = {
	title: "Join Exam",
	description:
		"Enter your unique access code to securely join an exam on Evox Exam.",
	keywords: ["join exam", "exam access", "student portal", "evox exam"],
};

export default async function JoinPage(props: PageProps<"/join">) {
	const searchParams = await props.searchParams;
	const accessCode = searchParams.accessCode;
	let code = null;
	if (accessCode && !Array.isArray(accessCode) && /^\d{6}$/.test(accessCode)) {
		// Only set if exists and is exactly 6 digits
		code = accessCode;
	}

	return <JoinPageClient preloadedCode={code} />;
}
