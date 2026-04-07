"use client";

import { api } from "convex/_generated/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "~/components/ui/animated-tabs";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { UserAvatar } from "~/components/user-avatar";
import { useAuth } from "~/hooks/use-auth";
import { useAuthedConvexQuery } from "~/hooks/use-authed-convex-query";
import Loading from "../loading";
import { HistorySection } from "./components/history-section";
import { PreferencesSection } from "./components/preferences-section";
import { ProfileSection } from "./components/profile-section";
import { SecuritySection } from "./components/security-section";

export default function SettingsClient() {
	const { user, isLoading, isAuthenticated } = useAuth();
	const profilePictureUrl = useAuthedConvexQuery(
		api.profile.picture.getProfilePictureForCurrentUser,
	);
	const sessions =
		useAuthedConvexQuery(api.auth.sessions.listActiveSessions) || [];
	const currentSession = useAuthedConvexQuery(api.auth.sessions.current);

	if (isLoading) {
		return <Loading />;
	}

	if (!isAuthenticated) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
				<h1 className="font-bold text-2xl">
					Please sign in to access settings
				</h1>
				<Button asChild>
					<Link href="/sign-in">Sign In</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-7xl px-4 py-10">
			<div className="flex flex-col gap-10 lg:flex-row">
				{/* Sidebar */}
				<div className="w-full space-y-6 lg:w-1/4">
					<Button asChild className="w-full justify-center" variant="ghost">
						<Link href="/exams">
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to dashboard
						</Link>
					</Button>
					<div className="flex flex-col items-center space-y-4 text-center">
						<UserAvatar
							className="h-32 w-32 border-4 border-primary/10"
							fallbackClassName="text-3xl"
							profilePictureUrl={profilePictureUrl}
							user={user}
						/>
						<div className="space-y-1">
							<h1 className="font-bold text-2xl">
								{user.firstName} {user.lastName}
							</h1>
							<p className="text-muted-foreground">{user.email}</p>
						</div>
						<div className="flex gap-2">
							<Badge
								className="px-4 py-1 font-medium text-sm"
								variant="secondary"
							>
								Free Plan
							</Badge>
							<Badge
								className="px-4 py-1 font-medium text-sm"
								variant="outline"
							>
								{user.role === "teacher"
									? "Teacher Account"
									: "Student Account"}
							</Badge>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-1">
					<Tabs className="space-y-8" defaultValue="account">
						<div className="mb-6 overflow-x-auto pb-0">
							<TabsList className="w-full justify-start p-1">
								<TabsTrigger value="account">Account</TabsTrigger>
								<TabsTrigger value="preferences">Preferences</TabsTrigger>
								<TabsTrigger value="history">History</TabsTrigger>
								<TabsTrigger value="security">Security</TabsTrigger>
							</TabsList>
						</div>

						<TabsContent
							className="fade-in-50 animate-in space-y-6 duration-500"
							value="account"
						>
							<ProfileSection
								profilePictureUrl={profilePictureUrl}
								user={user}
							/>
						</TabsContent>

						<TabsContent
							className="fade-in-50 animate-in space-y-6 duration-500"
							value="security"
						>
							<SecuritySection
								currentSession={currentSession}
								sessions={sessions}
								user={user}
							/>
						</TabsContent>

						<TabsContent value="preferences">
							<PreferencesSection />
						</TabsContent>

						<TabsContent value="history">
							<HistorySection />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
