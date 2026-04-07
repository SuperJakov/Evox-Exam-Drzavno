"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

export function ThemeToggle() {
	const { setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button className="h-9 w-9" size="icon" variant="ghost">
				<div className="h-4 w-4" />
			</Button>
		);
	}

	return (
		<Button
			className="h-9 w-9 transition-colors hover:bg-accent focus-visible:ring-1 focus-visible:ring-ring"
			onClick={() =>
				setTheme((oldTheme) => (oldTheme === "dark" ? "light" : "dark"))
			}
			size="icon"
			variant="ghost"
		>
			<Sun className="h-4 w-4 dark:hidden" />
			<Moon className="hidden h-4 w-4 dark:block" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
