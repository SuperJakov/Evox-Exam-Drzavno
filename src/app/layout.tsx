import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Header } from "~/components/header";
import { Providers } from "~/components/providers";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
	title: {
		default: "Evox Exam | Secure and Easy Online Exams",
		template: "%s | Evox Exam",
	},
	description:
		"Create, manage, and take exams with ease on Evox Exam. The ultimate platform for educators and students.",
	keywords: [
		"exam",
		"test",
		"online examination",
		"quiz",
		"education",
		"assessment",
		"evox",
	],
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={`${geist.variable}`} lang="en" suppressHydrationWarning>
			{/* Suppress hydration warning because next-themes modifies the html element
    client-side to apply the user's theme (dark class), which
    the server can't know ahead of time. */}
			<body>
				<Providers>
					<div className="flex min-h-screen flex-col">
						<Header />
						<main className="relative flex-1">{children}</main>
					</div>
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}
