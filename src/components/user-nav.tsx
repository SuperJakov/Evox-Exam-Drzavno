"use client";

import { api } from "convex/_generated/api";
import { Loader2, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui/button";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { UserAvatar } from "~/components/user-avatar";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";
import { useSignOut } from "~/hooks/use-sign-out";

interface UserNavProps {
	user: {
		firstName: string;
		lastName: string;
		email: string;
		image?: string | null;
	};
}

export function UserNav({ user }: UserNavProps) {
	const [open, setOpen] = useState(false);
	const profilePictureUrl = useAuthedConvexQuery(
		api.profile.picture.getProfilePictureForCurrentUser,
	);
	const { signOut, isLoading: isSigningOut } = useSignOut();

	const handleSignOut = (e: React.MouseEvent) => {
		e.preventDefault();
		signOut();
	};

	return (
		<DropdownMenu onOpenChange={setOpen} open={open}>
			<DropdownMenuTrigger asChild>
				<Button className="relative h-8 w-8 rounded-full" variant="ghost">
					<UserAvatar
						className="h-8 w-8"
						profilePictureUrl={profilePictureUrl}
						user={user}
					/>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80 p-0" forceMount>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-3 border-b px-4 py-3">
						<UserAvatar
							className="h-10 w-10"
							profilePictureUrl={profilePictureUrl}
							user={user}
						/>
						<div className="flex flex-col space-y-1">
							<p className="font-medium text-sm leading-none">
								{user.firstName} {user.lastName}
							</p>
							<p className="text-muted-foreground text-xs leading-none">
								{user.email}
							</p>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuGroup>
					<Link
						href="/settings"
						onClick={(e) => isSigningOut && e.preventDefault()}
					>
						<DropdownMenuItem
							className="cursor-pointer rounded-none border-b px-4 py-3"
							disabled={isSigningOut}
						>
							<Settings className="mr-2 h-4 w-4" />
							<span>Manage account</span>
						</DropdownMenuItem>
					</Link>
				</DropdownMenuGroup>
				<DropdownMenuItem
					className="cursor-pointer rounded-none px-4 py-3"
					disabled={isSigningOut}
					onClick={handleSignOut}
					onSelect={(e) => e.preventDefault()}
				>
					{isSigningOut ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<LogOut className="mr-2 h-4 w-4" />
					)}
					<span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
