import type { Metadata } from "next";
import { redirectIfAuthenticated } from "~/lib/server-auth-utils";
import SignInClient from "./sign-in-client";

export const metadata: Metadata = {
	title: "Sign In",
	description: "Sign in to your Evox Exam account to manage and take exams.",
	keywords: ["sign in", "login", "evox exam"],
};

export default async function SignInPage() {
	await redirectIfAuthenticated({
		noUserFoundPath: "/",
		teacherPath: "/exams",
		studentPath: "/submissions",
	});

	return <SignInClient />;
}
