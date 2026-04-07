import type { Metadata } from "next";
import ForgotPasswordClient from "./forgot-password-client";

export const metadata: Metadata = {
	title: "Forgot Password",
	description: "Recover your Evox Exam account password.",
	keywords: [
		"forgot password",
		"reset password",
		"account recovery",
		"evox exam",
	],
};

export default async function ForgotPasswordPage(
	props: PageProps<"/forgot-password">,
) {
	const searchParams = await props.searchParams;

	let prefilledEmail: string | null = null;
	if (searchParams.email && typeof searchParams.email === "string") {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (emailRegex.test(searchParams.email)) {
			prefilledEmail = searchParams.email;
		}
	}

	return <ForgotPasswordClient prefilledEmail={prefilledEmail} />;
}
