"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

interface UserAvatarProps {
	user: {
		firstName: string;
		lastName: string;
		image?: string | null;
	};
	profilePictureUrl?: {
		url: string;
		blurDataUrl?: string;
	} | null;
	className?: string;
	fallbackClassName?: string;
}

export function UserAvatar({
	user,
	profilePictureUrl,
	className,
	fallbackClassName,
}: UserAvatarProps) {
	const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

	return (
		<Avatar className={className}>
			<AvatarImage
				alt={`${user.firstName} ${user.lastName}`}
				blurDataUrl={profilePictureUrl?.blurDataUrl}
				src={profilePictureUrl ? profilePictureUrl.url : ""}
			/>
			<AvatarFallback
				className={cn("bg-primary text-primary-foreground", fallbackClassName)}
			>
				{profilePictureUrl?.blurDataUrl ? (
					// biome-ignore lint/performance/noImgElement: Have to use <img> here
					<img
						alt={`${user.firstName} ${user.lastName}`}
						className="h-full w-full object-cover"
						src={profilePictureUrl.blurDataUrl}
					/>
				) : (
					initials
				)}
			</AvatarFallback>
		</Avatar>
	);
}
