import { createAuth } from "../auth";

// Export a static instance for Better Auth schema generation

// biome-ignore lint/suspicious/noExplicitAny: This is the recommended way to fix type error from convex docs
export const auth = createAuth({} as any);
