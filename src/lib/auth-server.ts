import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import { getConvexSiteUrl } from "./convex-site-url";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
	throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
}

export const {
	handler,
	preloadAuthQuery,
	isAuthenticated,
	getToken,
	fetchAuthQuery,
	fetchAuthMutation,
	fetchAuthAction,
} = convexBetterAuthNextJs({
	convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
	convexSiteUrl: getConvexSiteUrl(),
});
