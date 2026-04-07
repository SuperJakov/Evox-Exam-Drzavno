import type { MetadataRoute } from "next";
import { getBaseUrl } from "~/lib/base-url";

export const dynamic = "error";

export default function sitemap(): MetadataRoute.Sitemap {
	const currentDate = new Date();
	const baseUrl = getBaseUrl();

	const homepageUrl = new URL("/", baseUrl).toString();
	const joinExamUrl = new URL("/join", baseUrl).toString();
	const faqUrl = new URL("/faq", baseUrl).toString();
	const privacyUrl = new URL("/privacy", baseUrl).toString();
	const termsUrl = new URL("/terms", baseUrl).toString();
	const latexGuideUrl = new URL("/latex-guide", baseUrl).toString();

	return [
		{
			url: homepageUrl,
			lastModified: currentDate,
			priority: 1,
			changeFrequency: "monthly",
		},
		{
			url: joinExamUrl,
			lastModified: currentDate,
			priority: 0.8,
			changeFrequency: "monthly",
		},
		{
			url: faqUrl,
			lastModified: currentDate,
			priority: 0.7,
			changeFrequency: "monthly",
		},

		{
			url: latexGuideUrl,
			lastModified: currentDate,
			priority: 0.6,
			changeFrequency: "monthly",
		},
		{
			url: privacyUrl,
			lastModified: currentDate,
			priority: 0.5,
			changeFrequency: "yearly",
		},
		{
			url: termsUrl,
			lastModified: currentDate,
			priority: 0.5,
			changeFrequency: "yearly",
		},
	];
}
