import { Loader2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { UserNav } from "~/components/user-nav";

interface DesktopNavProps {
	user:
		| {
				firstName: string;
				lastName: string;
				email: string;
				image?: string | null;
				role?: string;
		  }
		| null
		| undefined;
	isLoadingAuth: boolean;
	pendingPath: Route | null;
	setPendingPath: (path: Route | null) => void;
}

export function DesktopNav({
	user,
	isLoadingAuth,
	pendingPath,
	setPendingPath,
}: DesktopNavProps) {
	return (
		<div className="hidden items-center gap-4 min-[450px]:flex">
			<ThemeToggle />
			{user ? (
				<div className="flex items-center gap-4">
					<Button asChild variant="ghost">
						{user.role === "student" ? (
							<Link href={"/submissions" as Route}>Submissions</Link>
						) : (
							<Link href="/exams">Dashboard</Link>
						)}
					</Button>
					<UserNav user={user} />
				</div>
			) : (
				<div className="flex items-center gap-4">
					<Button
						asChild
						disabled={isLoadingAuth && !!pendingPath}
						variant="ghost"
					>
						<Link
							href="/sign-in"
							onClick={(e) => {
								if (isLoadingAuth) {
									e.preventDefault();
									setPendingPath("/sign-in");
								}
							}}
						>
							{pendingPath === "/sign-in" && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Sign in
						</Link>
					</Button>
					<Button asChild disabled={isLoadingAuth && !!pendingPath}>
						<Link
							href="/sign-up"
							onClick={(e) => {
								if (isLoadingAuth) {
									e.preventDefault();
									setPendingPath("/sign-up");
								}
							}}
						>
							{pendingPath === "/sign-up" && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Get Started
						</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
