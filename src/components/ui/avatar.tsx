"use client";

import Image from "next/image";
import { Avatar as AvatarPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "~/lib/utils";

function Avatar({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
	return (
		<AvatarPrimitive.Root
			className={cn(
				"relative flex size-8 shrink-0 overflow-hidden rounded-full",
				className,
			)}
			data-slot="avatar"
			{...props}
		/>
	);
}

function AvatarImage({
	className,
	src,
	alt,
	blurDataUrl,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Image> & {
	blurDataUrl?: string;
}) {
	return (
		<AvatarPrimitive.Image
			alt={alt}
			asChild
			className={cn("aspect-square size-full", className)}
			data-slot="avatar-image"
			src={src}
			{...props}
		>
			{src ? (
				<Image
					alt={alt ?? ""}
					blurDataURL={blurDataUrl}
					className="aspect-square size-full object-cover"
					fill
					placeholder={blurDataUrl ? "blur" : undefined}
					sizes="128px"
					src={src as string}
				/>
			) : undefined}
		</AvatarPrimitive.Image>
	);
}

function AvatarFallback({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
	return (
		<AvatarPrimitive.Fallback
			className={cn(
				"flex size-full items-center justify-center rounded-full bg-muted",
				className,
			)}
			data-slot="avatar-fallback"
			{...props}
		/>
	);
}

export { Avatar, AvatarFallback, AvatarImage };
