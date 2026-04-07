"use client";

import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useAtom } from "jotai";
import { AlertTriangle, Maximize } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { isFullscreenWarningOpenAtom } from "~/app/exams/take/[submissionId]/atoms";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";

interface CheatingTrackerProps {
	submissionId: Id<"submissions">;
	requireFullscreen?: boolean;
}

export function CheatingTracker({
	submissionId,
	requireFullscreen = true,
}: CheatingTrackerProps) {
	const logEvent = useMutation(
		api.exams.submission.studentMutations.logCheatingEvent,
	);
	const [showFullscreenWarning, setShowFullscreenWarning] = useAtom(
		isFullscreenWarningOpenAtom,
	);

	const isFullscreenSupported =
		typeof document !== "undefined" &&
		!!(
			document.fullscreenEnabled ||
			(document as Document & { webkitFullscreenEnabled?: boolean })
				.webkitFullscreenEnabled ||
			(document as Document & { mozFullScreenEnabled?: boolean })
				.mozFullScreenEnabled ||
			(document as Document & { msFullscreenEnabled?: boolean })
				.msFullscreenEnabled
		);

	const enterFullscreen = async () => {
		if (!isFullscreenSupported) {
			setShowFullscreenWarning(false);
			return;
		}
		try {
			const doc = document as Document & {
				webkitFullscreenElement?: Element;
				mozFullScreenElement?: Element;
				msFullscreenElement?: Element;
			};
			const fullScreenElement =
				doc.fullscreenElement ||
				doc.webkitFullscreenElement ||
				doc.mozFullScreenElement ||
				doc.msFullscreenElement;

			if (!fullScreenElement) {
				const el = document.documentElement as HTMLElement & {
					webkitRequestFullscreen?: () => Promise<void>;
					mozRequestFullScreen?: () => Promise<void>;
					msRequestFullscreen?: () => Promise<void>;
				};

				if (el.requestFullscreen) {
					await el.requestFullscreen();
				} else if (el.webkitRequestFullscreen) {
					await el.webkitRequestFullscreen();
				} else if (el.mozRequestFullScreen) {
					await el.mozRequestFullScreen();
				} else if (el.msRequestFullscreen) {
					await el.msRequestFullscreen();
				}
				setShowFullscreenWarning(false);
			}
		} catch (err) {
			console.error("Error attempting to enable full-screen mode:", err);
			toast.error("Please enable fullscreen mode to take the exam.");
		}
	};

	useEffect(() => {
		if (!requireFullscreen) return;

		// If fullscreen is not supported, just don't show the warning and skip FS logic
		if (!isFullscreenSupported) {
			setShowFullscreenWarning(false);
		}

		const handleVisibilityChange = () => {
			if (document.visibilityState === "hidden") {
				logEvent({
					submissionId,
					eventType: "tab_switch",
				});
				toast.warning("Tab switch detected. This has been logged.");
			}
		};

		const handleBlur = () => {
			logEvent({
				submissionId,
				eventType: "window_blur",
			});
			toast.warning("Window lost focus. This has been logged.");
		};

		const handleFullscreenChange = () => {
			const doc = document as Document & {
				webkitFullscreenElement?: Element;
				mozFullScreenElement?: Element;
				msFullscreenElement?: Element;
			};
			const isFS =
				doc.fullscreenElement ||
				doc.webkitFullscreenElement ||
				doc.mozFullScreenElement ||
				doc.msFullscreenElement;

			if (!isFS) {
				logEvent({
					submissionId,
					eventType: "exit_fullscreen",
				});
				setShowFullscreenWarning(true);
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("blur", handleBlur);

		if (isFullscreenSupported) {
			document.addEventListener("fullscreenchange", handleFullscreenChange);
			document.addEventListener(
				"webkitfullscreenchange",
				handleFullscreenChange,
			);
			document.addEventListener("mozfullscreenchange", handleFullscreenChange);
			document.addEventListener("msfullscreenchange", handleFullscreenChange);
		}

		// Attempt to start in fullscreen
		const startFullscreen = async () => {
			if (!isFullscreenSupported) {
				setShowFullscreenWarning(false);
				return;
			}
			try {
				const doc = document as Document & {
					webkitFullscreenElement?: Element;
					mozFullScreenElement?: Element;
					msFullscreenElement?: Element;
				};
				const isFS =
					doc.fullscreenElement ||
					doc.webkitFullscreenElement ||
					doc.mozFullScreenElement ||
					doc.msFullscreenElement;

				if (!isFS) {
					// Most browsers require a user interaction to trigger fullscreen
					// so we show a dialog if it fails or doesn't start
					setShowFullscreenWarning(true);
				}
			} catch (err) {
				console.error("Fullscreen fail", err);
			}
		};
		startFullscreen();

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("blur", handleBlur);
			if (isFullscreenSupported) {
				document.removeEventListener(
					"fullscreenchange",
					handleFullscreenChange,
				);
				document.removeEventListener(
					"webkitfullscreenchange",
					handleFullscreenChange,
				);
				document.removeEventListener(
					"mozfullscreenchange",
					handleFullscreenChange,
				);
				document.removeEventListener(
					"msfullscreenchange",
					handleFullscreenChange,
				);
			}

			if (requireFullscreen && isFullscreenSupported) {
				const doc = document as Document & {
					webkitFullscreenElement?: Element;
					mozFullScreenElement?: Element;
					msFullscreenElement?: Element;
					webkitExitFullscreen?: () => Promise<void>;
					mozCancelFullScreen?: () => Promise<void>;
					msExitFullscreen?: () => Promise<void>;
				};

				const isFS =
					doc.fullscreenElement ||
					doc.webkitFullscreenElement ||
					doc.mozFullScreenElement ||
					doc.msFullscreenElement;

				if (isFS) {
					if (doc.exitFullscreen) {
						doc.exitFullscreen().catch(() => {});
					} else if (doc.webkitExitFullscreen) {
						doc.webkitExitFullscreen();
					} else if (doc.mozCancelFullScreen) {
						doc.mozCancelFullScreen();
					} else if (doc.msExitFullscreen) {
						doc.msExitFullscreen();
					}
				}
			}
		};
	}, [
		submissionId,
		logEvent,
		setShowFullscreenWarning,
		requireFullscreen,
		isFullscreenSupported,
	]);

	return (
		<Dialog onOpenChange={() => {}} open={showFullscreenWarning}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-5 w-5" />
						Fullscreen Required
					</DialogTitle>
					<DialogDescription className="pt-2">
						This exam requires fullscreen mode to ensure a fair environment.
						Exiting fullscreen or switching windows is tracked and reported to
						the exam owner.
					</DialogDescription>
				</DialogHeader>
				<div className="rounded-lg bg-muted/50 p-4 text-muted-foreground text-sm">
					<p className="mb-1 font-semibold text-foreground">
						Important Notice:
					</p>
					Accidental exits or focus changes can happen. While these are logged,
					it's up to the professor to review the logs and decide if they
					indicate actual cheating.
				</div>
				<DialogFooter className="mt-4">
					<Button
						className="flex w-full items-center gap-2"
						onClick={enterFullscreen}
					>
						<Maximize className="h-4 w-4" />
						Enter Fullscreen
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
