import type { Metadata } from "next";
import { redirectIfAuthenticated } from "~/lib/server-auth-utils";
import SignUpClient from "./sign-up-client";

export const metadata: Metadata = {
	title: "Sign Up",
	description:
		"Create an account on Evox Exam to start creating and taking exams.",
	keywords: ["sign up", "register", "evox exam"],
};

export default async function SignUpPage() {
	await redirectIfAuthenticated({
		noUserFoundPath: "/",
		teacherPath: "/exams",
		studentPath: "/submissions",
	});

	return <SignUpClient />;
}
