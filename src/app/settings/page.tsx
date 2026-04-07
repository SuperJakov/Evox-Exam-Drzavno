import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTokenFromServer } from "~/lib/get-token-from-server";
import SettingsClient from "./settings-client";

export const metadata: Metadata = {
	title: "Settings",
	description: "Manage your Evox Exam account settings and profile.",
	keywords: ["settings", "profile", "account management", "evox exam"],
};

export default async function SettingsPage() {
	const token = await getTokenFromServer();

	if (!token) {
		redirect("/sign-in");
	}

	return <SettingsClient />;
}
