import { useEffect, useState } from "react";

const ANALYTICS_BREAKPOINT = 530;

/**
 * Tracks whether the viewport is too narrow to display analytics tab in the exam page.
 *
 * Uses a media query against a fixed breakpoint of {@link ANALYTICS_BREAKPOINT} px.
 * The initial state is derived synchronously so there is no
 * layout flash on first render.
 *
 * @returns `true` when the viewport width is below the analytics breakpoint,
 *   `false` otherwise.
 */
export function useAnalyticsBreakpoint() {
	const [isUnsupported, setIsUnsupported] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;
		return window.matchMedia(`(max-width: ${ANALYTICS_BREAKPOINT - 1}px)`)
			.matches;
	});

	useEffect(() => {
		const mql = window.matchMedia(`(max-width: ${ANALYTICS_BREAKPOINT - 1}px)`);

		const onChange = (e: MediaQueryListEvent) => {
			setIsUnsupported(e.matches);
		};

		mql.addEventListener("change", onChange);

		// Final sync in case the environment changed between initialization and effect
		setIsUnsupported(mql.matches);

		return () => mql.removeEventListener("change", onChange);
	}, []);

	return isUnsupported;
}
