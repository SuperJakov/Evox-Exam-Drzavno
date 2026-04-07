import {
	LayoutDashboard,
	Loader2,
	LogIn,
	LogOut,
	Menu,
	Rocket,
	Settings,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "~/components/ui/sheet";
import { useSignOut } from "~/hooks/use-sign-out";

interface MobileNavProps {
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
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
}

export function MobileNav({
	user,
	isLoadingAuth,
	pendingPath,
	setPendingPath,
	isOpen,
	setIsOpen,
}: MobileNavProps) {
	const { signOut, isLoading: isSigningOut } = useSignOut();

	return (
		<div className="flex items-center gap-2 min-[450px]:hidden">
			<ThemeToggle />
			<Sheet onOpenChange={setIsOpen} open={isOpen}>
				<SheetTrigger asChild>
					<Button size="icon" variant="outline">
						<Menu className="h-6 w-6" />
						<span className="sr-only">Toggle menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Evox Exam</SheetTitle>
					</SheetHeader>
					<div className="mt-8 flex flex-col gap-4">
						{user ? (
							<>
								{user.role === "student" ? (
									<Button
										asChild
										className="w-full justify-start font-medium"
										variant="ghost"
									>
										<Link
											href={"/submissions" as Route}
											onClick={() => setIsOpen(false)}
										>
											<LayoutDashboard className="mr-2 h-4 w-4" />
											Submissions
										</Link>
									</Button>
								) : (
									<Button
										asChild
										className="w-full justify-start font-medium"
										variant="ghost"
									>
										<Link href="/exams" onClick={() => setIsOpen(false)}>
											<LayoutDashboard className="mr-2 h-4 w-4" />
											Dashboard
										</Link>
									</Button>
								)}
								<Button
									asChild
									className="w-full justify-start font-medium"
									variant="ghost"
								>
									<Link href="/settings" onClick={() => setIsOpen(false)}>
										<Settings className="mr-2 h-4 w-4" />
										Settings
									</Link>
								</Button>
								<Button
									className="w-full justify-start font-medium text-destructive hover:text-destructive"
									disabled={isSigningOut}
									onClick={() => {
										setIsOpen(false);
										signOut();
									}}
									variant="ghost"
								>
									{isSigningOut ? (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<LogOut className="mr-2 h-4 w-4" />
									)}
									Sign out
								</Button>
							</>
						) : (
							<div className="flex flex-col gap-4">
								<Button
									asChild
									className="w-full justify-start font-medium"
									disabled={isLoadingAuth && !!pendingPath}
									variant="ghost"
								>
									<Link
										href="/sign-in"
										onClick={(e) => {
											setIsOpen(false);
											if (isLoadingAuth) {
												e.preventDefault();
												setPendingPath("/sign-in");
											}
										}}
									>
										{pendingPath === "/sign-in" ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<LogIn className="mr-2 h-4 w-4" />
										)}
										Sign in
									</Link>
								</Button>
								<Button
									asChild
									className="w-full justify-start font-medium"
									disabled={isLoadingAuth && !!pendingPath}
								>
									<Link
										href="/sign-up"
										onClick={(e) => {
											setIsOpen(false);
											if (isLoadingAuth) {
												e.preventDefault();
												setPendingPath("/sign-up");
											}
										}}
									>
										{pendingPath === "/sign-up" ? (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										) : (
											<Rocket className="mr-2 h-4 w-4" />
										)}
										Get Started
									</Link>
								</Button>
							</div>
						)}
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
