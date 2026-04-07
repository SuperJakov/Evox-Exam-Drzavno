import { Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
			<div className="w-full max-w-md space-y-2">
				{/* Friendly Illustration/Icon */}
				<div className="flex justify-center">
					<div className="rounded-full bg-primary/10 p-6 ring-1 ring-primary/20">
						<Compass className="h-16 w-16 animate-pulse text-primary" />
					</div>
				</div>

				{/* User-Centric Copy */}
				<div className="space-y-4">
					<h1 className="font-extrabold text-4xl tracking-tight sm:text-5xl">
						Page Not Found
					</h1>
					<p className="text-lg text-muted-foreground">
						We can’t seem to find the page you’re looking for. It might have
						been moved, or the link might be broken.
					</p>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
					<Button asChild className="px-8" size="lg">
						<Link href="/">Take me home</Link>
					</Button>
				</div>

				{/* Subtle Footer Suggestion */}
				<p className="pt-8 text-muted-foreground/60 text-sm">
					If you think this is a mistake on our end, please let us know.
				</p>
			</div>
		</div>
	);
}
