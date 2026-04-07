import type { NextConfig } from "next";

const config: NextConfig = {
	reactCompiler: true,
	typedRoutes: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "*.convex.cloud",
			},
			{
				protocol: "https",
				hostname: "*.convex.site",
			},
		],
	},
};

export default config;
