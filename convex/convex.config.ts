import presence from "@convex-dev/presence/convex.config.js";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import resend from "@convex-dev/resend/convex.config.js";
import { defineApp } from "convex/server";
import betterAuth from "./better-auth/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(rateLimiter);
app.use(resend);
app.use(presence, { name: "submission_presence" });

export default app;
