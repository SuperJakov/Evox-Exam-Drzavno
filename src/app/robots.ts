import type { MetadataRoute } from "next";
import { getBaseUrl } from "~/lib/base-url";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = getBaseUrl();
	const sitemapUrl = new URL("/sitemap.xml", baseUrl).toString();

	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: sitemapUrl,
	};
}
