"use node";

import { v } from "convex/values";
import sharp from "sharp";
import { internalAction } from "../_generated/server";

async function generateBlurFromBuffer(
	buffer: Buffer,
	size = 30,
): Promise<string> {
	const blurredBuffer = await sharp(buffer)
		.resize(size, size, { fit: "inside" })
		.blur()
		.jpeg({ quality: 20 })
		.toBuffer();
	return `data:image/jpeg;base64,${blurredBuffer.toString("base64")}`;
}

export const generateBlurDataUrl = internalAction({
	args: {
		storageId: v.id("_storage"),
	},
	handler: async (ctx, args) => {
		const blob = await ctx.storage.get(args.storageId);
		if (!blob) return null;

		try {
			const buffer = Buffer.from(await blob.arrayBuffer());
			return await generateBlurFromBuffer(buffer, 20);
		} catch (error) {
			console.error("Failed to generate blur data URL:", error);
			return null;
		}
	},
});

export const processProfileImage = internalAction({
	args: {
		storageId: v.id("_storage"),
	},
	handler: async (ctx, args) => {
		const blob = await ctx.storage.get(args.storageId);
		if (!blob) throw new Error("File not found");

		const buffer = Buffer.from(await blob.arrayBuffer());

		try {
			const metadata = await sharp(buffer).metadata();

			if (
				!metadata.format ||
				!["jpeg", "png", "webp"].includes(metadata.format)
			) {
				throw new Error(
					"Invalid image format. Only JPG, PNG, and WebP are allowed.",
				);
			}

			const [processedBuffer, blurDataUrl] = await Promise.all([
				sharp(buffer)
					.rotate()
					.resize(1024, 1024, { fit: "cover", position: "center" })
					.toBuffer(),
				generateBlurFromBuffer(buffer, 30),
			]);

			const newStorageId = await ctx.storage.store(
				new Blob([new Uint8Array(processedBuffer)], {
					type: `image/${metadata.format}`,
				}),
			);
			await ctx.storage.delete(args.storageId);

			return { storageId: newStorageId, blurDataUrl };
		} catch (error) {
			await ctx.storage.delete(args.storageId);
			throw error;
		}
	},
});

export const processQuestionImage = internalAction({
	args: {
		tempStorageId: v.id("_storage"),
	},
	handler: async (ctx, args) => {
		const blob = await ctx.storage.get(args.tempStorageId);
		if (!blob) throw new Error("File not found");

		const buffer = Buffer.from(await blob.arrayBuffer());

		try {
			const metadata = await sharp(buffer).metadata();

			if (
				!metadata.format ||
				!["jpeg", "png", "webp"].includes(metadata.format)
			) {
				throw new Error(
					"Invalid image format. Only JPG, PNG, and WebP are allowed.",
				);
			}

			const [processedBuffer, blurDataUrl] = await Promise.all([
				sharp(buffer)
					.rotate()
					.resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
					.toBuffer(),
				generateBlurFromBuffer(buffer, 30),
			]);

			const newStorageId = await ctx.storage.store(
				new Blob([new Uint8Array(processedBuffer)], {
					type: `image/${metadata.format}`,
				}),
			);
			await ctx.storage.delete(args.tempStorageId);

			return { storageId: newStorageId, blurDataUrl };
		} catch (error) {
			await ctx.storage.delete(args.tempStorageId);
			throw error;
		}
	},
});
