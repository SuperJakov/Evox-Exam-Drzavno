import type { HttpRouter } from "convex/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { httpAction } from "../_generated/server";
import { authComponent } from "../auth/index";

export function registerQuestionImageRoutes(http: HttpRouter) {
	http.route({
		path: "/upload-question-image",
		method: "OPTIONS",
		handler: httpAction(async (_, request) => {
			const headers = request.headers;
			if (
				headers.get("Origin") !== null &&
				headers.get("Access-Control-Request-Method") !== null
			) {
				return new Response(null, {
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "POST, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type, Authorization",
						"Access-Control-Max-Age": "86400",
					},
				});
			}
			return new Response();
		}),
	});

	http.route({
		path: "/upload-question-image",
		method: "POST",
		handler: httpAction(async (ctx, request) => {
			const user = await authComponent.safeGetAuthUser(ctx);
			if (!user) {
				return new Response(JSON.stringify({ error: "Unauthorized" }), {
					status: 401,
					headers: {
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*",
					},
				});
			}

			// 1. Read file from request body
			const blob = await request.blob();

			// Check file size (max 5 MB)
			const MAX_SIZE = 5 * 1024 * 1024;
			if (blob.size > MAX_SIZE) {
				return new Response(
					JSON.stringify({ error: "File too large. Max size is 5MB." }),
					{
						status: 400,
						headers: {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*",
						},
					},
				);
			}

			// Check file type
			if (!["image/jpeg", "image/png", "image/webp"].includes(blob.type)) {
				return new Response(
					JSON.stringify({
						error: "Invalid file type. Only JPG, PNG, and WebP are allowed.",
					}),
					{
						status: 400,
						headers: {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*",
						},
					},
				);
			}

			// 2. Store file in Convex storage (temporary)
			const tempStorageId = await ctx.storage.store(blob);

			// 3. Process image (resize, no crop)
			let storageId: Id<"_storage">;
			try {
				const result = await ctx.runAction(
					internal.storage.images.processQuestionImage,
					{
						tempStorageId,
					},
				);
				storageId = result.storageId as Id<"_storage">;
			} catch (error) {
				return new Response(
					JSON.stringify({
						error:
							error instanceof Error
								? error.message
								: "Image processing failed",
					}),
					{
						status: 400,
						headers: {
							"Content-Type": "application/json",
							"Access-Control-Allow-Origin": "*",
						},
					},
				);
			}

			// 4. Return success
			return new Response(JSON.stringify({ storageId }), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
			});
		}),
	});
}
