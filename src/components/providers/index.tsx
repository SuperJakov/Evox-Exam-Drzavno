import { ConvexQueryCacheProvider } from "convex-helpers/react/cache/provider";
import type { ReactNode } from "react";
import { getTokenFromServer } from "~/lib/get-token-from-server";
import { ConvexClientProvider } from "./convex-client-provider";
import { JotaiProvider } from "./jotai-provider";
import { ProgressBarProvider } from "./progress-bar-provider";

import { ThemeProvider } from "./theme-provider";

export async function Providers({ children }: { children: ReactNode }) {
	const token = await getTokenFromServer();

	return (
		<ThemeProvider>
			<JotaiProvider>
				<ConvexClientProvider initialToken={token}>
					<ConvexQueryCacheProvider>
						<ProgressBarProvider>{children}</ProgressBarProvider>
					</ConvexQueryCacheProvider>
				</ConvexClientProvider>
			</JotaiProvider>
		</ThemeProvider>
	);
}
