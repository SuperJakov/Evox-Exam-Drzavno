"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { authClient } from "~/lib/auth-client";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
	throw new Error(
		"Missing NEXT_PUBLIC_CONVEX_URL environment variable. Please add it to your .env.local file.",
	);
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider({
	children,
	initialToken,
}: {
	children: ReactNode;
	initialToken?: string | null;
}) {
	return (
		<ConvexBetterAuthProvider
			// biome-ignore lint/suspicious/noExplicitAny: Type inference issue with inferAdditionalFields plugin
			authClient={authClient as any}
			client={convex}
			initialToken={initialToken}
		>
			{children}
		</ConvexBetterAuthProvider>
	);
}
