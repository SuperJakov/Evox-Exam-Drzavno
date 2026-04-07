"use client";

import { motion } from "framer-motion";
import { AlertCircle, Home, RotateCcw } from "lucide-react";
import { Geist } from "next/font/google";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import "~/styles/globals.css";

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

function GlobalErrorContent({
	error,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<>
			<div className="mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />

			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="flex max-w-md flex-col items-center gap-8 text-center"
				initial={{ opacity: 0, y: 20 }}
				transition={{ duration: 0.5 }}
			>
				<div className="flex flex-col items-center gap-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-sm ring-1 ring-destructive/20">
						<AlertCircle size={32} />
					</div>
					<div className="space-y-2">
						<h1 className="font-bold text-2xl tracking-tight">
							We hit an error
						</h1>
						<p className="text-muted-foreground text-sm">
							{error.message || "An unexpected error occurred"}
						</p>
					</div>
				</div>

				<div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
					<Button
						className="gap-2"
						onClick={() => window.location.reload()}
						size="lg"
					>
						<RotateCcw className="h-4 w-4" />
						Try again
					</Button>
					<Button asChild={true} className="gap-2" size="lg" variant="outline">
						<a href="/">
							<Home className="h-4 w-4" />
							Go home
						</a>
					</Button>
				</div>
			</motion.div>
		</>
	);
}

export default function GlobalError(props: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html className={`${geist.variable}`} lang="en">
			<body className="flex min-h-screen flex-col items-center justify-center bg-background p-4 font-sans antialiased">
				<GlobalErrorContent {...props} />
			</body>
		</html>
	);
}
