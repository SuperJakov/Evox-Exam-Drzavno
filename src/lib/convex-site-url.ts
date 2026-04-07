/**
 * Returns the Convex site URL, either from the NEXT_PUBLIC_CONVEX_SITE_URL
 * environment variable or derived from NEXT_PUBLIC_CONVEX_URL.
 *
 * @returns The Convex site URL.
 * @throws {Error} If NEXT_PUBLIC_CONVEX_URL is not set.
 */
export function getConvexSiteUrl() {
	const cloudUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
	if (!cloudUrl) {
		throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
	}

	const derivedSiteUrl = cloudUrl.replace(/\.convex\.cloud$/, ".convex.site");

	return process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? derivedSiteUrl;
}
