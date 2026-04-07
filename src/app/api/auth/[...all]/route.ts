import { ipAddress } from "@vercel/functions";
import type { NextRequest } from "next/server";
import { getConvexSiteUrl } from "~/lib/convex-site-url";

// Cache the IP in memory so we don't spam the discovery API locally
let cachedRealIp: string | null = null;

// NOTE: Only for local development
async function getPublicIpForDevelopment() {
	if (cachedRealIp) {
		console.log("Using cached IP: ", cachedRealIp);
		return cachedRealIp;
	}
	console.log("Resolving public IP for development...");
	try {
		// Use a fast, no-auth API to get public IPv4
		const response = await fetch("https://api.ipify.org", {
			signal: AbortSignal.timeout(2000),
		});
		cachedRealIp = await response.text();
		console.log("Using fetched IP: ", cachedRealIp);
		return cachedRealIp;
	} catch (_e) {
		console.warn("Failed to fetch public IP, falling back to mock.");
		const mockIp = process.env.MOCK_IP_ADDRESS ?? "8.8.8.8";
		console.log("Using mock IP: ", mockIp);
		return mockIp;
	}
}

/**
 * Slightly changed handler from the official package, to make sure the IP address
 * is passed correctly to the Convex backend.
 */
async function customHandler(req: NextRequest) {
	const convexSiteUrl = getConvexSiteUrl();

	// Construct the target Convex URL
	const requestUrl = new URL(req.url);
	const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;

	const clientIp = ipAddress(req) || req.headers.get("x-forwarded-for") || "";
	let ipStr = Array.isArray(clientIp) ? clientIp[0] : clientIp;

	// Localhost detection & override
	if (process.env.NODE_ENV === "development" && isTestIp(ipStr)) {
		ipStr = await getPublicIpForDevelopment();
	}

	const newRequest = new Request(nextUrl, req);

	if (ipStr) {
		newRequest.headers.set("x-forwarded-for", ipStr);
		newRequest.headers.set("x-client-ip", ipStr);
	}

	newRequest.headers.set("accept-encoding", "application/json");
	newRequest.headers.set("host", new URL(convexSiteUrl).host);

	return fetch(newRequest, {
		method: req.method,
		redirect: "manual",
	});
}

export const GET = customHandler;
export const POST = customHandler;

function isTestIp(ip: string) {
	// Includes IPv6 loopback, IPv4 loopback, and empty strings
	return !ip || ip === "::1" || ip.startsWith("127.");
}
