"use client";

import { usePathname } from "next/navigation";
import { Activity } from "react";
import { HeaderContent } from "./header-content";

export function Header() {
	const pathname = usePathname();
	const shouldShowHeader = !pathname?.startsWith("/exams/take/");

	return (
		<Activity
			mode={shouldShowHeader ? "visible" : "hidden"}
			name="Header Activity"
		>
			<HeaderContent />
		</Activity>
	);
}
