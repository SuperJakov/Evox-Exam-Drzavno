import { api } from "convex/_generated/api";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DesktopNav } from "~/components/header/desktop-nav";
import { HeaderLogo } from "~/components/header/header-logo";
import { MobileNav } from "~/components/header/mobile-nav";
import { useAuth } from "~/hooks/use-auth";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";

export function HeaderContent() {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [pendingPath, setPendingPath] = useState<Route | null>(null);

	const { user, isLoading: isLoadingAuth } = useAuth();

	// Preload
	useAuthedConvexQuery(api.profile.picture.getProfilePictureForCurrentUser);

	// Navigation is deferred through `pendingPath` instead of being triggered directly
	// by nav components, because auth state isn't available on the first render.
	// Once auth resolves, we decide where to actually send the user.
	useEffect(() => {
		if (isLoadingAuth || !pendingPath) return;

		const getRedirectPath = () => {
			const isAuthPage =
				pendingPath === "/sign-in" || pendingPath === "/sign-up";
			if (user && isAuthPage) {
				return user.role === "teacher" ? "/exams" : "/submissions";
			}
			return pendingPath;
		};

		router.push(getRedirectPath());
		setPendingPath(null);
	}, [isLoadingAuth, pendingPath, user, router]);

	return (
		<header className="sticky top-0 z-50 flex h-16 w-full items-center border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto flex items-center justify-between px-4">
				<HeaderLogo />

				<DesktopNav
					isLoadingAuth={isLoadingAuth}
					pendingPath={pendingPath}
					setPendingPath={setPendingPath}
					user={user}
				/>

				<MobileNav
					isLoadingAuth={isLoadingAuth}
					isOpen={isOpen}
					pendingPath={pendingPath}
					setIsOpen={setIsOpen}
					setPendingPath={setPendingPath}
					user={user}
				/>
			</div>
		</header>
	);
}
