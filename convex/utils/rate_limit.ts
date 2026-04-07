import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "../_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
	emailOTP: { kind: "token bucket", rate: 10, period: HOUR, capacity: 5 },
	verifyOTP: { kind: "token bucket", rate: 5, period: MINUTE, capacity: 5 },
	globalAuth: {
		kind: "token bucket",
		rate: 100,
		period: MINUTE,
		capacity: 100,
	},
	passwordReset: { kind: "token bucket", rate: 5, period: HOUR, capacity: 2 },
	deleteAccount: { kind: "token bucket", rate: 12, period: HOUR, capacity: 1 }, // Once per 5 mins
	createExam: { kind: "token bucket", rate: 100, period: HOUR, capacity: 100 },
	joinExam: { kind: "token bucket", rate: 15, period: HOUR, capacity: 10 },
	avatarUpload: { kind: "token bucket", rate: 10, period: HOUR, capacity: 5 },
	computeAnalytics: {
		kind: "token bucket",
		rate: 15,
		period: MINUTE * 15,
		capacity: 15,
	},
});
